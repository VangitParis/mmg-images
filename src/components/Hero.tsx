"use client";
import { motion } from "framer-motion";
import Button from "./ui/Button";
import { WORKS } from "../lib/data";

export default function Hero({ onEnter }: { onEnter: () => void }) {
  const feature = WORKS[0]; // renard fox.jpg

  return (
    <div className="relative overflow-hidden h-[70vh] md:h-[75vh]">
      <motion.img
        src={feature.src}
        alt={feature.alt || feature.title}
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        initial={{ scale: 1.05, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 w-full h-full object-cover bg-neutral-950 opacity-75"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent" />

      <div className="absolute bottom-3 md:bottom-10 left-4 md:left-12 right-4 md:right-auto">
        <div className="text-4xl md:text-5xl 2xl:text-7xl font-light text-neutral-200 drop-shadow">
          Regards Sauvages
        </div>
        <div className="mt-2 text-sm md:text-base 2xl:text-lg text-neutral-300 max-w-2xl">
          Une collection d’instants suspendus
        </div>
        <div className="mt-3 text-xs md:text-sm 2xl:text-base text-neutral-400 tracking-wide">
          {feature.title} {feature.location ? `— ${feature.location}` : ""}
        </div>
        <Button onClick={onEnter} className="mt-4">
          Entrer dans la galerie
        </Button>
      </div>
    </div>
  );
}
