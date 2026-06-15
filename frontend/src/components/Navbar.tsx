import { Link } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/60 border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative">
            <ShieldCheck className="w-7 h-7 text-primary" />
            <div className="absolute inset-0 blur-lg bg-primary/40 group-hover:bg-primary/70 transition-all" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            DeepGuard<span className="text-primary">.AI</span>
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/" activeOptions={{ exact: true }} activeProps={{ className: "text-primary" }} className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          <Link to="/how-it-works" activeProps={{ className: "text-primary" }} className="text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/about" activeProps={{ className: "text-primary" }} className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
        </nav>
        <Link
          to="/"
          hash="detector"
          className="inline-flex items-center px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:shadow-[0_0_30px_var(--primary)] transition-all"
        >
          Try Detector
        </Link>
      </div>
    </header>
  );
}
