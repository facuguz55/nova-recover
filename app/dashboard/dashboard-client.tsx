"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Mail, MousePointerClick, TrendingUp,
  CheckCircle, Clock, XCircle, LogOut, ArrowRight, ShoppingCart, Inbox,
  AlertTriangle, Loader2, Unplug,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AbandonedCart {
  id: string;
  customer_email: string | null;
  customer_name: string | null;
  checkout_url: string | null;
  status: string;
  abandoned_at: string;
  email_sent_at: string | null;
}

interface Props {
  user: { email: string; name: string };
  clientStatus: string;
  onboarding: {
    tn_store_id?: string;
    completed_at?: string;
  } | null;
  tnDisconnectedAt: string | null;
  subscription: {
    status?: string;
    stripe_subscription_id?: string;
  } | null;
  metrics: {
    emailsSent: number;
    conversions: number;
    total: number;
  };
  recentCarts: AbandonedCart[];
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Activo", color: "text-green-400 bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]" },
    trial: { label: "Prueba", color: "text-blue-400 bg-[rgba(37,99,235,0.1)] border-[rgba(37,99,235,0.3)]" },
    pending: { label: "Pendiente", color: "text-yellow-400 bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.3)]" },
    inactive: { label: "Inactivo", color: "text-red-400 bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.color}`}>
      {status === "active" || status === "trial" ? <CheckCircle className="w-3 h-3" /> : status === "inactive" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

function CartStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    pending: { label: "Pendiente", color: "text-yellow-400" },
    emailed: { label: "Mail enviado", color: "text-blue-400" },
    recovered: { label: "Recuperado", color: "text-green-400" },
    dismissed: { label: "Ignorado", color: "text-[#94A3B8]" },
  };
  const s = map[status] ?? { label: status, color: "text-[#94A3B8]" };
  return <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffH = Math.floor(diffMs / 3600000);
  if (diffH < 24) return `Hace ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD === 1) return "Ayer";
  if (diffD < 7) return `Hace ${diffD} días`;
  return d.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function DashboardClient({ user, clientStatus, onboarding, tnDisconnectedAt, subscription, metrics, recentCarts }: Props) {
  const router = useRouter();
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  async function handleDisconnectTN() {
    setDisconnecting(true);
    try {
      const res = await fetch("/api/tiendanube/disconnect", { method: "DELETE" });
      if (res.ok) {
        toast.success("TiendaNube desconectada correctamente.");
        router.refresh();
      } else {
        toast.error("Error al desconectar. Intentá de nuevo.");
      }
    } catch {
      toast.error("Error de red. Intentá de nuevo.");
    } finally {
      setDisconnecting(false);
      setConfirmDisconnect(false);
    }
  }

  const subStatus = subscription?.status;
  const isActive = clientStatus === "active" || subStatus === "active" || subStatus === "trial";
  const isTnConnected = !!onboarding?.tn_store_id && !tnDisconnectedAt;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#F1F5F9]">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(124,58,237,0.15)] bg-[rgba(10,10,15,0.95)] backdrop-blur-md h-16 flex items-center px-6">
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">Nova Recover</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#94A3B8] hidden sm:block">{user.email}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Salir
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black mb-1">
                Hola, {user.name.split(" ")[0]}
              </h1>
              <p className="text-[#94A3B8]">Resumen de tu sistema de recuperación.</p>
            </div>
            <StatusBadge status={subStatus === "trial" ? "trial" : isActive ? "active" : clientStatus} />
          </div>

          {/* Banner: TiendaNube desconectada */}
          {tnDisconnectedAt && (
            <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.4)] rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.15)] flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-red-400">TiendaNube desconectada</p>
                  <p className="text-sm text-[#94A3B8] mt-0.5">
                    Tu tienda se desconectó el{" "}
                    {new Date(tnDisconnectedAt).toLocaleDateString("es-AR", {
                      day: "numeric",
                      month: "long",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    . El sistema dejó de funcionar hasta que vuelvas a conectarla.
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push("/onboarding")}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shrink-0"
              >
                Reconectar ahora
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isActive && (
            <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.3)] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-semibold mb-1">Tu sistema no está activo todavía</p>
                <p className="text-sm text-[#94A3B8]">
                  {!onboarding?.tn_store_id
                    ? "Completá la configuración para activar el sistema."
                    : "Activá tu suscripción para que el sistema empiece a funcionar."}
                </p>
              </div>
              <button
                onClick={() => router.push("/onboarding")}
                className="flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:opacity-90 transition-all shrink-0"
              >
                {!onboarding?.tn_store_id ? "Completar configuración" : "Activar ahora"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Métricas reales */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: <ShoppingCart className="w-5 h-5" />,
                label: "Carritos detectados",
                value: metrics.total.toString(),
                sub: "en total",
              },
              {
                icon: <Mail className="w-5 h-5" />,
                label: "Mails enviados",
                value: metrics.emailsSent.toString(),
                sub: "de recuperación",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                label: "Recuperados",
                value: metrics.conversions.toString(),
                sub: "ventas cerradas",
              },
              {
                icon: <MousePointerClick className="w-5 h-5" />,
                label: "Tasa de recuperación",
                value: metrics.total > 0
                  ? `${Math.round((metrics.conversions / metrics.total) * 100)}%`
                  : "—",
                sub: "sobre total detectados",
              },
            ].map((card) => (
              <div
                key={card.label}
                className="bg-[#111118] border border-[rgba(124,58,237,0.2)] rounded-2xl p-5"
              >
                <div className="w-9 h-9 rounded-lg bg-[rgba(124,58,237,0.15)] flex items-center justify-center text-[#8B5CF6] mb-4">
                  {card.icon}
                </div>
                <div className="text-2xl font-black mb-0.5">{card.value}</div>
                <div className="text-xs text-[#94A3B8]">{card.label}</div>
                <div className="text-xs text-[#94A3B8]">{card.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tabla de carritos reales */}
            <div className="lg:col-span-2 bg-[#111118] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6">
              <h2 className="font-bold mb-5">Carritos abandonados</h2>
              {recentCarts.length > 0 ? (
                <div className="space-y-3">
                  {recentCarts.map((cart) => (
                    <div
                      key={cart.id}
                      className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {cart.customer_name || cart.customer_email || "Cliente desconocido"}
                        </p>
                        <p className="text-xs text-[#94A3B8]">
                          {cart.customer_email ?? "—"} · {formatDate(cart.abandoned_at)}
                        </p>
                      </div>
                      <div className="text-right flex flex-col items-end gap-1">
                        <CartStatusBadge status={cart.status} />
                        {cart.checkout_url && (
                          <a
                            href={cart.checkout_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#7C3AED] hover:underline"
                          >
                            Ver carrito →
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="w-10 h-10 text-[rgba(124,58,237,0.3)] mb-3" />
                  <p className="text-[#94A3B8] text-sm">
                    Todavía no hay carritos detectados.
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Aparecerán acá cuando TiendaNube notifique carritos abandonados.
                  </p>
                </div>
              )}
            </div>

            {/* Panel de configuración */}
            <div className="bg-[#111118] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6">
              <h2 className="font-bold mb-5">Mi configuración</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <ShoppingCart className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">Tienda</span>
                  </div>
                  {isTnConnected ? (
                    <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Conectada
                    </span>
                  ) : tnDisconnectedAt ? (
                    <span className="text-xs font-medium text-red-400 flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Desconectada
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pendiente
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">Suscripción</span>
                  </div>
                  <StatusBadge status={subStatus ?? "pending"} />
                </div>

                {onboarding?.tn_store_id && (
                  <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] space-y-3">
                    <p className="text-xs text-[#94A3B8]">
                      ID tienda: <span className="text-[#F1F5F9] font-mono">{onboarding.tn_store_id}</span>
                    </p>

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
                      <div className="bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.3)] rounded-xl p-3 space-y-2">
                        <p className="text-xs text-red-400 font-medium">¿Desconectar la tienda?</p>
                        <p className="text-xs text-[#94A3B8]">El sistema dejará de detectar carritos abandonados hasta que vuelvas a conectarla.</p>
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={handleDisconnectTN}
                            disabled={disconnecting}
                            className="flex items-center gap-1 text-xs bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            {disconnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unplug className="w-3 h-3" />}
                            {disconnecting ? "Desconectando..." : "Confirmar"}
                          </button>
                          <button
                            onClick={() => setConfirmDisconnect(false)}
                            disabled={disconnecting}
                            className="text-xs text-[#94A3B8] hover:text-white px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {!isTnConnected && (
                <button
                  onClick={() => window.location.href = "/api/tiendanube/connect"}
                  className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white py-3 rounded-xl text-sm font-semibold transition-all"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Reconectar TiendaNube
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
