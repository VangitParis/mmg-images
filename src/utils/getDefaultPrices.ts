import { kv } from "@vercel/kv";
import type { Price } from "@/types/work";

// 💾 Base de secours (tes valeurs statiques actuelles)
export const DEFAULT_PRICES: Record<string, Price[]> = {
  Cerfs: [
    { label: "Tirage Fine Art A2", amount: 35000 },
    { label: "Téléchargement Web", amount: 10000 },
  ],
  Renards: [
    { label: "Tirage Fine Art A3", amount: 30000 },
    { label: "Téléchargement HD", amount: 9000 },
  ],
  Oiseaux: [
    { label: "Tirage Fine Art A2", amount: 32000 },
    { label: "Téléchargement Web", amount: 8000 },
  ],
  Écureuils: [
    { label: "Tirage Fine Art A4", amount: 25000 },
    { label: "Téléchargement Web", amount: 7000 },
  ],
  Autres: [
    { label: "Tirage Fine Art", amount: 30000 },
    { label: "Téléchargement HD", amount: 9000 },
  ],
};

// ⚡ Fonction qui fusionne KV + valeurs par défaut
export async function getDefaultPrices(): Promise<Record<string, Price[]>> {
  try {
    const stored = (await kv.get("pricing")) as Record<string, Price[]> | null;
    if (stored && Object.keys(stored).length > 0) {
      // fusion KV + fallback local
      return { ...DEFAULT_PRICES, ...stored };
    }
    return DEFAULT_PRICES;
  } catch {
    return DEFAULT_PRICES;
  }
}
