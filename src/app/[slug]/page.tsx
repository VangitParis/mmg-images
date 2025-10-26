import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src/lib/pages.json");

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const page = data.find((p: any) => p.slug === slug);
  return {
    title: page ? `${page.title} — MMG Images` : "Page introuvable",
    description: page?.alt || "",
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const page = data.find((p: any) => p.slug === slug);

  if (!page) {
    return <div className="text-center py-20 text-neutral-500">Page introuvable</div>;
  }

  return (
    <section className="max-w-3xl mx-auto px-4 py-16 text-neutral-100">
      {page.image && (
        <img
          src={page.image}
          alt={page.alt || page.title}
          className="w-full h-auto rounded-xl mb-8 object-cover"
        />
      )}
      <h1 className="text-3xl font-light mb-4">{page.title}</h1>
      <article className="prose prose-invert max-w-none leading-relaxed text-neutral-300">
        {page.content || "Aucun contenu pour le moment."}
      </article>
    </section>
  );
}
