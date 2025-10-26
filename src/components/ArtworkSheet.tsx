"use client";
import { motion, AnimatePresence } from "framer-motion";
import Button from "./ui/Button";
import { X } from "lucide-react";
import Card from "./ui/Card";
import { useRef } from "react";

type Price = {
  label: string;
  amount: number;
};

import type { Work } from "@/types/work";

type ArtworkSheetProps = {
  work: Work | null;
  onClose: () => void;
  onBuy: (work: Work, price: Price) => void;
};

export default function ArtworkSheet({ work, onClose, onBuy }: ArtworkSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  if (!work) return null;

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <AnimatePresence mode="wait">
      {work && (
        <>
          {/* 🌌 Overlay sombre avec halo doux */}
          <motion.div
            key={`${work.id}-overlay`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-40 bg-gradient-to-b from-black/95 via-black/85 to-black/95 backdrop-blur-[2px]"
            onClick={handleOverlayClick}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)] pointer-events-none" />
          </motion.div>

          {/* 🎨 Modale centrale */}
          <motion.div
            key={`${work.id}-sheet`}
            ref={sheetRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-[1000px] bg-neutral-950 rounded-2xl overflow-hidden border border-neutral-800 shadow-[0_0_80px_rgba(0,0,0,0.6)]">
              <Card className="overflow-hidden">
                <div className="grid md:grid-cols-2">
                  {/* 🖼️ Image encadrée */}
                  <motion.div
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative bg-neutral-900 p-6 flex items-center justify-center"
                  >
                    <div className="relative border-[6px] border-neutral-800 rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                      <img
                        src={work.src}
                        alt={work.title}
                        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent pointer-events-none" />
                    </div>
                  </motion.div>

                  {/* 📜 Détails */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-light text-neutral-100">{work.title}</h3>
                        <p className="text-sm text-neutral-400 mt-1">{work.location}</p>
                      </div>
                      <Button variant="ghost" onClick={onClose}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="mt-6 space-y-2">
                      {work.prices && work.prices.length > 0 ? (
                        work.prices.map((p: Price, i) => (
                          <motion.div
                            key={`sheet-${work.id}-${p.label}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                            className="flex items-center justify-between border border-neutral-800 rounded-xl p-3 hover:border-neutral-600 hover:bg-neutral-900/30 transition-all duration-300"
                          >
                            <div className="text-sm text-neutral-300">{p.label}</div>
                            <Button
                              onClick={() => onBuy(work, p)}
                              className="text-sm hover:scale-[1.03] transition-transform duration-300"
                            >
                              Acheter — {(p.amount / 100).toFixed(0)}€
                            </Button>
                          </motion.div>
                        ))
                      ) : (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.6 }}
                          className="text-neutral-500 text-sm italic mt-2"
                        >
                          Aucune offre disponible pour cette œuvre pour le moment.
                        </motion.div>
                      )}
                    </div>

                    <p className="mt-6 text-xs text-neutral-500">
                      Licence livrée en PDF. Téléchargement ou bon de tirage envoyé par e-mail.
                    </p>
                  </motion.div>
                </div>
              </Card>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
