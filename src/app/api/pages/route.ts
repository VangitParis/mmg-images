import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/lib/pages.json");

/* ─────────────────────────────
   Helpers
   ───────────────────────────── */
function readPages() {
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, "[]", "utf-8");
    const raw = fs.readFileSync(filePath, "utf-8");
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error("Erreur lecture pages:", err);
    return [];
  }
}

function savePages(pages: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(pages, null, 2), "utf-8");
}

/* ─────────────────────────────
   Formatage paragraphe (fallback serveur)
   ───────────────────────────── */
function formatContent(raw: string) {
  return raw
    .split(/\n{2,}|\r+/) // coupe sur les doubles sauts de ligne
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p}</p>`)
    .join("\n\n");
}

/* ─────────────────────────────
   GET → liste toutes les pages
   ───────────────────────────── */
export async function GET() {
  const data = readPages();
  return NextResponse.json(data);
}

/* ─────────────────────────────
   POST → créer une nouvelle page
   ───────────────────────────── */
export async function POST(req: Request) {
  try {
    const { slug, title, image, alt, content } = await req.json();

    if (!slug?.trim() || !title?.trim()) {
      return NextResponse.json(
        { success: false, error: "Slug et titre sont obligatoires." },
        { status: 400 }
      );
    }

    const pages = readPages();

    // 1) Nettoyage du slug AVANT la vérification
    const safeSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");

    // 2) Vérif d'unicité sur le slug nettoyé
    if (pages.some((p: any) => p.slug === safeSlug)) {
      return NextResponse.json(
        { success: false, error: "Ce slug existe déjà." },
        { status: 400 }
      );
    }

    const newPage = {
      slug: safeSlug,
      title: title.trim(),
      image: image || "",
      alt: alt || "",
      content: content ? formatContent(content) : "",
    };

    pages.push(newPage);
    savePages(pages);

    return NextResponse.json({ success: true, page: newPage });
  } catch (err: any) {
    console.error("Erreur POST /api/pages:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/* ─────────────────────────────
   PUT → modifier une page existante
   ───────────────────────────── */
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { slug, title, image, alt, content } = body;

    if (!slug?.trim()) {
      return NextResponse.json(
        { success: false, error: "Slug manquant." },
        { status: 400 }
      );
    }

    const pages = readPages();
    const index = pages.findIndex((p: any) => p.slug === slug);

    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Page introuvable." },
        { status: 404 }
      );
    }

    pages[index] = {
      ...pages[index],
      title: title?.trim() ?? pages[index].title,
      image: image ?? pages[index].image,
      alt: alt ?? pages[index].alt,
      content:
        typeof content === "string"
          ? formatContent(content)
          : pages[index].content,
    };

    savePages(pages);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Erreur PUT /api/pages:", err);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}


