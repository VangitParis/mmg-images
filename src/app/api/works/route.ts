import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src/lib/works.json");
    if (!fs.existsSync(filePath)) return NextResponse.json([]);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return NextResponse.json(data);
  } catch (err:any) {
    console.error("GET /api/works:", err);
    return NextResponse.json({ error: "Erreur chargement œuvres" }, { status: 500 });
  }
}