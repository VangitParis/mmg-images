"use client";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ArtworkModal({
  work,
  onClose,
}: {
  work: any;
  onClose: () => void;
}) {
  const previewUrl = useMemo(() => {
    if (!work?.src) return "";
    const u = encodeURIComponent(work.src);
    const t = encodeURIComponent(work?.title ?? "MMG Images");
    return `/api/preview?url=${u}&title=${t}`;
  }, [work]);

  if (!work) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-start justify-center overflow-y-auto p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="relative w-full max-w-5xl bg-black/90 rounded-2xl shadow-2xl border border-neutral-800 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute top-4 right-4 z-20 h-10 w-10 rounded-full bg-black/60 text-neutral-300 hover:text-white flex items-center justify-center"
            onClick={onClose}
            aria-label="Fermer"
          >
            <X size={18} />
          </button>

          <div className="flex flex-col">
            <div className="relative w-full">
              <img
                src={previewUrl}
                alt={work.title}
                className="w-full h-auto max-h-[70vh] object-contain select-none"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="p-5 space-y-3">
              <h3 className="text-2xl font-light text-neutral-100">{work.title}</h3>
              {work.location && (
                <p className="text-sm text-neutral-400">{work.location}</p>
              )}
              {work.story && (
                <p className="text-sm text-neutral-300 leading-relaxed whitespace-pre-line">
                  {work.story}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
