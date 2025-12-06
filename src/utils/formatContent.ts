// src/utils/formatContent.ts
export function formatContent(raw: string) {
  if (!raw) return "";

  const trimmed = raw.trim();

  // Si le contenu ressemble déjà à du HTML avec <p>, on ne touche à rien
  if (/^<p[\s>]/i.test(trimmed) || /<\/p>/i.test(trimmed)) {
    return trimmed;
  }

  // Sinon : texte brut → paragraphes
  return trimmed
    .split(/\n{2,}|\r+/) // double saut de ligne = nouveau paragraphe
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p}</p>`)
    .join("\n\n");
}
