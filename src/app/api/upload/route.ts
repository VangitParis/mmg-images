import { put } from "@vercel/blob";
import { kv } from "@/lib/kv";
import sharp from "sharp";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ success: false, error: "Aucun fichier" });

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const prices = formData.get("prices") as string;
    const alt = formData.get("alt") as string;
    const story = formData.get("story") as string;

    // Watermark
    const buffer = Buffer.from(await file.arrayBuffer());
    const watermark = Buffer.from(`
      <svg width="800" height="200">
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="48" font-family="cursive" opacity="0.35" transform="rotate(-10, 400, 100)">
          MMG Images
        </text>
      </svg>
    `);

    const processedBuffer = await sharp(buffer)
      .resize(1600, null, { fit: "inside" })
      .composite([{ input: watermark, gravity: "center" }])
      .webp({ quality: 80 })
      .toBuffer();

    // Upload vers Vercel Blob
    const fileName = `${Date.now()}.webp`;
    const blob = await put(fileName, processedBuffer, { access: "public" });

    const newWork = {
      id: `${Date.now()}`,
      title,
      location,
      src: blob.url,
      category,
      prices: prices
        ? prices.split("\n").map((l) => {
            const [label, amount] = l.split("-");
            return { label: label.trim(), amount: Number(amount.trim()) };
          })
        : [],
      alt,
      story,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush("works", JSON.stringify(newWork));

    return NextResponse.json({ success: true, work: newWork });
  } catch (err: any) {
    console.error("Erreur upload:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
