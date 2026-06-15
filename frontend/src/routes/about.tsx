import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — DeepGuard.AI" },
      { name: "description", content: "Misi DeepGuard.AI: melindungi integritas visual lewat riset mahasiswa Sains Data ITS." },
      { property: "og:title", content: "About — DeepGuard.AI" },
      { property: "og:description", content: "Pengembangan model deteksi deepfake berbasis arsitektur RFM." },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-3">About the Project</p>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-8">
          Menjaga <span className="text-gradient">kebenaran</span>, satu wajah pada satu waktu.
        </h1>
        <div className="prose prose-invert max-w-none space-y-6 text-lg text-muted-foreground leading-relaxed">
          <p>
            DeepGuard.AI lahir sebagai inisiatif penelitian mahasiswa semester 6 program studi Sains Data di Institut Teknologi Sepuluh Nopember (ITS), Surabaya. Proyek ini dikembangkan untuk menjawab tantangan ancaman manipulasi wajah yang semakin canggih.
          </p>
          <p>
            Sebagai bagian dari mata kuliah Proyek Sains Data, sistem ini dirancang dengan fokus pada ketelitian forensik digital. Kami mengimplementasikan arsitektur <strong>Representative Forgery Mining (RFM)</strong> untuk menggali anomali pada tingkat piksel yang sering kali luput dari penglihatan manusia.
          </p>
          <p>
            Model kami dilatih dan dievaluasi secara ketat menggunakan dataset standar industri <strong>DF40</strong>. Melalui riset ini, kami berkomitmen untuk menyediakan alat verifikasi yang transparan dan akurat bagi publik guna menjaga kepercayaan terhadap konten visual di era digital.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-3 gap-4">
          {[
            { num: "DF40", label: "Dataset Evaluasi" },
            { num: "ITS", label: "Basis Riset" },
            { num: "RFM", label: "Arsitektur Inti" },
          ].map((s) => (
            <div key={s.label} className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm text-center">
              <div className="text-4xl font-bold text-gradient mb-1">{s.num}</div>
              <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}