import { put } from "@vercel/blob";
import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // ✅ nécessaire pour Sharp

export async function POST(req: Request) {
  try {
    const sharp = (await import("sharp")).default; // ✅ import dynamique pour éviter les erreurs Edge
    const formData = await req.formData();
const file = formData.get("file") as File;
if (!file) {
  return NextResponse.json({ success: false, error: "Aucun fichier" });
}

// 🧪 Vérif du type MIME côté serveur
const mime = file.type || "application/octet-stream";

// On accepte uniquement les formats que sharp gère bien sur Vercel
const allowed = ["image/jpeg", "image/png", "image/webp"];

if (!allowed.includes(mime)) {
  return NextResponse.json(
    {
      success: false,
      error: `Format non supporté (${mime}). Merci d’envoyer un JPEG, PNG ou WebP.`,
    },
    { status: 400 }
  );
}

const title = formData.get("title") as string;
const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const prices = formData.get("prices") as string;
    const alt = formData.get("alt") as string;
    const story = formData.get("story") as string;

    // 🖋️ watermark SVG
    const buffer = Buffer.from(await file.arrayBuffer());
    const watermarkSvg = `
<svg width="800" height="200" xmlns="http://www.w3.org/2000/svg">
  <style>
    text { font-family: Arial, sans-serif; }
  </style>
  <text x="50%" y="50%" text-anchor="middle" fill="white"
    font-size="48" opacity="0.35" transform="rotate(-10, 400, 100)">
    MMG Images
  </text>
</svg>
`;

const watermark = Buffer.from(watermarkSvg, "utf-8");


    const processedBuffer = await sharp(buffer)
      .resize(1600, null, { fit: "inside" })
      .composite([{ input: watermark, gravity: "center" }])
      .webp({ quality: 80 })
      .toBuffer();

    // 📤 Upload vers Vercel Blob
    const fileName = `${Date.now()}.webp`;
    const blob = await put(fileName, processedBuffer, { access: "public" });

    const newWork = {
      id: `${Date.now()}`,
      title,
      location,
      src: blob.url,
      category,
      prices: prices
  ? prices
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l.includes("-"))
      .map((l) => {
        const [label, amount] = l.split("-");
        return {
          label: label.trim(),
          amount: Number(amount?.trim() || 0),
        };
      })
  : [],

      alt,
      story,
      createdAt: new Date().toISOString(),
    };

    // 💾 Sauvegarde dans Upstash KV
    await kv.lpush("works", JSON.stringify(newWork));

    return NextResponse.json({ success: true, work: newWork });
  } catch (err: any) {
    console.error("Erreur upload:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
