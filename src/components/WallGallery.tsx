"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "./ui/Card";
import { WORKS as STATIC_WORKS } from "@/lib/data";
import type { Work } from "@/types/work";

type WallGalleryProps = {
  onOpen: (work: Work) => void;
};

export default function WallGallery({ onOpen }: WallGalleryProps) {
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [active, setActive] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [switching, setSwitching] = useState<boolean>(false);

  useEffect(() => {
    const loadWorks = async () => {
      try {
        const res = await fetch("/api/works", { cache: "no-store" });
        const jsonWorks = res.ok ? await res.json() : [];

        // 🧠 Fusion et normalisation tout de suite (alt + story)
        const combined = [...STATIC_WORKS, ...jsonWorks].map((w) => ({
          ...w,
          alt: w.alt ?? `Photographie ${w.title} - ${w.category}`,
          story: w.story ?? "",
        })) as Work[];

        setWorks(combined);

        const cats = [...new Set(combined.map((w) => w.category))];
        setCategories(cats);
        setActive(cats[0] || "");
        setLoading(false);
      } catch (err) {
        console.error("Erreur chargement œuvres :", err);
        const fallback = STATIC_WORKS as Work[];
        setWorks(fallback);
        const cats = [...new Set(fallback.map((w) => w.category))];
        setCategories(cats);
        setActive(cats[0] || "");
        setLoading(false);
      }
    };

    loadWorks();
  }, []);

  const grouped = works.reduce<Record<string, Work[]>>((acc, work) => {
    (acc[work.category] ??= []).push(work);
    return acc;
  }, {});

  const handleCategory = (cat: string) => {
    if (cat === active) return;
    setSwitching(true);
    setActive(cat);
  };

  useEffect(() => {
    if (!switching) return;
    const id = setTimeout(() => setSwitching(false), 250);
    return () => clearTimeout(id);
  }, [active, switching]);

  const noData =
    !loading &&
    !switching &&
    (!active || (grouped[active] ?? []).length === 0);

  return (
    <section id="gallery" className="bg-neutral-950 text-neutral-100 py-24">
      {/* 🧭 Navigation catégories */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategory(cat)}
            className={`px-6 py-2 rounded-full border text-sm 2xl:text-base tracking-widest uppercase transition-all duration-150 ${
              active === cat
                ? "bg-neutral-800 border-neutral-600 text-white shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                : "border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 🎞️ Galerie */}
      {loading || switching ? (
        <div className="flex justify-center py-28">
          <motion.div
            className="relative h-28 w-28"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <div className="absolute inset-0 rounded-full border-[3px] border-amber-400/70 blur-[0.3px]" />
            <motion.div
              className="absolute inset-3 rounded-full border border-neutral-700/60"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-950 rounded-full">
              <img
                src="/images/Logo_mmgimages.svg"
                alt="MMG Images"
                className="h-14 w-14 object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.6)]"
              />
            </div>
          </motion.div>
        </div>
      ) : noData ? (
        <div className="text-center text-neutral-500">Aucune œuvre trouvée pour le moment.</div>
      ) : (
      <div className="max-w-[clamp(1200px,90vw,1900px)] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12"
          >
            {(grouped[active] ?? []).map((work, i) => (
              <motion.div
                key={work.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.45 }}
                className="cursor-pointer group"
                onClick={() => onOpen(work)}
              >
                <Card className="relative overflow-hidden rounded-2xl border border-neutral-800 shadow-lg group-hover:shadow-[0_0_40px_rgba(255,255,255,0.08)] transition-all duration-500">
                  <div className="relative w-full bg-neutral-900 aspect-[4/3]">
                    <img
                      src={work.src}
                      alt={work.alt}
                      loading="lazy"
                      decoding="async"
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                      style={{ objectPosition: "0px -22px" }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-lg md:text-xl 2xl:text-2xl font-light">{work.title}</h3>
                    {work.location && (
                      <p className="text-xs md:text-sm 2xl:text-base text-neutral-400">{work.location}</p>
                    )}
                    {work.story && (
                      <p className="text-[11px] md:text-xs 2xl:text-sm text-neutral-400 italic mt-1 line-clamp-2">
                        {work.story}
                      </p>
                    )}
                  </div>
                  <span className="absolute bottom-2 right-3 text-[10px] font-serif text-neutral-400 opacity-70">
                    MMG Images
                  </span>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      )}
    </section>
  );
}
