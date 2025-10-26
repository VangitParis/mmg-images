"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function ArtworkModal({
  work,
  onClose,
}: {
  work: any;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          className="relative max-w-5xl w-[90vw] h-[80vh] overflow-hidden rounded-2xl shadow-2xl border border-neutral-800"
        >
          <img
            src={work.src}
            alt={work.title}
            className="w-full h-full object-cover"
          />
          <button
            className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            onClick={onClose}
          >
            <X size={28} />
          </button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
            <h3 className="text-2xl font-light text-neutral-100">
              {work.title}
            </h3>
            <p className="text-sm text-neutral-400">{work.location}</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
