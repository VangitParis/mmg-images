export function formatContent(raw: string) {
  if (!raw) return "";

  const trimmed = raw.trim();

  if (/^<p[\s>]/i.test(trimmed) || /<\/p>/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed
    .split(/\n{2,}|\r+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p}</p>`)
    .join("\n\n");
}
