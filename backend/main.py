from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import torch.nn.functional as F
import cv2
import numpy as np
import dlib
from PIL import Image
import torchvision.transforms as transforms
import base64
import matplotlib.pyplot as plt

# =============================================================================
# 1. SETUP FASTAPI
# =============================================================================
app = FastAPI(title="RFM Deepfake Detector API with XAI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =============================================================================
# 2. ARSITEKTUR MODEL
# =============================================================================
class SeparableConv2d(nn.Module):
    def __init__(self, in_ch, out_ch, k=1, stride=1, pad=0, dil=1, bias=False):
        super().__init__()
        self.dw = nn.Conv2d(in_ch, in_ch, k, stride, pad, dil, groups=in_ch, bias=bias)
        self.pw = nn.Conv2d(in_ch, out_ch, 1, 1, 0, 1, 1, bias=bias)
    def forward(self, x):
        return self.pw(self.dw(x))

class Block(nn.Module):
    def __init__(self, in_f, out_f, reps, strides=1, start_with_relu=True, grow_first=True):
        super().__init__()
        self.skip = None
        if out_f != in_f or strides != 1:
            self.skip   = nn.Conv2d(in_f, out_f, 1, stride=strides, bias=False)
            self.skipbn = nn.BatchNorm2d(out_f)
        rep, filters = [], in_f
        relu = nn.ReLU(inplace=True)
        if grow_first:
            rep += [nn.ReLU(inplace=False),
                    SeparableConv2d(in_f, out_f, 3, 1, 1),
                    nn.BatchNorm2d(out_f)]
            filters = out_f
        for _ in range(reps - 1):
            rep += [relu,
                    SeparableConv2d(filters, filters, 3, 1, 1),
                    nn.BatchNorm2d(filters)]
        if not grow_first:
            rep += [relu,
                    SeparableConv2d(in_f, out_f, 3, 1, 1),
                    nn.BatchNorm2d(out_f)]
        if not start_with_relu:
            rep = rep[1:]
        else:
            rep[0] = nn.ReLU(inplace=False)
        if strides != 1:
            rep.append(nn.MaxPool2d(3, strides, 1))
        self.rep = nn.Sequential(*rep)

    def forward(self, x):
        out  = self.rep(x)
        skip = self.skip(x) if self.skip is not None else x
        if self.skip is not None:
            skip = self.skipbn(skip)
        return out + skip

class Xception(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.conv1   = nn.Conv2d(3, 32, 3, 2, 0, bias=False)
        self.bn1     = nn.BatchNorm2d(32)
        self.relu    = nn.ReLU(inplace=True)
        self.conv2   = nn.Conv2d(32, 64, 3, bias=False)
        self.bn2     = nn.BatchNorm2d(64)
        self.block1  = Block(64,  128,  2, 2, start_with_relu=False, grow_first=True)
        self.block2  = Block(128, 256,  2, 2, grow_first=True)
        self.block3  = Block(256, 728,  2, 2, grow_first=True)
        self.block4  = Block(728, 728,  3, 1, grow_first=True)
        self.block5  = Block(728, 728,  3, 1, grow_first=True)
        self.block6  = Block(728, 728,  3, 1, grow_first=True)
        self.block7  = Block(728, 728,  3, 1, grow_first=True)
        self.block8  = Block(728, 728,  3, 1, grow_first=True)
        self.block9  = Block(728, 728,  3, 1, grow_first=True)
        self.block10 = Block(728, 728,  3, 1, grow_first=True)
        self.block11 = Block(728, 728,  3, 1, grow_first=True)
        self.block12 = Block(728, 1024, 2, 2, grow_first=False)
        self.conv3   = SeparableConv2d(1024, 1536, 3, 1, 1)
        self.bn3     = nn.BatchNorm2d(1536)
        self.conv4   = SeparableConv2d(1536, 2048, 3, 1, 1)
        self.bn4     = nn.BatchNorm2d(2048)
        self.fc      = nn.Linear(2048, num_classes)

    def features(self, x):
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.relu(self.bn2(self.conv2(x)))
        for blk in [self.block1,  self.block2,  self.block3,
                    self.block4,  self.block5,  self.block6,
                    self.block7,  self.block8,  self.block9,
                    self.block10, self.block11, self.block12]:
            x = blk(x)
        x = self.relu(self.bn3(self.conv3(x)))
        x = self.relu(self.bn4(self.conv4(x)))
        return x

    def logits(self, feat):
        x = F.adaptive_avg_pool2d(feat, (1, 1)).view(feat.size(0), -1)
        return self.fc(x)

    def forward(self, x):
        return self.logits(self.features(x))

class RFMDetector(nn.Module):
    def __init__(self, num_classes=2):
        super().__init__()
        self.backbone = Xception(num_classes=num_classes)

    def forward(self, data_dict):
        x    = data_dict['image']
        feat = self.backbone.features(x)
        cls  = self.backbone.logits(feat)
        prob = torch.softmax(cls, dim=1)[:, 1]
        return {'cls': cls, 'prob': prob, 'feat': feat}

# =============================================================================
# 3. ENGINE XAI (FAM & GRAD-CAM)
# =============================================================================
def compute_fam(model, tensor, device):
    inp = tensor.unsqueeze(0).to(device).requires_grad_(True)
    model.zero_grad()

    out = model({'image': inp})
    diff = (out['cls'][:, 1] - out['cls'][:, 0]).abs().sum()
    diff.backward()

    fam = inp.grad.abs().max(dim=1)[0].squeeze().detach().cpu().numpy()
    fam = (fam - fam.min()) / (fam.max() - fam.min() + 1e-8)
    return fam

def compute_gradcam(model, tensor, device, target_class=1):
    saved_feat = []
    saved_grad = []

    def fwd_hook(_, __, output):
        saved_feat.append(output.clone())
    def bwd_hook(_, __, grad_output):
        saved_grad.append(grad_output[0].clone())

    h_fwd = model.backbone.conv4.register_forward_hook(fwd_hook)
    h_bwd = model.backbone.conv4.register_full_backward_hook(bwd_hook)

    try:
        inp = tensor.unsqueeze(0).to(device)
        inp.requires_grad_(False)
        model.zero_grad()

        out   = model({'image': inp})
        score = out['cls'][0, target_class]
        score.backward()

        feat    = saved_feat[0]
        grads   = saved_grad[0]

        weights = grads.mean(dim=(2, 3), keepdim=True)
        cam     = (weights * feat).sum(dim=1).squeeze()
        cam     = F.relu(cam).detach().cpu().numpy()

        H, W    = tensor.shape[-2:]
        cam_up  = cv2.resize(cam, (W, H), interpolation=cv2.INTER_CUBIC)
        cam_up  = (cam_up - cam_up.min()) / (cam_up.max() - cam_up.min() + 1e-8)

    finally:
        h_fwd.remove()
        h_bwd.remove()

    return cam_up

def to_heatmap(arr, cmap='hot'):
    return plt.get_cmap(cmap)(arr)[:, :, :3]

def blend(face_rgb, heatmap, alpha=0.45):
    return np.clip((1 - alpha) * face_rgb + alpha * heatmap, 0, 1)

def encode_image_to_base64(img_array):
    if img_array.dtype == np.float32 or img_array.dtype == np.float64:
        img_array = (img_array * 255).astype(np.uint8)
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.png', img_bgr)
    return base64.b64encode(buffer).decode('utf-8')

# =============================================================================
# 4. INISIALISASI MODEL & DLIB
# =============================================================================
LANDMARK_PATH = 'shape_predictor_68_face_landmarks.dat'
WEIGHTS_PATH = 'rfm_finetuned_mixed.pth'

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

_face_detector      = dlib.get_frontal_face_detector()
try:
    _landmark_predictor = dlib.shape_predictor(LANDMARK_PATH)
except Exception as e:
    print(f"Warning: Landmark predictor gagal dimuat dari {LANDMARK_PATH}")
    _landmark_predictor = None

_LEFT_EYE  = list(range(36, 42))
_RIGHT_EYE = list(range(42, 48))
_NOSE      = list(range(27, 36))
_normalize = transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])
_to_tensor = transforms.ToTensor()

