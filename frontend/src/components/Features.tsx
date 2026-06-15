import { BrainCircuit, Zap, Lock, ImageMinus } from "lucide-react";

const features = [
  {
    name: "Neural Mesh Analysis",
    description: "12.000+ landmark wajah dianalisis lewat ensemble CNN + Vision Transformer.",
    icon: BrainCircuit,
  },
  {
    name: "Real-time Detection",
    description: "Hasil deteksi dalam < 3 detik. API latency rata-rata 240ms global.",
    icon: Zap,
  },
  {
    // --- UPDATE: Penyesuaian Privasi ---
    name: "Privacy Focused",
    description: "Gambar diproses dengan aman. Kami tidak menyimpan data apa pun kecuali Anda secara sadar memberikan persetujuan (consent) untuk mengirimkan laporan evaluasi.",
    icon: Lock,
  },
  {
    // --- UPDATE: Penyesuaian Kemampuan Gambar ---
    name: "RFM Image Forensics",
    description: "Mendeteksi jejak face swap, artefak GAN, dan anomali blending piksel secara spesifik pada gambar dan foto statis.",
    icon: ImageMinus, // Menggunakan ikon Image dari Lucide
  },
];

export function Features() {
  return (
    <section className="py-24 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h3 className="text-[11px] font-mono text-primary tracking-[0.2em] uppercase mb-4">
            Capabilities
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Dibangun untuk era <span className="text-gradient">manipulasi sintetis.</span>
          </h2>
        </div>

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div 
              key={feature.name} 
              className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)] hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mb-6">
                <feature.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="text-lg font-bold mb-3 text-foreground tracking-wide">
                {feature.name}
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}