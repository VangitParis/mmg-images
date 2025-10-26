import sharp from "sharp";
import path from "path";
import fs from "fs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const buffer = Buffer.from(await file.arrayBuffer());

    const title = formData.get("title") as string;
    const location = formData.get("location") as string;
    const category = formData.get("category") as string;
    const prices = formData.get("prices") as string;
    const alt = formData.get("alt") as string;
    const story = formData.get("story") as string;

    const uploadsDir = path.join(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const fileName = `${Date.now()}.webp`;
    const filePath = path.join(uploadsDir, fileName);

    // 🖋️ watermark
    const watermark = Buffer.from(`
      <svg width="800" height="200">
        <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="48" font-family="cursive" opacity="0.35" transform="rotate(-10, 400, 100)">
          MMG Images
        </text>
      </svg>
    `);

    await sharp(buffer)
      .resize(1600, null, { fit: "inside" })
      .composite([{ input: watermark, gravity: "center" }])
      .webp({ quality: 80 })
      .toFile(filePath);

    const newWork = {
      id: `${Date.now()}`,
      title,
      location,
      src: `/uploads/${fileName}`,
      category,
      prices: prices
        ? prices.split("\n").map((l) => {
            const [label, amount] = l.split("-");
            return { label: label.trim(), amount: Number(amount.trim()) };
          })
        : [],
      alt,
      story,
    };

    const worksPath = path.join(process.cwd(), "src/lib/works.json");
    const data = fs.existsSync(worksPath)
      ? JSON.parse(fs.readFileSync(worksPath, "utf-8"))
      : [];
    data.push(newWork);
    fs.writeFileSync(worksPath, JSON.stringify(data, null, 2), "utf-8");

    return NextResponse.json({ success: true, work: newWork });
  } catch (err: any) {
    console.error("Erreur upload:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
