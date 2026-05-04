"use client";

import { useRouter } from "next/navigation";
import {
  Zap, Mail, MousePointerClick, TrendingUp, Settings,
  CheckCircle, Clock, XCircle, LogOut, ArrowRight, ShoppingCart
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  user: { email: string; name: string };
  clientStatus: string;
  onboarding: {
    tn_store_id?: string;
    gmail_connected?: boolean;
    completed_at?: string;
  } | null;
  subscription: {
    status?: string;
    stripe_subscription_id?: string;
  } | null;
}

// Datos mockeados para el MVP
const MOCK_METRICS = {
  emailsSent: 142,
  clicks: 38,
  conversions: 11,
  recovered: 1243.50,
};

const MOCK_RECENT = [
  { email: "maria@example.com", cart: "$8,500", status: "convertido", date: "Hoy 14:32" },
  { email: "juan.perez@gmail.com", cart: "$3,200", status: "clic", date: "Hoy 11:05" },
  { email: "comercial@tienda.com", cart: "$15,000", status: "enviado", date: "Ayer 20:18" },
  { email: "cliente@mail.com", cart: "$4,800", status: "convertido", date: "Ayer 16:40" },
  { email: "compras@negocio.ar", cart: "$6,100", status: "enviado", date: "Ayer 09:12" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    active: { label: "Activo", color: "text-green-400 bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.3)]" },
    pending: { label: "Pendiente", color: "text-yellow-400 bg-[rgba(234,179,8,0.1)] border-[rgba(234,179,8,0.3)]" },
    inactive: { label: "Inactivo", color: "text-red-400 bg-[rgba(239,68,68,0.1)] border-[rgba(239,68,68,0.3)]" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${s.color}`}>
      {status === "active" ? <CheckCircle className="w-3 h-3" /> : status === "inactive" ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {s.label}
    </span>
  );
}

function EmailStatus({ status }: { status: string }) {
  const map: Record<string, string> = {
    convertido: "text-green-400",
    clic: "text-blue-400",
    enviado: "text-[#94A3B8]",
  };
  return <span className={`text-xs font-medium capitalize ${map[status] ?? "text-[#94A3B8]"}`}>{status}</span>;
}

export default function DashboardClient({ user, clientStatus, onboarding, subscription }: Props) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  const isActive = clientStatus === "active" || subscription?.status === "active";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#F1F5F9]">
      {/* Sidebar + top nav */}
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

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h1 className="text-3xl font-black mb-1">
                Hola, {user.name.split(" ")[0]} 👋
              </h1>
              <p className="text-[#94A3B8]">Acá está el resumen de tu sistema de recuperación.</p>
            </div>
            <StatusBadge status={isActive ? "active" : clientStatus} />
          </div>

          {/* Alerta si no está activo */}
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

          {/* Metrics cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                icon: <Mail className="w-5 h-5" />,
                label: "Mails enviados",
                value: isActive ? MOCK_METRICS.emailsSent.toString() : "—",
                sub: "este mes",
              },
              {
                icon: <MousePointerClick className="w-5 h-5" />,
                label: "Clics registrados",
                value: isActive ? MOCK_METRICS.clicks.toString() : "—",
                sub: "este mes",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                label: "Conversiones",
                value: isActive ? MOCK_METRICS.conversions.toString() : "—",
                sub: "ventas recuperadas",
              },
              {
                icon: <ShoppingCart className="w-5 h-5" />,
                label: "Monto recuperado",
                value: isActive ? `$${MOCK_METRICS.recovered.toLocaleString("es-AR")}` : "—",
                sub: "este mes",
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
            {/* Tabla de actividad reciente */}
            <div className="lg:col-span-2 bg-[#111118] border border-[rgba(124,58,237,0.2)] rounded-2xl p-6">
              <h2 className="font-bold mb-5">Actividad reciente</h2>
              {isActive ? (
                <div className="space-y-3">
                  {MOCK_RECENT.map((row, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                      <div>
                        <p className="text-sm font-medium">{row.email}</p>
                        <p className="text-xs text-[#94A3B8]">{row.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{row.cart}</p>
                        <EmailStatus status={row.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Mail className="w-10 h-10 text-[rgba(124,58,237,0.3)] mb-3" />
                  <p className="text-[#94A3B8] text-sm">La actividad aparecerá cuando el sistema esté activo.</p>
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
                  {onboarding?.tn_store_id ? (
                    <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Conectada
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-yellow-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pendiente
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#94A3B8]">Gmail</span>
                  </div>
                  {onboarding?.gmail_connected ? (
                    <span className="text-xs font-medium text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Conectado
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
                  <StatusBadge status={subscription?.status === "active" ? "active" : "pending"} />
                </div>
              </div>

              <button
                onClick={() => router.push("/onboarding")}
                className="mt-6 w-full flex items-center justify-center gap-2 border border-[rgba(124,58,237,0.3)] hover:border-[rgba(124,58,237,0.6)] text-[#8B5CF6] hover:text-white py-3 rounded-xl text-sm font-medium transition-all"
              >
                <Settings className="w-4 h-4" />
                Ver configuración
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
