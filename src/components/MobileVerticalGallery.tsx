"use client";
import { useEffect, useState } from "react";
import type { Work } from "@/types/work";
import { WORKS as STATIC_WORKS } from "@/lib/data";

type Props = { onOpen: (work: Work) => void };

const normalizeCategory = (value: string) => {
  const trimmed = value?.trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export default function MobileVerticalGallery({ onOpen }: Props) {
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [active, setActive] = useState<string>("all");
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/works", { cache: "no-store" });
        const json = res.ok ? await res.json() : [];
        const combinedRaw =
          json && Array.isArray(json) && json.length > 0 ? json : STATIC_WORKS;
        const combined = combinedRaw.map((w: any) => ({
          ...w,
          alt: w.alt ?? `Photographie ${w.title} - ${w.category}`,
          story: w.story ?? "",
          category: normalizeCategory(w.category || ""),
        })) as Work[];
        setWorks(combined);
        const cats = Array.from(
          new Map(
            combined.map((w) => [w.category.toLowerCase(), w.category])
          ).values()
        );
        setCategories(cats);
      } catch (err) {
        console.error("Erreur chargement œuvres mobile:", err);
        setWorks(STATIC_WORKS as Work[]);
      }
    };
    load();
  }, []);

  const toggleLike = (id: string) => {
    if (liked[id]) return; // pas de dislike, like reste
    setLiked((prev) => ({ ...prev, [id]: true }));
  };

  const filtered =
    active === "all"
      ? works
      : works.filter((w) => w.category.toLowerCase() === active.toLowerCase());

  return (
    <div className="bg-neutral-950 text-neutral-100 h-screen flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActive("all")}
          className={`px-4 py-2 rounded-full text-xs border transition ${
            active === "all"
              ? "bg-neutral-800 border-neutral-600 text-white"
              : "border-neutral-700 text-neutral-300"
          }`}
        >
          Toutes
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-4 py-2 rounded-full text-xs border transition ${
              active === cat
                ? "bg-neutral-800 border-neutral-600 text-white"
                : "border-neutral-700 text-neutral-300"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div
        id="gallery"
        className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory bg-neutral-950"
      >
        {filtered.map((work) => (
        <article
          key={work.id}
          className="relative h-screen w-full snap-start flex flex-col"
          onClick={() => onOpen(work)}
        >
          <img
            src={work.src}
            alt={work.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none" />
          <div className="mt-auto relative z-10 p-5 space-y-2">
            <h3 className="text-2xl font-light drop-shadow">{work.title}</h3>
            {work.location && (
              <p className="text-sm text-neutral-300">{work.location}</p>
            )}
            {work.story && (
              <p className="text-xs text-neutral-300 line-clamp-3">
                {work.story}
              </p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleLike(work.id);
            }}
            className={`absolute bottom-6 right-6 h-12 w-12 rounded-full flex items-center justify-center text-xl transition transform ${
              liked[work.id]
                ? "bg-amber-400 text-black scale-105"
                : "bg-black/50 border border-white/20 text-white hover:scale-110"
            }`}
            aria-label="J'aime"
          >
            🐾
          </button>
        </article>
        ))}
      </div>
    </div>
  );
}
