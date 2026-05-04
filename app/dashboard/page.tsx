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
    { data: carts },
  ] = await Promise.all([
    supabase.from("clients").select("*").eq("id", user.id).single(),
    supabase.from("onboarding_data").select("*").eq("client_id", user.id).single(),
    supabase.from("subscriptions").select("*").eq("client_id", user.id).single(),
    supabase
      .from("abandoned_carts")
      .select("*")
      .eq("client_id", user.id)
      .order("abandoned_at", { ascending: false })
      .limit(50),
  ]);

  const cartList = carts ?? [];
  const emailsSent = cartList.filter((c) => c.email_sent_at).length;
  const conversions = cartList.filter((c) => c.status === "recovered").length;

  return (
    <DashboardClient
      user={{ email: user.email ?? "", name: client?.name ?? user.email ?? "" }}
      clientStatus={client?.status ?? "pending"}
      onboarding={onboarding}
      subscription={subscription}
      metrics={{ emailsSent, conversions, total: cartList.length }}
      recentCarts={cartList.slice(0, 10)}
    />
  );
}
