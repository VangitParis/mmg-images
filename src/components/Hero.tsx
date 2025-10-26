"use client";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import { WORKS } from "../lib/data";

export default function Hero({ onEnter }: { onEnter: () => void }) {
  const feature = WORKS[0];
  return (
    <div className="relative overflow-hidden">
      <motion.img
        src={feature.src}
        alt={feature.title}
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="w-full h-[70vh] object-cover opacity-70"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />
      <div className="absolute bottom-10 left-6 md:left-12">
        <div className="text-5xl font-light text-neutral-200 drop-shadow">Regards Sauvages</div>
        <div className="mt-2 text-neutral-400">Une collection d’instants suspendus</div>
        <Button onClick={onEnter} className="mt-4 ">Entrer dans la galerie</Button>
      </div>
    </div>
  );
}
