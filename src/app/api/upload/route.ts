import { kv } from "@/lib/kv";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const fileUrl = String(formData.get("fileUrl") || "");
    const title = String(formData.get("title") || "");
    const location = String(formData.get("location") || "");
    const category = String(formData.get("category") || "");
    const prices = String(formData.get("prices") || "");
    const alt = String(formData.get("alt") || "");
    const story = String(formData.get("story") || "");

    if (!fileUrl || !title || !alt) {
      return NextResponse.json(
        { success: false, error: "Données manquantes" },
        { status: 400 }
      );
    }

    const parsedPrices =
      prices
        ?.split("\n")
        .map((l) => l.trim())
        .filter((l) => l.includes("-"))
        .map((l) => {
          const [label, amount] = l.split("-");
          return { label: label.trim(), amount: Number(amount.trim()) };
        }) || [];

    const newWork = {
      id: Date.now().toString(),
      title,
      location,
      src: fileUrl,
      category,
      prices: parsedPrices,
      alt,
      story,
      createdAt: new Date().toISOString(),
    };

    await kv.lpush("works", JSON.stringify(newWork));

    return NextResponse.json({ success: true, work: newWork });
  } catch (err: any) {
    console.error("UPLOAD META ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
