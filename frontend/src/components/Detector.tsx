import { useRef, useState } from "react";
import { Upload, Loader2, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";

// Tipe data keluaran API + Sistem 3 Warna
type Result = {
  verdict: "authentic" | "suspicious" | "manipulated";
  fakeProb: number;
  realProb: number;
};

// Ambil API URL dari env variable, fallback ke HuggingFace jika tidak di-set
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export function Detector() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [famImage, setFamImage] = useState<string | null>(null);
  const [gradcamImage, setGradcamImage] = useState<string | null>(null);  

  const handleFile = async (file: File) => {
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);
    
    setResult(null);
    setFamImage(null);
    setGradcamImage(null);
    setScanning(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      const probFake = data.fake_probability;
      const probReal = data.real_probability;

      if (data.images) {
        if (data.images.fam_heatmap) setFamImage(data.images.fam_heatmap);
        if (data.images.gradcam_heatmap) setGradcamImage(data.images.gradcam_heatmap);
      }

      let currentVerdict: "authentic" | "suspicious" | "manipulated" = "authentic";
      if (probFake >= 0.75) {
        currentVerdict = "manipulated";
      } else if (probFake >= 0.40) {
        currentVerdict = "suspicious";
      }

      setResult({
        verdict: currentVerdict,
        fakeProb: probFake * 100,
        realProb: probReal * 100,
      });

    } catch (error) {
      console.error("Gagal menganalisis gambar:", error);
      alert("Gagal terhubung ke server AI. Pastikan server backend menyala.");
    } finally {
      setScanning(false);
    }
  };

  const getTheme = () => {
    switch (result?.verdict) {
      case "authentic": return { color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/40", icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />, label: "Wajah Asli" };
      case "suspicious": return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/40", icon: <AlertTriangle className="w-8 h-8 text-amber-500" />, label: "Mencurigakan" };
      case "manipulated": return { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/40", icon: <ShieldAlert className="w-8 h-8 text-rose-500" />, label: "Manipulasi AI" };
      default: return { color: "text-muted-foreground", bg: "bg-muted", border: "border-border", icon: null, label: "" };
    }
  };

  const theme = getTheme();

  return (
    <section id="detector" className="max-w-5xl mx-auto px-6 py-24 scroll-mt-20">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-4">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          RFM ARCHITECTURE ONLINE
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
          Unggah. Pindai. <span className="text-gradient">Verifikasi.</span>
        </h2>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Unggah foto wajah dan biarkan model RFM kami menganalisis pola manipulasi deepfake dalam hitungan detik.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* AREA UPLOAD */}
        <div
          onClick={() => !scanning && fileInput.current?.click()}
          className={`relative aspect-square rounded-2xl border-2 border-dashed border-border bg-card/40 backdrop-blur-sm ${!scanning ? 'cursor-pointer hover:border-primary' : 'cursor-wait'} overflow-hidden transition-all ${scanning ? "scan-line" : ""}`}
        >
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {preview ? (
            <img src={preview} alt="Uploaded" className="w-full h-full object-contain bg-black/20" />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Upload className="w-12 h-12 mb-4 text-primary" />
              <p className="font-medium">Klik untuk memilih gambar</p>
              <p className="text-xs mt-1 font-mono uppercase tracking-widest">JPG · PNG · WEBP</p>
            </div>
          )}
        </div>

        {/* AREA HASIL */}
        <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm p-6 flex flex-col">
          <h3 className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-4">Output Analisis</h3>

          {!preview && (
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground text-center px-6">
              Hasil deteksi akan muncul di sini setelah Anda mengunggah gambar wajah.
            </div>
          )}

          {scanning && (
            <div className="flex-1 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="font-mono text-sm text-primary">Menganalisis anomali piksel...</p>
            </div>
          )}

          {result && !scanning && (
            <div className="flex-1 flex flex-col justify-center">
              <div className={`rounded-xl p-5 mb-6 border ${theme.border} ${theme.bg} transition-colors duration-500`}>
                <div className="flex items-center gap-4">
                  {theme.icon}
                  <div>
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Status</p>
                    <p className={`text-xl font-bold ${theme.color}`}>
                      {theme.label}
                    </p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Kepastian</p>
                    <p className={`text-2xl font-bold font-mono ${theme.color}`}>
                      {Math.max(result.fakeProb, result.realProb).toFixed(1)}%
                    </p>
                  </div>
                </div>
                
                {result.verdict === "suspicious" && (
                  <p className="text-xs text-amber-500 mt-3 pt-3 border-t border-amber-500/20 leading-relaxed">
                    *Terdapat anomali ringan. Hal ini sering disebabkan oleh filter AI bawaan kamera HP (seperti Auto-HDR/Beautify) atau editan minor, bukan Face Swap utuh.
                  </p>
                )}
              </div>

              <div className="space-y-5 mb-6">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-muted-foreground">Probabilitas Manipulasi (Fake)</span>
                    <span className="text-rose-500 font-bold">{result.fakeProb.toFixed(2)}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div className="h-full rounded-full bg-rose-500 transition-all duration-1000 ease-out" style={{ width: `${result.fakeProb}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-2">
                    <span className="text-muted-foreground">Probabilitas Asli (Real)</span>
                    <span className="text-emerald-500 font-bold">{result.realProb.toFixed(2)}%</span>
                  </div>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden border border-border/50">
                    <div className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${result.realProb}%` }} />
                  </div>
                </div>
              </div>

              {famImage && gradcamImage && (
                <div className="pt-5 border-t border-border/50">
                  <h4 className="text-[10px] font-mono text-muted-foreground tracking-widest uppercase mb-3 text-center">Analisis Visual AI (XAI)</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col items-center bg-card/50 p-2 rounded-lg border border-cyan-500/20">
                      <span className="text-[10px] font-mono text-cyan-400 mb-2 tracking-wider">FAM Map</span>
                      <img 
                        src={famImage.startsWith('data:image') ? famImage : `data:image/png;base64,${famImage}`} 
                        alt="FAM" 
                        className="w-full h-auto rounded object-cover border border-border/50"
                      />
                    </div>
                    <div className="flex flex-col items-center bg-card/50 p-2 rounded-lg border border-purple-500/20">
                      <span className="text-[10px] font-mono text-purple-400 mb-2 tracking-wider">Grad-CAM</span>
                      <img 
                        src={gradcamImage.startsWith('data:image') ? gradcamImage : `data:image/png;base64,${gradcamImage}`} 
                        alt="Grad-CAM" 
                        className="w-full h-auto rounded object-cover border border-border/50"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}