def _get_landmarks(img_bgr):
    gray  = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    faces = _face_detector(gray, 1)
    if len(faces) == 0:
        faces = _face_detector(gray, 2)
    if len(faces) == 0:
        return None, None
    face  = max(faces, key=lambda r: r.width() * r.height())
    if _landmark_predictor is None:
        return None, face
    shape = _landmark_predictor(gray, face)
    lm    = np.array([[shape.part(i).x, shape.part(i).y]
                      for i in range(shape.num_parts)], dtype=np.float32)
    return lm, face

def _affine_align(img_bgr, lm, size=256):
    src = np.float32([lm[_LEFT_EYE].mean(0), lm[_RIGHT_EYE].mean(0), lm[_NOSE].mean(0)])
    dst = np.float32([
        [0.35*size, 0.35*size], [0.65*size, 0.35*size], [0.50*size, 0.55*size]
    ])
    M = cv2.getAffineTransform(src, dst)
    return cv2.warpAffine(img_bgr, M, (size, size),
                          flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)

def _fallback_crop(img_bgr, face_rect, size=256, margin=0.4):
    x1, y1 = face_rect.left(), face_rect.top()
    x2, y2 = face_rect.right(), face_rect.bottom()
    w, h   = x2-x1, y2-y1
    mx, my = int(w*margin), int(h*margin)
    x1 = max(0, x1-mx); y1 = max(0, y1-my)
    x2 = min(img_bgr.shape[1], x2+mx)
    y2 = min(img_bgr.shape[0], y2+my)
    return cv2.resize(img_bgr[y1:y2, x1:x2], (size, size), interpolation=cv2.INTER_LINEAR)

