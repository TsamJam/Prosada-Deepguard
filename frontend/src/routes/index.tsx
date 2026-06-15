import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Detector } from "@/components/Detector";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeepGuard.AI — Face Swap & Deepfake Detector" },
      { name: "description", content: "Deteksi gambar face swap dan deepfake dalam 3 detik dengan akurasi 99.4%. Engine neural multi-modal." },
      { property: "og:title", content: "DeepGuard.AI — Face Swap Detector" },
      { property: "og:description", content: "Bongkar wajah palsu hasil AI generatif. Analisis 12.000+ titik data per gambar." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Detector />
      </main>
      <Footer />
    </div>
  );
}
