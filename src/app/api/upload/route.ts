import { put } from "@vercel/blob";
import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Aucun fichier reçu" },
        { status: 400 }
      );
    }

    const title = String(formData.get("title") || "");
    const location = String(formData.get("location") || "");
    const category = String(formData.get("category") || "");
    const prices = String(formData.get("prices") || "");
    const alt = String(formData.get("alt") || "");
    const story = String(formData.get("story") || "");

    if (!title || !alt || !category) {
      return NextResponse.json(
        { success: false, error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // ✅ Buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ Optimisation serveur (AUCUNE MODIF VISUELLE)
    const processed = await sharp(buffer)
      .resize(2000, null, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80, effort: 5 })
      .toBuffer();

    // ✅ Nom sécurisé
    const safeTitle = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 40);

    const fileName = `${Date.now()}-${safeTitle || "image"}.webp`;

    // ✅ UPLOAD ANTI SAFARI / ANTI DOUBLON
    const blob = await put(fileName, processed, {
      access: "public",
      contentType: "image/webp",
      addRandomSuffix: true,   // ✅ OBLIGATOIRE POUR SAFARI
    });

    // ✅ Parsing prix
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
      src: blob.url,
      category,
      prices: parsedPrices,
      alt,
      story,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush("works", JSON.stringify(newWork));

    return NextResponse.json({ success: true, work: newWork });
  } catch (err: any) {
    console.error("UPLOAD ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
