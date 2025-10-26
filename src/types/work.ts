export type Price = { label: string; amount: number };

export type Work = {
  id: string;
  title: string;
  location?: string;
  category: string;
  src: string;          // chemin webp optimisé (public/uploads/…)
  alt: string;          // SEO obligatoire
  story?: string;       // petite histoire de la photo
  aspect?: number;      // optionnel (ex: 4/3)
  prices: Price[];
};
