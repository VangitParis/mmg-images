import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export async function GET() {
  const blob = await put("temp-upload", new Blob(), {
    access: "public",
  });

  return NextResponse.json({ uploadUrl: blob.url });
}
