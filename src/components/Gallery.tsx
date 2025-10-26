"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Card from "./ui/Card";

export default function Gallery({ onOpen }: { onOpen: (work: any) => void }) {
  const [works, setWorks] = useState<any[]>([]);

  useEffect(() => {
    fetch("/works.json")
      .then((res) => res.json())
      .then(setWorks)
      .catch((err) => console.error("Erreur de chargement des œuvres :", err));
  }, []);

  return (
    <div id="gallery" className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium text-neutral-200">Galerie</h2>
        <div className="text-sm text-neutral-400">Scroll horizontal</div>
      </div>
      <div className="mt-6 overflow-x-auto no-scrollbar">
        <div className="flex gap-6 pr-12">
          {works.length === 0 && (
            <div className="text-neutral-500 text-sm">
              Aucune image pour l’instant. Ajoutez-en depuis l’admin.
            </div>
          )}
          {works.map((w) => (
            <motion.button
              key={w.id}
              onClick={() => onOpen(w)}
              whileHover={{ y: -4 }}
              className="relative shrink-0"
              style={{ width: 420 }}
            >
              <Card className="overflow-hidden">
                <div className="relative" style={{ aspectRatio: w.aspect || 4 / 3 }}>
                  <img
                    src={w.src}
                    alt={w.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="text-lg text-neutral-100 font-medium drop-shadow">
                      {w.title}
                    </div>
                    <div className="text-xs text-neutral-400">{w.location}</div>
                  </div>
                </div>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