def preprocess_face_from_buffer(img_bgr, size=256):
    """Fungsi yang sepadan dengan versi notebook, menggunakan memori"""
    lm, face_rect = _get_landmarks(img_bgr)
    if lm is not None:
        try:
            face_bgr = _affine_align(img_bgr, lm, size)
        except Exception:
            face_bgr = _fallback_crop(img_bgr, face_rect, size)
    elif face_rect is not None:
        face_bgr = _fallback_crop(img_bgr, face_rect, size)
    else:
        face_bgr = cv2.resize(img_bgr, (size, size), interpolation=cv2.INTER_LINEAR)
    face_rgb = cv2.cvtColor(face_bgr, cv2.COLOR_BGR2RGB)
    tensor = _normalize(_to_tensor(Image.fromarray(face_rgb)))
    return tensor

rfm_model = RFMDetector(num_classes=2)
try:
    ckpt  = torch.load(WEIGHTS_PATH, map_location='cpu')
    sd    = ckpt.get('model', ckpt.get('state_dict', ckpt.get('net', ckpt))) if isinstance(ckpt, dict) else ckpt
    sd    = {k.replace('module.', ''): v for k, v in sd.items()}
    rfm_model.load_state_dict(sd, strict=False)
    rfm_model.to(device)
    rfm_model.eval()
except Exception as e:
    print(f"Warning: Model weights gagal dimuat.")

# =============================================================================
# 5. ENDPOINT INFERENCE & XAI
# =============================================================================
@app.post("/predict")
async def predict_deepfake(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img_bgr is None:
        raise HTTPException(status_code=400, detail="File gambar tidak valid.")

    # 1. Preprocessing (sama macam di Kaggle)
    tensor = preprocess_face_from_buffer(img_bgr, size=256)
    tensor = tensor.to(device)

    # Convert tensor kembali ke NumPy float RGB [0,1] untuk blending, sepadan dgn notebook
    face_np = (tensor.permute(1, 2, 0).cpu().numpy() * 0.5 + 0.5).clip(0, 1)

    # 2. Prediksi
    rfm_model.eval()
    with torch.no_grad():
        out = rfm_model({'image': tensor.unsqueeze(0)})
        fake_prob = torch.softmax(out['cls'], dim=1)[0, 1].item()
        real_prob = 1.0 - fake_prob

    # 3. Tetapkan Threshold
    THRESHOLD = 0.29
    is_fake = fake_prob >= THRESHOLD
    label = 'FAKE' if is_fake else 'REAL'
    
    # 4. Ekstraksi XAI Maps
    rfm_model.eval()
    torch.set_grad_enabled(True)
    
    fam_norm = compute_fam(rfm_model, tensor, device)
    
    # Target class sentiasa dipaksa ke '1' (FAKE) macam di dalam Notebook
    target_cls = 1 
    gcam_norm = compute_gradcam(rfm_model, tensor, device, target_class=target_cls)
    
    torch.set_grad_enabled(False)
    rfm_model.eval()

    # 5. Heatmap + Overlay
    ALPHA_OVERLAY = 0.45
    hm_fam  = to_heatmap(fam_norm,  cmap='hot')
    hm_gcam = to_heatmap(gcam_norm, cmap='jet')
    
    ov_fam  = blend(face_np, hm_fam,  ALPHA_OVERLAY)
    ov_gcam = blend(face_np, hm_gcam, ALPHA_OVERLAY)

    # 6. Konversi ke Base64
    face_aligned_b64 = encode_image_to_base64(face_np)
    fam_overlay_b64 = encode_image_to_base64(ov_fam)
    gcam_overlay_b64 = encode_image_to_base64(ov_gcam)
    
    # 7. Hantar respons JSON
    return JSONResponse(content={
        "label": label,
        "is_fake": is_fake,
        "fake_probability": fake_prob,
        "real_probability": real_prob,
        "images": {
            "face_aligned": face_aligned_b64,
            "fam_heatmap": fam_overlay_b64,
            "gradcam_heatmap": gcam_overlay_b64
        }
    })