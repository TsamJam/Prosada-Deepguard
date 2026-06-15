import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 mt-32">
      <div className="max-w-7xl mx-auto px-6 py-12 grid md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="w-6 h-6 text-primary" />
            <span className="font-bold tracking-tight">DeepGuard.AI</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            Pertahanan terdepan melawan manipulasi wajah AI. Deteksi face swap & deepfake dalam hitungan detik.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Produk</h4>
          <ul className="space-y-2 text-sm">
            <li>API Detector</li>
            <li>Browser Extension</li>
            <li>Enterprise SDK</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Kontak</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>hello@deepguard.ai</li>
            <li>Jakarta, Indonesia</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground">
        © 2026 DeepGuard.AI — Securing reality, frame by frame.
      </div>
    </footer>
  );
}
