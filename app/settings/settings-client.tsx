"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Zap, LogOut, ArrowLeft, User, Store, CreditCard,
  ShoppingCart, CheckCircle, XCircle, Clock, Loader2,
  Trash2, AlertTriangle, Save, Unplug,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface Props {
  user: { id: string; email: string };
  client: { name: string; status: string };
  onboarding: {
    tn_store_id: string | null;
    tn_disconnected_at: string | null;
    email_sender_name: string;
    n8n_client_id: string | null;
    completed_at: string | null;
  };
  subscription: { status: string | null; created_at: string | null };
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#111118] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6">
      <h2 className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-5">{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[#F1F5F9]">{label}</label>
      {children}
      {hint && <p className="text-xs text-[#64748B]">{hint}</p>}
    </div>
  );
}

const SUB_LABELS: Record<string, { label: string; color: string }> = {
  active:  { label: "Activa",   color: "text-green-400 bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]" },
  trial:   { label: "Prueba",   color: "text-blue-400 bg-[rgba(37,99,235,0.1)] border-[rgba(37,99,235,0.3)]" },
  pending: { label: "Pendiente",color: "text-yellow-400 bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.3)]" },
  cancelled:{ label: "Cancelada",color: "text-red-400 bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]" },
};

export default function SettingsClient({ user, client, onboarding, subscription }: Props) {
  const router = useRouter();

  const [name, setName] = useState(client.name);
  const [storeName, setStoreName] = useState(onboarding.email_sender_name);
  const [savingProfile, setSavingProfile] = useState(false);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const isTnConnected = !!onboarding.tn_store_id && !onboarding.tn_disconnected_at;
  const subStatus = subscription.status ?? "pending";
  const sub = SUB_LABELS[subStatus] ?? SUB_LABELS.pending;

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function saveProfile() {
    if (!name.trim()) { toast.error("El nombre no puede estar vacío"); return; }
    setSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), store_name: storeName.trim() }),
      });
      if (res.ok) {
        toast.success("Cambios guardados");
        router.refresh();
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Error al guardar");
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleDisconnectTN() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/tiendanube/disconnect", { method: "DELETE" });
      if (res.ok) { toast.success("TiendaNube desconectada"); router.refresh(); }
      else toast.error("Error al desconectar");
    } catch { toast.error("Error de red"); }
    finally { setDisconnecting(false); setConfirmDisconnect(false); }
  }

  async function handleDeleteAccount() {
    if (deleteInput !== user.email) { toast.error("El email no coincide"); return; }
    setDeleting(true);
    try {
      const res = await fetch("/api/settings/account", { method: "DELETE" });
      if (res.ok) {
        toast.success("Cuenta eliminada");
        router.push("/");
      } else {
        const d = await res.json();
        toast.error(d.error ?? "Error al eliminar");
        setDeleting(false);
      }
    } catch {
      toast.error("Error de red");
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#F1F5F9]">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(124,58,237,0.15)] bg-[rgba(10,10,15,0.95)] backdrop-blur-md h-16 flex items-center px-6">
        <div className="max-w-3xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Dashboard
            </Link>
            <div className="w-px h-4 bg-[rgba(255,255,255,0.08)]" />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-sm">Nova Recover</span>
            </div>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-6">

          <div className="mb-8">
            <h1 className="text-3xl font-black mb-1">Configuración</h1>
            <p className="text-[#94A3B8]">Administrá tu cuenta y preferencias.</p>
          </div>

          {/* Perfil */}
          <Section title="Perfil">
            <div className="space-y-4">
              <Field label="Tu nombre">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={name}
                    maxLength={100}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[rgba(124,58,237,0.25)] focus:border-[#7C3AED] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F1F5F9] outline-none transition-colors"
                  />
                </div>
              </Field>

              <Field label="Nombre de la tienda" hint="Aparece como remitente en los mails de recuperación">
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
                  <input
                    type="text"
                    value={storeName}
                    maxLength={60}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[rgba(124,58,237,0.25)] focus:border-[#7C3AED] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F1F5F9] outline-none transition-colors"
                  />
                </div>
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full bg-[#0a0a0f] border border-[rgba(255,255,255,0.06)] rounded-xl px-4 py-3 text-sm text-[#64748B] cursor-not-allowed"
                />
              </Field>

              <button
                onClick={saveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {savingProfile ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </Section>

          {/* Suscripción */}
          <Section title="Suscripción">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-[rgba(255,255,255,0.05)]">
                <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
                  <CreditCard className="w-4 h-4" />
                  Estado
                </div>
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${sub.color}`}>
                  {subStatus === "active" || subStatus === "trial" ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {sub.label}
                </span>
              </div>

              {subStatus === "trial" && (
                <div className="bg-[rgba(37,99,235,0.08)] border border-[rgba(37,99,235,0.25)] rounded-xl p-4 text-sm text-[#94A3B8]">
                  Estás en el período de prueba gratuito. Próximamente se habilitará el pago para continuar usando el servicio.
                </div>
              )}

              {subStatus === "active" && (
                <div className="bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.2)] rounded-xl p-4">
                  <p className="text-sm text-[#94A3B8]">
                    Plan activo
                    {subscription.created_at && (
                      <> · desde el {new Date(subscription.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}</>
                    )}
                  </p>
                </div>
              )}

              {(subStatus === "active" || subStatus === "trial") && (
                <div className="bg-[#0a0a0f] border border-[rgba(124,58,237,0.15)] rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-widest">Tu plan incluye</p>
                  <ul className="space-y-1.5 mt-2">
                    {["Detección ilimitada de carritos", "Mails automáticos 24/7", "Dashboard de métricas en tiempo real", "Cancelás cuando querés"].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-[#F1F5F9]">
                        <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED] shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Section>

          {/* Integraciones */}
          <Section title="Integraciones">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[rgba(124,58,237,0.12)] flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">TiendaNube</p>
                    <p className="text-xs text-[#64748B]">
                      {isTnConnected
                        ? `ID: ${onboarding.tn_store_id}`
                        : onboarding.tn_disconnected_at
                          ? `Desconectada el ${new Date(onboarding.tn_disconnected_at).toLocaleDateString("es-AR")}`
                          : "No conectada"}
                    </p>
                  </div>
                </div>
                {isTnConnected ? (
                  <span className="flex items-center gap-1 text-xs font-medium text-green-400">
                    <CheckCircle className="w-3.5 h-3.5" /> Conectada
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-medium text-red-400">
                    <XCircle className="w-3.5 h-3.5" /> Desconectada
                  </span>
                )}
              </div>

              {isTnConnected && !confirmDisconnect && (
                <button
                  onClick={() => setConfirmDisconnect(true)}
                  className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-red-400 transition-colors"
                >
                  <Unplug className="w-3.5 h-3.5" />
                  Desconectar TiendaNube
                </button>
              )}

              {isTnConnected && confirmDisconnect && (
                <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-400">¿Desconectar la tienda?</p>
                  <p className="text-xs text-[#94A3B8]">El sistema dejará de detectar carritos hasta que vuelvas a conectarla.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDisconnectTN}
                      disabled={disconnecting}
                      className="flex items-center gap-1.5 text-xs bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                      {disconnecting ? "Desconectando..." : "Confirmar"}
                    </button>
                    <button onClick={() => setConfirmDisconnect(false)} className="text-xs text-[#94A3B8] hover:text-white px-4 py-2 rounded-lg transition-colors">
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {!isTnConnected && (
                <button
                  onClick={() => { window.location.href = "/api/tiendanube/connect"; }}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Reconectar TiendaNube
                </button>
              )}

              {onboarding.n8n_client_id && (
                <div className="pt-3 border-t border-[rgba(255,255,255,0.05)]">
                  <p className="text-xs text-[#64748B]">
                    Workflows activos · ID: <span className="font-mono text-[#94A3B8]">{onboarding.n8n_client_id}</span>
                  </p>
                </div>
              )}
            </div>
          </Section>

          {/* Zona de peligro */}
          <Section title="Zona de peligro">
            {!confirmDelete ? (
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-lg bg-[rgba(239,68,68,0.12)] flex items-center justify-center shrink-0">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold mb-1">Eliminar cuenta</p>
                  <p className="text-xs text-[#64748B] mb-4">Eliminás todos tus datos de forma permanente. Los workflows de N8N se desactivan. Esta acción no se puede deshacer.</p>
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-2 border border-[rgba(239,68,68,0.4)] hover:border-red-500 text-red-400 hover:text-red-300 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-semibold">Esta acción es irreversible</p>
                </div>
                <p className="text-sm text-[#94A3B8]">
                  Para confirmar, escribí tu email: <span className="font-mono text-white">{user.email}</span>
                </p>
                <input
                  type="email"
                  value={deleteInput}
                  onChange={(e) => setDeleteInput(e.target.value)}
                  placeholder={user.email}
                  className="w-full bg-[#0a0a0f] border border-[rgba(239,68,68,0.4)] focus:border-red-500 rounded-xl px-4 py-3 text-sm text-[#F1F5F9] outline-none transition-colors"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteInput !== user.email}
                    className="flex items-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  >
                    {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    {deleting ? "Eliminando..." : "Eliminar cuenta definitivamente"}
                  </button>
                  <button
                    onClick={() => { setConfirmDelete(false); setDeleteInput(""); }}
                    className="text-sm text-[#94A3B8] hover:text-white px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </Section>

        </div>
      </main>
    </div>
  );
}
