"use client";
import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import WallGallery from "@/components/WallGallery";
import ArtworkSheet from "@/components/ArtworkSheet";
import CartDrawer from "@/components/CartDrawer";
import { WORKS } from "@/lib/data";
import type { Work } from "@/types/work";

export default function HomePage() {
  const [openWork, setOpenWork] = useState<Work | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState<{ work: Work; price: any }[]>([]);

  const handleBuy = (work: Work, price: any) => {
    setItems((prev) => [...prev, { work, price }]);
    setOpenWork(null);
    setCartOpen(true);
  };

  useEffect(() => {
    document.documentElement.classList.add("bg-neutral-950");
  }, []);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      <Hero
        onEnter={() =>
          document.getElementById("gallery")?.scrollIntoView({ behavior: "smooth" })
        }
      />

      {/* ✅ Galerie dynamique */}
      <WallGallery onOpen={(w: Work) => setOpenWork(w)} />


      {/* ✅ Fenêtre d'œuvre */}
      <ArtworkSheet
        work={openWork}
        onClose={() => setOpenWork(null)}
        onBuy={handleBuy}
      />

      {/* ✅ Panier */}
      {cartOpen && <CartDrawer items={items} onClose={() => setCartOpen(false)} />}
    </div>
  );
}
