"use client";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import Button from "./ui/Button";
import { useState } from "react";

// --- Types ---
type Price = {
  label: string;
  amount: number;
};

type Work = {
  id: string;
  title: string;
  src: string;
};

type CartItem = {
  work: Work;
  price: Price;
};

type CartDrawerProps = {
  items: CartItem[];
  onClose: () => void;
};

// --- Composant ---
export default function CartDrawer({ items, onClose }: CartDrawerProps) {
  const total = items.reduce((sum, item) => sum + item.price.amount, 0);
  const [loading, setLoading] = useState(false);

  const checkout = async () => {
    if (loading || items.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (res.ok && data?.url) {
        window.location.href = data.url;
      } else {
        alert(data?.error || "Paiement indisponible.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Erreur paiement, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/60" onClick={onClose} />

        <motion.div
          initial={{ x: 420 }}
          animate={{ x: 0 }}
          exit={{ x: 420 }}
          transition={{ type: "spring", stiffness: 240, damping: 26 }}
          className="absolute right-0 top-0 h-full w-[380px] bg-neutral-950 border-l border-neutral-800 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-lg">Panier</div>
            <Button variant="ghost" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-4 space-y-3 overflow-y-auto h-[70vh] pr-2">
            {items.length === 0 && (
              <div className="text-neutral-500 text-sm">Aucun article.</div>
            )}

            {items.map((item, i) => (
              <div
                key={`${item.work.id}-${i}`}
                className="flex gap-3 border border-neutral-800 rounded-xl p-2"
              >
                <img
                  src={item.work.src}
                  alt={item.work.title}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <div className="text-sm">
                  <div className="text-neutral-200">{item.work.title}</div>
                  <div className="text-neutral-500">{item.price.label}</div>
                  <div className="text-neutral-300 mt-1">
                    {(item.price.amount / 100).toFixed(0)}€
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-neutral-800 pt-4">
            <div className="flex items-center justify-between text-sm">
              <div>Total</div>
              <div className="text-neutral-100 font-medium">
                {(total / 100).toFixed(0)}€
              </div>
            </div>

            <Button
              className="w-full mt-3"
              onClick={checkout}
              disabled={loading || items.length === 0}
            >
              {loading ? "Redirection..." : "Payer"}
            </Button>

            <p className="text-[11px] text-neutral-500 mt-2">
              Paiements sécurisés Stripe. TVA et facture envoyées automatiquement.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
