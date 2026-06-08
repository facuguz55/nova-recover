import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: client },
    { data: onboarding },
    { data: subscription },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", user.id).single(),
    supabase.from("onboarding_data").select("*").eq("client_id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("client_id", user.id).single(),
  ]);

  const nClientId = onboarding?.n8n_client_id ?? null;

  const [emailsRes, conversionsRes, cartsRes] = await Promise.all([
    nClientId
      ? supabase.from("emails_enviados").select("email, fecha").eq("client_id", nClientId).order("fecha", { ascending: false }).limit(200)
      : Promise.resolve({ data: [] as { email: string; fecha: string }[] }),
    nClientId
      ? supabase.from("conversiones").select("email, nombre_cliente, total_orden, fecha_orden").eq("client_id", nClientId).order("fecha_orden", { ascending: false }).limit(50)
      : Promise.resolve({ data: [] as { email: string; nombre_cliente: string; total_orden: string; fecha_orden: string }[] }),
    supabase.from("abandoned_carts").select("*").eq("client_id", user.id).order("abandoned_at", { ascending: false }).limit(50),
  ]);

  const emailList = emailsRes.data ?? [];
  const conversionList = conversionsRes.data ?? [];
  const cartList = cartsRes.data ?? [];

  return (
    <DashboardClient
      user={{ email: user.email ?? "", name: client?.name ?? user.email ?? "" }}
      clientStatus={client?.status ?? "pending"}
      onboarding={onboarding}
      tnDisconnectedAt={onboarding?.tn_disconnected_at ?? null}
      subscription={subscription}
      metrics={{
        emailsSent: emailList.length,
        conversions: conversionList.length,
        total: cartList.length > 0 ? cartList.length : emailList.length,
      }}
      recentCarts={cartList.slice(0, 10)}
      recentEmails={emailList.slice(0, 15)}
      recentConversions={conversionList.slice(0, 5)}
    />
  );
}
