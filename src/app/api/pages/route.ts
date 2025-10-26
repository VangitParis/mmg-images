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

    // 🔒 slug unique
    if (pages.some((p: any) => p.slug === slug)) {
      return NextResponse.json(
        { success: false, error: "Ce slug existe déjà." },
        { status: 400 }
      );
    }

    // 💡 nettoyage minimal du slug (SEO)
    const safeSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/--+/g, "-")
      .replace(/^-|-$/g, "");

    const newPage = {
      slug: safeSlug,
      title: title.trim(),
      image: image || "",
      alt: alt || "",
      content: content || "",
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
      title: title ?? pages[index].title,
      image: image ?? pages[index].image,
      alt: alt ?? pages[index].alt,
      content: content ?? pages[index].content,
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
