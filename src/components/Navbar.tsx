"use client";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingCart, Menu, X } from "lucide-react";
import Button from "./ui/Button";

type NavbarProps = {
  onCart?: () => void;
};

export default function Navbar({ onCart }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasAbout, setHasAbout] = useState(false);

  // 🧭 Vérifie si la page "about" existe dans /api/pages
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/pages");
        const data = await res.json();
        setHasAbout(data.some((p: any) => p.slug === "about"));
      } catch {
        setHasAbout(false);
      }
    })();
  }, []);

  // 🎞️ effet de scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNav = (id: string) => {
    setMenuOpen(false);
    if (isHome) {
      const section = document.getElementById(id);
      section?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/#${id}`);
    }
  };

  return (
<motion.nav
  initial={{ y: -60, opacity: 0 }}
  animate={{ y: 0, opacity: .86 }}
  transition={{ type: "spring", stiffness: 140, damping: 18 }}
  className={`sticky top-0 z-50 border-b transition-all duration-500 ${
    scrolled
      ? "bg-gradient-to-b from-neutral-950/85 to-neutral-950/60 text-white border-neutral-800 shadow-[0_4px_15px_rgba(0,0,0,0.3)]"
      : "bg-gradient-to-b from-neutral-950/75 to-transparent text-white border-transparent"
  }`}
>
  <div className="mx-auto max-w-[clamp(1200px,85vw,1800px)] px-4 lg:px-10 h-19 flex items-center justify-between backdrop-blur-md">

    {/* Logo */}
    <a
      href="/"
      className="flex items-center gap-2 hover:opacity-95 transition select-none"
      aria-label="MMG Images"
    >
      <span className="h-[76px] w-[76px] md:h-[110px] md:w-[110px] 2xl:h-[340px] 2xl:w-[340px] rounded-full  flex items-center justify-center ]">
        <img
          src="/images/Logo_mmgimages.svg"
          alt="MMG Images"
          className="h-[80px] w-[80px] md:h-[120px] md:w-[120px] 2xl:h-[350px] 2xl:w-[350px] object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.55)]"
        />
      </span>
    </a>

    {/* Desktop nav */}
    <nav className="hidden md:flex gap-6 text-sm 2xl:text-3xl text-neutral-200">
      <button onClick={() => handleNav("gallery")} className="hover:text-white">
        Galerie
      </button>

      {hasAbout && (
        <a href="/a-propos" className="hover:text-amber-400 transition">
          À propos
        </a>
      )}

      <a href="/contact" className="hover:text-white">
        Contact
      </a>
    </nav>

    {/* Panier desktop */}
    <div className="hidden md:block">
      <Button
        onClick={onCart}
        className="inline-flex items-center gap-2 bg-amber-400 hover:bg-amber-300 sm:text-sm md:text-md lg:text-lg 2xl:text-2xl"
      >
        <ShoppingCart className="h-4 w-4 2xl:h-5 2xl:w-5" /> Panier
      </Button>
    </div>

    {/* Bouton mobile */}
    <button
      onClick={() => setMenuOpen(!menuOpen)}
      className="md:hidden p-2 text-neutral-300 hover:text-white transition"
    >
      {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  </div>

  {/* Menu mobile animé */}
  <AnimatePresence>
    {menuOpen && (
      <motion.div
        initial={{ opacity: 0, x: "100%" }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: "100%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed inset-0 bg-gradient-to-b -950/90 to-black/70 backdrop-blur-md z-40 flex justify-end"

        onClick={() => setMenuOpen(false)}
      >
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-64 bg-neutral-950 border-l border-neutral-800 p-6 flex flex-col space-y-6 shadow-[0_0_40px_rgba(0,0,0,0.6)]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-lg font-medium text-gold border-b border-neutral-800 pb-4">
            Menu
          </div>
          <button
            onClick={() => handleNav("gallery")}
            className="text-neutral-200 hover:text-amber-400 text-left"
          >
            Galerie
          </button>

          {hasAbout && (
            <a
              href="/about"
              className="text-neutral-200 hover:text-amber-400 text-left"
              onClick={() => setMenuOpen(false)}
            >
              À propos
            </a>
          )}

          <a
            href="/contact"
            className="text-neutral-200 hover:text-amber-400 text-left"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>

          <div className="pt-6 border-t border-neutral-800">
            <Button
              onClick={() => {
                setMenuOpen(false);
                onCart?.();
              }}
              className="w-full justify-center bg-amber-400 hover:bg-amber-300"
            >
              <ShoppingCart className="h-4 w-4 mr-2" /> Panier
            </Button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</motion.nav> );
}
