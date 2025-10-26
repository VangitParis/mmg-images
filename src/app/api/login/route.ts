import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (password === adminPassword) {
    // Auth OK → tu peux renvoyer un token simple ou un flag
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json(
      { success: false, message: "Mot de passe incorrect." },
      { status: 401 }
    );
  }
}
