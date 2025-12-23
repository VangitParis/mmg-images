"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const [pages, setPages] = useState<{ slug: string; title: string }[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/pages", { cache: "no-store" });
        const data = await res.json();

        // ✅ On garde "mentions-legales", mais on exclut "about"
        const filtered = data.filter(
          (p: any) => p.slug !== "about" // la page À propos reste dans la Navbar
        );
        setPages(filtered);
      } catch (err) {
        console.error("Erreur chargement pages footer:", err);
      }
    };
    load();
  }, []);

  return (
    <footer className="bg-neutral-950 border-t border-neutral-800 text-neutral-400 py-10 px-6 mt-24">
      <div className="max-w-[clamp(1200px,85vw,1800px)] mx-auto flex flex-col sm:flex-row justify-between gap-10 px-2 lg:px-6">
        {/* Bloc gauche — identité */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="h-[80px] w-[80px] md:h-[80px] md:w-[70px] lg:h-[88px] lg:w-[88px] 2xl:h-[120px] 2xl:w-[120px] rounded-full  backdrop-blur-sm flex items-center justify-center shadow-[0_10px_26px_rgba(0,0,0,0.45)]">
              <img
                src="/images/Logo_mmgimages.svg"
                alt="MMG Images"
                className="h-[80px] w-[80px] md:h-[78px] md:w-[78px] lg:h-[98px] lg:w-[98px] 2xl:h-[130px] 2xl:w-[130px] object-contain drop-shadow-[0_0_6px_rgba(0,0,0,0.5)]"
              />
            </span>
            <h3 className="text-lg md:text-xl 2xl:text-2xl text-neutral-100 leading-tight">
              MMG <span className="text-amber-300">Images</span>
            </h3>
            
          </div>
          <p className="text-sm md:text-base 2xl:text-lg max-w-xs leading-relaxed">
            Photographies animalières capturées avec patience et lumière naturelle.
          </p>

          {/* Réseaux sociaux */}
          <div className="flex items-center gap-4 mt-4">
            <a
              href="https://www.instagram.com/mmg.images"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-amber-300 transition-colors"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="https://www.facebook.com/mmg_images"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-500 hover:text-amber-300 transition-colors"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
          </div>
        </div>

        {/* Bloc central — pages */}
        <div>
          <h4 className="text-sm md:text-base 2xl:text-lg text-amber-300 mb-3 tracking-wide uppercase">
            Pages du site
          </h4>
          <ul className="space-y-2">
            {pages.length === 0 && (
              <li className="text-neutral-600 text-sm">Aucune page disponible</li>
            )}
            {pages.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/${p.slug}`}
                  className="hover:text-amber-300 transition-colors text-sm md:text-base"
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Bloc droit — signature */}
        <div className="text-sm md:text-base 2xl:text-lg text-neutral-500 sm:text-right space-y-1">
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-amber-400">MMG Images</span>
          </p>
          <p className="text-neutral-600">Tous droits réservés.</p>
          <Link
            href="/mentions-legales"
            className="text-neutral-500 hover:text-amber-300 text-xs md:text-sm transition-colors"
          >
            Mentions légales
          </Link>
        </div>
      </div>
    </footer>
  );
}
