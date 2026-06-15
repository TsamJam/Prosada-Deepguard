import heroImg from "@/assets/hero-detector.jpg";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-6">
            <Sparkles className="w-3 h-3" />
            RFM Architecture · Evaluated on DF40
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[0.95]">
            Deteksi <span className="text-gradient">Face Swap</span> sebelum ia menipumu.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
            Sistem forensik digital berbasis model Representative Forgery Mining (RFM). Menganalisis anomali tingkat piksel dan artefak pembauran (blending) untuk membongkar manipulasi wajah sintetis.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#detector"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-semibold hover:shadow-[0_0_40px_var(--primary)] transition-all"
            >
              Coba Sekarang Gratis
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-card/40 backdrop-blur-sm font-medium hover:border-primary/50 transition-all"
            >
              Lihat cara kerjanya
            </a>
          </div>
          <div className="mt-10 flex gap-8 font-mono text-sm">
            <div>
              <div className="text-2xl font-bold text-foreground">DF40</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Dataset Evaluasi</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">RFM</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Arsitektur Model</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">ITS</div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">Basis Riset</div>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-tr from-primary/30 to-accent/30 blur-3xl opacity-50" />
          <div className="relative rounded-3xl overflow-hidden border border-border shadow-[var(--shadow-elegant)]">
            <img
              src={heroImg}
              alt="Neural face mesh visualization for AI detection"
              width={1536}
              height={1024}
              className="w-full h-auto"
            />
            <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-primary/30 text-xs font-mono text-primary flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              SCANNING · RFM NODES
            </div>
            <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-accent/30 text-xs font-mono text-accent">
              PIXEL ANOMALY: DETECTED
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}