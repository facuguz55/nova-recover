import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsClient from "./settings-client";

export default async function SettingsPage() {
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

  return (
    <SettingsClient
      user={{ id: user.id, email: user.email ?? "" }}
      client={{ name: client?.name ?? "", status: client?.status ?? "pending" }}
      onboarding={{
        tn_store_id: onboarding?.tn_store_id ?? null,
        tn_disconnected_at: onboarding?.tn_disconnected_at ?? null,
        email_sender_name: onboarding?.email_sender_name ?? "",
        n8n_client_id: onboarding?.n8n_client_id ?? null,
        completed_at: onboarding?.completed_at ?? null,
      }}
      subscription={{
        status: subscription?.status ?? null,
        created_at: subscription?.created_at ?? null,
      }}
    />
  );
}
