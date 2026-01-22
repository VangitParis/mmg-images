import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeSecret ? new Stripe(stripeSecret, { apiVersion: "2023-08-16" }) : null;

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe non configuré (STRIPE_SECRET_KEY manquant)." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];

    if (!items.length) {
      return NextResponse.json({ error: "Panier vide." }, { status: 400 });
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof req.headers.get("origin") === "string" ? req.headers.get("origin")! : "");
    if (!origin) {
      return NextResponse.json({ error: "Origin manquant pour les URLs de retour." }, { status: 400 });
    }

    const line_items = items.map((item: any) => ({
      quantity: 1,
      price_data: {
        currency: "eur",
        unit_amount: Number(item?.price?.amount ?? 0),
        product_data: {
          name: `${item?.work?.title ?? "Œuvre"} — ${item?.price?.label ?? ""}`.trim(),
          images: item?.work?.src ? [item.work.src] : [],
        },
      },
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${origin}/?checkout=success`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: {
        source: "mmg-images",
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: err?.message || "Erreur serveur Checkout" },
      { status: 500 }
    );
  }
}
