import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Champs manquants." }, { status: 400 });
    }

    // Protection simple anti-spam
    if (message.includes("http://") || message.includes("https://")) {
      return NextResponse.json({ error: "Spam détecté." }, { status: 403 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL,
        pass: process.env.CONTACT_PASS,
      },
    });

    await transporter.sendMail({
      from: `"MMG Images" <${process.env.CONTACT_EMAIL}>`,
      to: "contact@mmgimages.com",
      subject: `📩 Nouveau message de ${name}`,
      text: `Nom: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Erreur envoi mail:", err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}
