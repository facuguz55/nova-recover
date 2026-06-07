"use client";

import { useState, useEffect, Suspense, Fragment } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Zap, ShoppingCart, CreditCard, CheckCircle, Loader2, ExternalLink, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Tienda", icon: ShoppingCart },
  { id: 2, label: "Activar", icon: CreditCard },
];

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [tnConnected, setTnConnected] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    const justConnectedTN = searchParams.get("tn_connected") === "1";
    const tnError = searchParams.get("tn_error");

    if (tnError) toast.error("Error conectando TiendaNube. Intentá de nuevo.");

    const { data } = await supabase
      .from("onboarding_data")
      .select("*")
      .eq("client_id", user.id)
      .single();

    if (data?.completed_at) {
      router.replace("/dashboard");
      return;
    }

    if (data) {
      const isTnConnected = !!data.tn_store_id && !data.tn_disconnected_at;
      setTnConnected(isTnConnected);
      if (isTnConnected) {
        setCurrentStep(2);
        if (justConnectedTN) toast.success("¡TiendaNube conectada correctamente!");
      }
    }

    setInitialLoading(false);
  }

  function connectTiendaNube() {
    setLoading(true);
    window.location.href = "/api/tiendanube/connect";
  }

  async function goToCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const { url } = await res.json();
      if (url) window.location.href = url;
      else { toast.error("Error al iniciar el pago"); setLoading(false); }
    } catch {
      toast.error("Error de red. Intentá de nuevo.");
      setLoading(false);
    }
  }

  async function activateTrial() {
    setLoading(true);
    try {
      const res = await fetch("/api/trial/activate", { method: "POST" });
      if (res.ok) {
        toast.success("¡Prueba activada! Redirigiendo al dashboard...");
        setTimeout(() => router.push("/dashboard"), 1200);
      } else {
        const data = await res.json();
        toast.error(data.error || "Error activando la prueba.");
        setLoading(false);
      }
    } catch {
      toast.error("Error de red. Intentá de nuevo.");
      setLoading(false);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#F1F5F9] px-6 py-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.1)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-xl mx-auto relative">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">Nova Recover</span>
          </div>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors">
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Configurá tu cuenta</h1>
          <p className="text-[#94A3B8]">Solo 2 pasos para tener el sistema activo.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-start mb-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <Fragment key={step.id}>
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    done ? "bg-[#7C3AED] text-white"
                    : active ? "bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white shadow-lg shadow-[rgba(124,58,237,0.4)]"
                    : "bg-[#111118] border border-[rgba(124,58,237,0.2)] text-[#94A3B8]"
                  }`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-semibold ${active ? "text-white" : done ? "text-[#7C3AED]" : "text-[#94A3B8]"}`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mt-5 mx-4 transition-colors ${currentStep > step.id ? "bg-[#7C3AED]" : "bg-[rgba(124,58,237,0.15)]"}`} />
                )}
              </Fragment>
            );
          })}
        </div>

        <div className="bg-[#111118] border border-[rgba(124,58,237,0.2)] rounded-2xl p-8">

          {/* Paso 1: TiendaNube */}
          {currentStep === 1 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-xl">Conectar TiendaNube</h2>
                  <p className="text-sm text-[#94A3B8]">Autorizá el acceso desde tu panel de TiendaNube.</p>
                </div>
              </div>

              <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4 mb-6 space-y-2">
                <p className="text-sm font-medium">¿Qué pasa cuando hacés clic?</p>
                <ul className="space-y-1.5">
                  {[
                    "Te redirigimos a TiendaNube para que autoricés la app",
                    "Nunca vemos tu contraseña — es OAuth oficial",
                    "Podés revocar el acceso desde tu panel cuando quieras",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED] mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {tnConnected && (
                <div className="flex items-center gap-3 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-xl p-4 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium text-sm">TiendaNube conectada correctamente</span>
                </div>
              )}

              <button
                onClick={connectTiendaNube}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 disabled:opacity-60 text-white py-4 rounded-xl font-semibold transition-all shadow-lg shadow-[rgba(124,58,237,0.3)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                {loading ? "Redirigiendo a TiendaNube..." : tnConnected ? "Reconectar TiendaNube" : "Conectar con TiendaNube"}
              </button>

              {tnConnected && (
                <button
                  onClick={() => setCurrentStep(2)}
                  className="mt-3 w-full flex items-center justify-center gap-2 border border-[rgba(124,58,237,0.3)] hover:border-[rgba(124,58,237,0.6)] text-[#8B5CF6] hover:text-white py-3 rounded-xl text-sm font-medium transition-all"
                >
                  Continuar →
                </button>
              )}
            </div>
          )}

          {/* Paso 2: Activar */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-xl">Activar el servicio</h2>
                  <p className="text-sm text-[#94A3B8]">Un pago y el sistema arranca de inmediato.</p>
                </div>
              </div>

              <div className="bg-[#0a0a0f] border border-[rgba(124,58,237,0.2)] rounded-xl p-5 mb-6">
                <div className="flex items-end gap-1 mb-4">
                  <span className="text-[#94A3B8]">USD</span>
                  <span className="text-5xl font-black">59</span>
                  <span className="text-[#94A3B8] mb-1">/mes</span>
                </div>
                <ul className="space-y-2">
                  {["Detección ilimitada de carritos", "Mails automáticos 24/7", "Dashboard de métricas", "Cancelás cuando querés"].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[#7C3AED]" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={goToCheckout}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-[rgba(124,58,237,0.3)]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ExternalLink className="w-5 h-5" />}
                {loading ? "Redirigiendo a Stripe..." : "Ir al pago seguro"}
              </button>

              <p className="text-center text-xs text-[#94A3B8] mt-3">Pago seguro con Stripe. Podés cancelar en cualquier momento.</p>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[rgba(124,58,237,0.15)]" />
                <span className="text-xs text-[#94A3B8]">o</span>
                <div className="flex-1 h-px bg-[rgba(124,58,237,0.15)]" />
              </div>

              <button
                onClick={activateTrial}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 border border-[rgba(124,58,237,0.3)] hover:border-[rgba(124,58,237,0.6)] disabled:opacity-60 text-[#8B5CF6] hover:text-white py-3 rounded-xl text-sm font-medium transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Probar gratis sin tarjeta
              </button>

              <button onClick={() => setCurrentStep(1)} className="mt-3 w-full text-sm text-[#94A3B8] hover:text-white transition-colors py-2">
                ← Volver al paso anterior
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
