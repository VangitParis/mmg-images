// src/app/[slug]/page.tsx
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
  const data = readPages();
  return data.find((p) => p.slug === slug);
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;
  const page = findPage(slug);

  if (!page) {
    return {
      title: "Page introuvable — MMG Images",
      description: "",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${page.title} — MMG Images`,
    description: page.alt || "",
    openGraph: {
      title: `${page.title} — MMG Images`,
      description: page.alt || page.title,
      images: page.image
        ? [{ url: page.image, alt: page.alt || page.title }]
        : [],
    },
  };
}

export default function DynamicPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  const page = findPage(slug);

  if (!page) {
    return notFound();
  }

  const html = formatContent(page.content || "");

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-10">
      <article className="max-w-3xl mx-auto">
        {/* Header type article de blog */}
        <header className="mb-6">
          <p className="text-xs tracking-[0.2em] uppercase text-amber-300 mb-2">
            Article
          </p>
          <h1 className="text-3xl sm:text-4xl font-light mb-3">
            {page.title}
          </h1>
          {page.alt && (
            <p className="text-sm text-neutral-400 max-w-2xl">
              {page.alt}
            </p>
          )}
        </header>

        {/* Image de couverture éventuelle */}
        {page.image && (
          <div className="mb-8 rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900/40">
            <img
              src={page.image}
              alt={page.alt || page.title}
              className="w-full h-[260px] sm:h-[360px] object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Contenu formaté */}
        <section
          className="prose prose-invert max-w-none prose-p:mb-4 prose-p:text-[15px] prose-p:leading-relaxed prose-a:text-amber-300 prose-strong:text-neutral-50"
          dangerouslySetInnerHTML={{
            __html: html || "<p>Aucun contenu pour le moment.</p>",
          }}
        />
      </article>
    </main>
  );
}
