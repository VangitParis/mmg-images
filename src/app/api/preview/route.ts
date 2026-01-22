import { NextResponse } from "next/server";
import sharp from "sharp";
import { WORKS } from "@/lib/data"; // utilisé en fallback si besoin

export const runtime = "nodejs";

function escapeXml(input: string) {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function watermarkSvg(text: string) {
  const safe = escapeXml(text);
  return Buffer.from(`
  <svg width="1600" height="1000" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="wm" patternUnits="userSpaceOnUse" width="520" height="320" patternTransform="rotate(-18)">
        <text x="0" y="180"
              font-size="36"
              font-family="Arial"
              font-weight="800"
              fill="white"
              fill-opacity="0.35"
              letter-spacing="4">
          ${safe}
        </text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wm)"/>
  </svg>`);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const urlParam = searchParams.get("url");
  const id = searchParams.get("id");

  if (!urlParam && !id) {
    return NextResponse.json({ error: "Missing url or id" }, { status: 400 });
  }

  let sourceUrl = urlParam || "";
  let title = "MMGIMAGES.COM";

  if (!sourceUrl && id) {
    const work = (WORKS as any[]).find((w) => String(w.id) === String(id));
    if (!work?.src) return NextResponse.json({ error: "Unknown work" }, { status: 404 });
    sourceUrl = work.src;
    title = String(work.title ?? title);
  } else if (urlParam) {
    title = searchParams.get("title") || title;
  }

  const wm = watermarkSvg(`MMGIMAGES.COM — ${title.toUpperCase()}`);

  const res = await fetch(sourceUrl, { cache: "no-store" });
  if (!res.ok) return NextResponse.json({ error: "Fetch failed" }, { status: 400 });

  const input = Buffer.from(await res.arrayBuffer());

  const out = await sharp(input)
    .rotate()
    .resize({ width: 1400, withoutEnlargement: true })
    .composite([{ input: wm, gravity: "center" }])
    .jpeg({ quality: 78, mozjpeg: true })
    .toBuffer();

  const body = new Uint8Array(out); // BodyInit compatible

  return new Response(body, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
