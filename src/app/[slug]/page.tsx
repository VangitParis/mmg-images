import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { formatContent } from "@/utils/formatContent";

const filePath = path.join(process.cwd(), "src/lib/pages.json");

type PageRecord = {
  slug: string;
  title: string;
  image?: string;
  alt?: string;
  content: string;
};

function readPages(): PageRecord[] {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function findPage(slug: string): PageRecord | undefined {
  return readPages().find((p) => p.slug === slug);
}

/* ✅ CONTRACT NEXT 15 : params = Promise */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const page = findPage(slug);

  if (!page) {
    return {
      title: "Page introuvable — MMG Images",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${page.title} — MMG Images`,
    description: page.alt || page.title,
    openGraph: {
      title: page.title,
      description: page.alt || page.title,
      images: page.image
        ? [{ url: page.image, alt: page.alt || page.title }]
        : [],
    },
  };
}

/* ✅ CONTRACT NEXT 15 : params = Promise */
export default async function Page(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const page = findPage(slug);

  if (!page) return notFound();

  const html = formatContent(page.content || "");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-12">
      <article className="max-w-4xl mx-auto">
        <div className="mb-6 text-xs uppercase tracking-[0.25em] text-neutral-500">
          <span className="text-amber-300">MMG Images</span>
          <span className="mx-2">•</span>
          <span>Article</span>
        </div>

        <header className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-light mb-3">
            {page.title}
          </h1>
          {page.alt && (
            <p className="text-sm text-neutral-400 max-w-2xl mx-auto">
              {page.alt}
            </p>
          )}
        </header>

        <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl shadow-xl overflow-hidden">
          {page.image && (
            <div className="relative w-full h-[260px] sm:h-[340px] overflow-hidden">
              <img
                src={page.image}
                alt={page.alt || page.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}

          <div className="px-6 sm:px-10 py-8 sm:py-12">
            <section
              className="prose prose-invert max-w-none
                prose-p:mb-4 prose-p:text-[15px] prose-p:leading-relaxed
                prose-a:text-amber-300 prose-strong:text-neutral-50
                prose-ul:marker:text-amber-300"
              dangerouslySetInnerHTML={{
                __html: html || "<p>Aucun contenu pour le moment.</p>",
              }}
            />
          </div>
        </div>
      </article>
    </main>
  );
}
