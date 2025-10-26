import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/lib/pages.json");

function readPages() {
  if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
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

    const pages = readPages();
    const newPages = pages.filter((p: any) => p.slug !== slug);
    fs.writeFileSync(filePath, JSON.stringify(newPages, null, 2), "utf-8");

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur DELETE /api/pages/[slug]:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
