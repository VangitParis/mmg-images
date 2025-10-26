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
      } catch (err) {
        console.error("Erreur chargement œuvres :", err);
        setWorks(STATIC_WORKS as Work[]);
      }
    };

    loadWorks();
  }, []);

  const grouped = works.reduce<Record<string, Work[]>>((acc, work) => {
    (acc[work.category] ??= []).push(work);
    return acc;
  }, {});

  if (!active) {
    return (
      <section id="gallery" className="bg-neutral-950 text-neutral-100 py-24">
        <div className="text-center text-neutral-500">
          Aucune œuvre trouvée pour le moment.
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="bg-neutral-950 text-neutral-100 py-24">
      {/* 🧭 Navigation catégories */}
      <div className="flex flex-wrap justify-center gap-4 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-6 py-2 rounded-full border text-sm tracking-widest uppercase transition-all duration-300 ${
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
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 px-12"
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
                <img
                  src={work.src}
                  alt={work.alt}
                  loading="lazy"
                  decoding="async"
                  className="object-cover w-full h-[380px] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-lg font-light">{work.title}</h3>
                  {work.location && (
                    <p className="text-xs text-neutral-400">{work.location}</p>
                  )}
                  {work.story && (
                    <p className="text-[11px] text-neutral-400 italic mt-1 line-clamp-2">
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
    </section>
  );
}
