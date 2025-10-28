import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";
import { DEFAULT_PRICES } from "@/utils/getDefaultPrices";

export async function POST() {
  try {
    await kv.set("pricing", DEFAULT_PRICES);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
