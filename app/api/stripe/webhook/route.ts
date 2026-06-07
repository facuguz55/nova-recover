import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Firma faltante" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Webhook signature inválida" }, { status: 400 });
  }

  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id;
    if (!userId) return NextResponse.json({ received: true });

    await supabase.from("subscriptions").upsert({
      client_id: userId,
      stripe_customer_id: session.customer as string,
      stripe_subscription_id: session.subscription as string,
      status: "active",
    });

    await supabase.from("clients").upsert({ id: userId, status: "active" });
    await supabase.from("onboarding_data")
      .update({ completed_at: new Date().toISOString() })
      .eq("client_id", userId);

    // Provisionar con secret interno
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    try {
      await fetch(`${appUrl}/api/provision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": process.env.PROVISION_INTERNAL_SECRET ?? "",
        },
        body: JSON.stringify({ user_id: userId }),
      });
    } catch (e) {
      console.error("Provision error (stripe):", e);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await supabase.from("subscriptions")
      .update({ status: "canceled" })
      .eq("stripe_subscription_id", sub.id);
    const { data } = await supabase.from("subscriptions")
      .select("client_id")
      .eq("stripe_subscription_id", sub.id)
      .single();
    if (data) await supabase.from("clients").update({ status: "inactive" }).eq("id", data.client_id);
  }

  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice & { subscription?: string };
    if (invoice.subscription) {
      await supabase.from("subscriptions")
        .update({ status: "past_due" })
        .eq("stripe_subscription_id", invoice.subscription);
    }
  }

  return NextResponse.json({ received: true });
}
