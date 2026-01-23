import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { kv } from "@/lib/kv";

const filePath = path.join(process.cwd(), "src/lib/pages.json");
const hasKv = !!process.env.KV_REST_API_URL && !!process.env.KV_REST_API_TOKEN;

async function readPages() {
  if (hasKv) {
    const items = await kv.lrange("pages", 0, -1);
    return items.map((item) => (typeof item === "string" ? JSON.parse(item) : item));
  }
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function savePages(pages: any[]) {
  if (hasKv) {
    await kv.del("pages");
    if (pages.length) {
      await kv.rpush(
        "pages",
        ...pages.map((p) => (typeof p === "string" ? p : JSON.stringify(p)))
      );
    }
    return;
  }
  fs.writeFileSync(filePath, JSON.stringify(pages, null, 2), "utf-8");
}

/* ───────────────────────────────
   DELETE : suppression d'une page
   ─────────────────────────────── */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params; // 👈 maintenant on attend la promesse

    if (!slug) {
      return NextResponse.json({ success: false, error: "Slug manquant" }, { status: 400 });
    }

    const pages = await readPages();
    const newPages = pages.filter((p: any) => p.slug !== slug);
    await savePages(newPages);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur DELETE /api/pages/[slug]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
