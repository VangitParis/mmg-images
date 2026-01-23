import { NextResponse } from "next/server";
import sharp from "sharp";
import { readFile } from "fs/promises";
import path from "path";
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

function logoOverlaySvg(logoDataUrl: string, w = 1200, h = 800) {
  const size = Math.round(Math.min(w, h) * 0.18);
  const x = Math.round((w - size) / 2);
  const y = Math.round((h - size) / 2);
  return Buffer.from(`
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="wmtext" patternUnits="userSpaceOnUse" width="520" height="320" patternTransform="rotate(-18)">
        <text x="0" y="180"
              font-size="30"
              font-family="Arial"
              font-weight="700"
              fill="white"
              fill-opacity="0.08"
              letter-spacing="4">
          MMGIMAGES.COM
        </text>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wmtext)"/>
    <image href="${logoDataUrl}" x="${x}" y="${y}" width="${size}" height="${size}" opacity="0.32" />
  </svg>`);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const urlParam = searchParams.get("url");
    const id = searchParams.get("id");

    if (!urlParam && !id) {
      return NextResponse.json({ error: "Missing url or id" }, { status: 400 });
    }

    let sourceUrl = urlParam?.trim() || "";
    let title = "MMGIMAGES.COM";

    if (!sourceUrl && id) {
      const work = (WORKS as any[]).find((w) => String(w.id) === String(id));
      if (!work?.src) return NextResponse.json({ error: "Unknown work" }, { status: 404 });
      sourceUrl = work.src;
      title = String(work.title ?? title);
    } else if (urlParam) {
      title = searchParams.get("title") || title;
    }

    // If the URL is relative, build it against the current origin
    if (sourceUrl.startsWith("/")) {
      const origin = new URL(req.url).origin;
      sourceUrl = new URL(sourceUrl, origin).toString();
    }

    const lowerUrl = sourceUrl.toLowerCase();
    if (lowerUrl.endsWith(".jxl")) {
      // Fournit un placeholder lisible au lieu d'une 415 répétée
      const msg = `PREVIEW NON DISPONIBLE — ${title}`.toUpperCase();
      const svg = Buffer.from(`
        <svg width="1400" height="900" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="#0b0b0b"/>
              <stop offset="100%" stop-color="#1a1a1a"/>
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)"/>
          <text x="50%" y="45%" text-anchor="middle" fill="#ffffff" fill-opacity="0.8"
                font-family="Arial" font-size="36" font-weight="700" letter-spacing="4">
            ${escapeXml(msg)}
          </text>
          <text x="50%" y="55%" text-anchor="middle" fill="#ffffff" fill-opacity="0.6"
                font-family="Arial" font-size="22" letter-spacing="3">
            FORMAT JXL NON SUPPORTÉ
          </text>
        </svg>
      `);
      const placeholderBuf = await sharp(svg)
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();
      return new Response(new Uint8Array(placeholderBuf), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=3600",
          "X-Robots-Tag": "noindex",
        },
      });
    }

    let logoDataUrl = "";
    try {
      const logoPath = path.join(process.cwd(), "public", "images", "Logo_mmgimages-NT.png");
      const logoBuf = await readFile(logoPath);
      logoDataUrl = `data:image/png;base64,${logoBuf.toString("base64")}`;
    } catch (logoErr) {
      console.error("PREVIEW logo read failed", logoErr);
    }

    let absoluteUrl: URL;
    try {
      absoluteUrl = new URL(sourceUrl);
    } catch (parseErr) {
      console.error("PREVIEW invalid URL", sourceUrl, parseErr);
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    const res = await fetch(absoluteUrl, { cache: "no-store" });
    if (!res.ok) {
      console.error("PREVIEW fetch failed", res.status, res.statusText, sourceUrl);
      return NextResponse.json(
        { error: "Fetch failed", status: res.status, statusText: res.statusText },
        { status: 400 }
      );
    }

    const input = Buffer.from(await res.arrayBuffer());

    let resized;
    try {
      resized = await sharp(input)
        .rotate()
        .resize({ width: 1400, withoutEnlargement: true })
        .toBuffer({ resolveWithObject: true });
    } catch (decodeErr) {
      console.error("PREVIEW decode/resize failed", decodeErr);
      return NextResponse.json({ error: "Invalid or unsupported image" }, { status: 415 });
    }

    const overlaySvg =
      logoDataUrl && resized?.info?.width && resized?.info?.height
        ? logoOverlaySvg(logoDataUrl, resized.info.width, resized.info.height)
        : null;

    let out: Buffer;
    try {
      if (overlaySvg) {
        out = await sharp(resized.data)
          .composite([{ input: overlaySvg, gravity: "center" }])
          .jpeg({ quality: 78, mozjpeg: true })
          .toBuffer();
      } else {
        out = await sharp(resized.data).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
      }
    } catch (err) {
      console.error("Composite failed, returning resized jpeg only:", err);
      out = await sharp(resized.data).jpeg({ quality: 78, mozjpeg: true }).toBuffer();
    }

    const body = new Uint8Array(out); // BodyInit compatible

    return new Response(body, {
      headers: {
        "Content-Type": "image/jpeg",
        "Cache-Control": "public, max-age=3600",
        "X-Robots-Tag": "noindex",
      },
    });
  } catch (err) {
    console.error("PREVIEW ERROR", err);
    return NextResponse.json({ error: "preview_failed" }, { status: 500 });
  }
}
