// /src/app/api/works/route.ts
import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

const normalizeCategory = (value: string) => {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await kv.lrange("works", 0, -1);
    const works = items.map((item) => {
      const parsed = typeof item === "string" ? JSON.parse(item) : item;
      return {
        ...parsed,
        category: normalizeCategory(parsed?.category || ""),
      };
    });

    return NextResponse.json(works);
  } catch (err: any) {
    console.error("Erreur lecture works:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, location, category, alt, story, prices, src } = body || {};
    if (!id) {
      return NextResponse.json({ success: false, error: "ID manquant" }, { status: 400 });
    }

    const items = await kv.lrange("works", 0, -1);
    const works = items.map((item) =>
      typeof item === "string" ? JSON.parse(item) : item
    );

    const index = works.findIndex((w: any) => w.id === id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Œuvre introuvable" }, { status: 404 });
    }

    const parsePrices = (raw: any) => {
      if (typeof raw !== "string") return works[index].prices ?? [];
      return raw
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.includes("-"))
        .map((l) => {
          const [label, amount] = l.split("-");
          return {
            label: label.trim(),
            amount: Number(amount.trim()),
          };
        });
    };

    const updated = {
      ...works[index],
      title: title ?? works[index].title,
      location: location ?? works[index].location,
      alt: alt ?? works[index].alt,
      story: story ?? works[index].story,
      src: src ?? works[index].src,
      category:
        typeof category === "string"
          ? normalizeCategory(category)
          : works[index].category,
      prices: parsePrices(prices),
    };

    const newList = works.map((w: any, i: number) => (i === index ? updated : w));

    // Réécrit la liste normalisée
    await kv.del("works");
    if (newList.length) {
      await kv.rpush(
        "works",
        ...newList.map((w: any) => (typeof w === "string" ? w : JSON.stringify(w)))
      );
    }

    return NextResponse.json({ success: true, work: updated });
  } catch (err: any) {
    console.error("Erreur PUT /api/works:", err);
    return NextResponse.json({ success: false, error: "Erreur serveur" }, { status: 500 });
  }
}
