import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: onboarding } = await supabase
    .from("onboarding_data")
    .select("*")
    .eq("client_id", user.id)
    .single();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("client_id", user.id)
    .single();

  return (
    <DashboardClient
      user={{ email: user.email ?? "", name: client?.name ?? user.email ?? "" }}
      clientStatus={client?.status ?? "pending"}
      onboarding={onboarding}
      subscription={subscription}
    />
  );
}
