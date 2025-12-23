import { put } from "@vercel/blob";
import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

const normalizeCategory = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fileUrl = String(formData.get("fileUrl") || "");
    const title = String(formData.get("title") || "");
    const location = String(formData.get("location") || "");
    const category = normalizeCategory(String(formData.get("category") || ""));
    const prices = String(formData.get("prices") || "");
    const alt = String(formData.get("alt") || "");
    const story = String(formData.get("story") || "");

    if (!fileUrl || !title || !alt || !category) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    // ✅ 1️⃣ Télécharger l’image originale depuis Blob
    const originalRes = await fetch(fileUrl);
    if (!originalRes.ok) throw new Error("Impossible de récupérer l'image source");

    const originalBuffer = Buffer.from(await originalRes.arrayBuffer());

    // ✅ 2️⃣ Optimisation serveur (qualité PRO, aucun downgrade visuel)
    const processed = await sharp(originalBuffer)
      .resize(2000, null, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toBuffer();

    // ✅ 3️⃣ Nom sécurisé SEO + anti-doublon
    const safeTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 50);

    const fileName = `${Date.now()}-${safeTitle || "image"}.webp`;

    // ✅ 4️⃣ Re-upload optimisé vers Blob
    const finalBlob = await put(fileName, processed, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,
    });

    // ✅ 5️⃣ Parsing prix
    const parsedPrices =
      prices
        ?.split("\n")
        .map((l) => l.trim())
        .filter((l) => l.includes("-"))
        .map((l) => {
          const [label, amount] = l.split("-");
          return {
            label: label.trim(),
            amount: Number(amount.trim()),
          };
        }) || [];

    const newWork = {
      id: Date.now().toString(),
      title,
      location,
      src: finalBlob.url, // ✅ IMAGE OPTIMISÉE SERVEUR
      category,
      prices: parsedPrices,
      alt,
      story,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush("works", JSON.stringify(newWork));

    return NextResponse.json({ success: true, work: newWork });
  } catch (err: any) {
    console.error("UPLOAD PIPELINE ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
