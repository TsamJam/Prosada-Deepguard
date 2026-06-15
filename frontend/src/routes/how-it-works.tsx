import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Upload, Cpu, Microscope, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — DeepGuard.AI" },
      { name: "description", content: "Pelajari bagaimana arsitektur RFM mendeteksi manipulasi wajah tingkat piksel melalui 4 tahap." },
      { property: "og:title", content: "How It Works — DeepGuard.AI" },
      { property: "og:description", content: "Empat tahap analisis forensik: Prapemrosesan, Ekstraksi RFM, Deteksi Artefak, dan Klasifikasi Akhir." },
    ],
  }),
  component: HowItWorks,
});

// --- UPDATE: Menyesuaikan Pipeline Asli Proyek Anda ---
const steps = [
  { 
    icon: Upload, 
    title: "1. Prapemrosesan Gambar", 
    desc: "Gambar wajah statis (JPG/PNG/WEBP) diunggah pengguna dan dikirim secara aman ke server inferensi API backend kami." 
  },
  { 
    icon: Cpu, 
    title: "2. Ekstraksi Fitur RFM", 
    desc: "Menggunakan arsitektur Representative Forgery Mining (RFM) untuk mengekstrak fitur wajah dan mengisolasi manipulasi tingkat piksel yang tidak terlihat oleh mata manusia." 
  },
  { 
    icon: Microscope, // Mengganti ikon agar lebih pas dengan konsep forensik
    title: "3. Analisis Artefak AI", 
    desc: "Model memindai anomali spesifik seperti artefak dari GAN, ketidakkonsistenan tekstur, dan batas pembauran (blending artifacts) hasil face swap." 
  },
  { 
    icon: ShieldCheck, 
    title: "4. Klasifikasi 3 Tingkat", 
    desc: "Probabilitas akhir (Real vs Fake) dihitung untuk menentukan 3 status: Wajah Asli, Mencurigakan (indikasi filter kamera/HDR), atau Manipulasi AI (Deepfake)." 
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">Model Pipeline</p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">
          Anatomi sebuah <span className="text-gradient">deteksi</span>.
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-16 leading-relaxed">
          Setiap gambar yang masuk dianalisis melalui alur kerja forensik digital yang terstruktur. Kami tidak menggunakan heuristik sederhana, melainkan <i>Deep Learning</i> mutakhir yang dievaluasi menggunakan dataset DF40.
        </p>

        <div className="space-y-4">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative p-8 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all flex gap-6 items-start"
            >
              <div className="w-14 h-14 shrink-0 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center transition-transform group-hover:scale-110">
                <s.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
              <div className="ml-auto font-mono text-xs text-muted-foreground hidden md:block group-hover:text-primary transition-colors">
                STEP {String(i + 1).padStart(2, "0")}
              </div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}