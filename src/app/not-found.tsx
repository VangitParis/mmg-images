// src/app/not-found.tsx
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Page introuvable — MMG Images",
  description:
    "Vous avez quitté le sentier. Retrouvez la galerie de MMG Images, photographie animalière.",
};

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-neutral-950 to-neutral-900 text-neutral-100 flex flex-col items-center justify-center px-4">
      {/* Bandeau forêt */}
      <div className="relative w-full h-[45vh] sm:h-[55vh] lg:h-[65vh] mb-12 rounded-none sm:rounded-2xl overflow-hidden border border-neutral-800 shadow-2xl shadow-black/60">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10" />
        <Image
  src="/images/404_lynx.webp"
  alt="Rencontre sauvage - MMG Images"
  fill
  className="object-cover"
  priority
/>
        <div className="relative z-20 h-full flex flex-col justify-end p-6">
          <p className="text-sm tracking-[0.25em] uppercase text-amber-300/80">
            Hors du sentier
          </p>
          <h1 className="text-3xl sm:text-4xl font-light">
            404 — Animal introuvable
          </h1>
        </div>
      </div>

      {/* Texte */}
      <section className="max-w-xl text-center space-y-4">
        <p className="text-neutral-300 leading-relaxed">
          Tu as quitté le sentier balisé.  
          L’animal que tu cherches n’habite pas cette page.
        </p>
        <p className="text-neutral-500 text-sm leading-relaxed">
          Parfois, même en affût, on revient bredouille.  
          Mais la forêt est vaste, et d’autres rencontres t’attendent dans la galerie.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            href="/"
            className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Retour à la galerie
          </Link>
          <Link
            href="/contact"
            className="border border-neutral-700 hover:border-neutral-500 px-6 py-3 rounded-lg text-sm text-neutral-200 hover:bg-neutral-900/60 transition-colors"
          >
            Me contacter
          </Link>
        </div>

        <p className="text-xs text-neutral-600 mt-6">
          MMG Images — Photographie animalière & instants volés en forêt.
        </p>
      </section>
    </main>
  );
}
