"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ShoppingCart, Mail, CreditCard, CheckCircle, Loader2, ExternalLink, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const STEPS = [
  { id: 1, label: "Tienda", icon: ShoppingCart },
  { id: 2, label: "Gmail", icon: Mail },
  { id: 3, label: "Activar", icon: CreditCard },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [tnStoreId, setTnStoreId] = useState("");
  const [tnApiToken, setTnApiToken] = useState("");
  const [tnErrors, setTnErrors] = useState<Record<string, string>>({});

  const [gmailConnected, setGmailConnected] = useState(false);
  const [onboardingId, setOnboardingId] = useState<string | null>(null);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Detectar si el usuario acaba de conectar Google OAuth
    const hasGoogle = user.identities?.some(i => i.provider === "google");

    const { data } = await supabase
      .from("onboarding_data")
      .select("*")
      .eq("client_id", user.id)
      .single();

    if (data) {
      setOnboardingId(data.id);
      if (data.tn_store_id) setTnStoreId(data.tn_store_id);
      if (data.tn_api_token) setTnApiToken(data.tn_api_token);

      // Si tiene Google conectado y no estaba marcado, actualizar DB
      if (hasGoogle && !data.gmail_connected) {
        await supabase
          .from("onboarding_data")
          .update({ gmail_connected: true })
          .eq("id", data.id);
        setGmailConnected(true);
        setCurrentStep(3);
        toast.success("¡Gmail conectado correctamente!");
      } else {
        setGmailConnected(data.gmail_connected ?? false);
        if (data.gmail_connected) setCurrentStep(3);
        else if (data.tn_store_id) setCurrentStep(2);
      }
    } else if (hasGoogle) {
      setGmailConnected(true);
    }

    setInitialLoading(false);
  }

  async function saveStep1() {
    const errs: Record<string, string> = {};
    if (!tnStoreId.trim()) errs.tnStoreId = "El Store ID es obligatorio";
    if (!tnApiToken.trim()) errs.tnApiToken = "El API Token es obligatorio";
    if (Object.keys(errs).length) { setTnErrors(errs); return; }
    setTnErrors({});
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    let error;
    if (onboardingId) {
      ({ error } = await supabase.from("onboarding_data").update({
        tn_store_id: tnStoreId,
        tn_api_token: tnApiToken,
      }).eq("id", onboardingId));
    } else {
      const { data, error: insertError } = await supabase.from("onboarding_data").insert({
        client_id: user.id,
        tn_store_id: tnStoreId,
        tn_api_token: tnApiToken,
      }).select().single();
      error = insertError;
      if (data) setOnboardingId(data.id);
    }

    if (error) {
      toast.error("Error guardando los datos. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    toast.success("¡Tienda conectada!");
    setCurrentStep(2);
    setLoading(false);
  }

  async function connectGmail() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "email profile https://www.googleapis.com/auth/gmail.send",
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });

    if (error) {
      toast.error("Error conectando Gmail. Intentá de nuevo.");
      setLoading(false);
    }
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
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">Nova Recover</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-3xl font-black mb-2">Configurá tu cuenta</h1>
          <p className="text-[#94A3B8]">Solo 3 pasos para tener el sistema activo.</p>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const done = currentStep > step.id;
            const active = currentStep === step.id;
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    done
                      ? "bg-[#7C3AED] text-white"
                      : active
                      ? "bg-gradient-to-br from-[#7C3AED] to-[#2563EB] text-white shadow-lg shadow-[rgba(124,58,237,0.4)]"
                      : "bg-[#111118] border border-[rgba(124,58,237,0.2)] text-[#94A3B8]"
                  }`}>
                    {done ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <span className={`text-xs font-medium ${active ? "text-white" : "text-[#94A3B8]"}`}>
                    {step.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-px mx-3 mb-5 transition-colors ${currentStep > step.id ? "bg-[#7C3AED]" : "bg-[rgba(124,58,237,0.2)]"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
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
                  <p className="text-sm text-[#94A3B8]">Necesitamos acceso a tu tienda para detectar los carritos.</p>
                </div>
              </div>

              <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4 mb-6">
                <p className="text-sm text-[#94A3B8]">
                  Encontrás estos datos en{" "}
                  <span className="text-white font-medium">Tu tienda → Mis aplicaciones → API</span>{" "}
                  dentro del panel de TiendaNube.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Store ID</label>
                  <input
                    type="text"
                    placeholder="Ej: 123456"
                    value={tnStoreId}
                    onChange={(e) => setTnStoreId(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[rgba(124,58,237,0.25)] rounded-xl px-4 py-3 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                  {tnErrors.tnStoreId && <p className="text-red-400 text-xs mt-1">{tnErrors.tnStoreId}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">API Token</label>
                  <input
                    type="password"
                    placeholder="tu_api_token_aqui"
                    value={tnApiToken}
                    onChange={(e) => setTnApiToken(e.target.value)}
                    className="w-full bg-[#0a0a0f] border border-[rgba(124,58,237,0.25)] rounded-xl px-4 py-3 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                  {tnErrors.tnApiToken && <p className="text-red-400 text-xs mt-1">{tnErrors.tnApiToken}</p>}
                </div>
              </div>

              <button
                onClick={saveStep1}
                disabled={loading}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 disabled:opacity-60 text-white py-3.5 rounded-xl font-semibold transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Guardando..." : "Conectar tienda →"}
              </button>
            </div>
          )}

          {/* Paso 2: Gmail */}
          {currentStep === 2 && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#2563EB] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-black text-xl">Conectar Gmail</h2>
                  <p className="text-sm text-[#94A3B8]">Los mails de recuperación salen desde tu cuenta.</p>
                </div>
              </div>

              <div className="bg-[rgba(124,58,237,0.08)] border border-[rgba(124,58,237,0.2)] rounded-xl p-4 mb-6 space-y-2">
                <p className="text-sm font-medium">¿Por qué conectar Gmail?</p>
                <ul className="space-y-1">
                  {[
                    "Los mails llegan desde una dirección conocida por el cliente",
                    "Mayor tasa de apertura y menos rebotes",
                    "Solo usamos el permiso de envío — no leemos tus mails",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2 text-sm text-[#94A3B8]">
                      <CheckCircle className="w-3.5 h-3.5 text-[#7C3AED] mt-0.5 shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {gmailConnected ? (
                <div className="flex items-center gap-3 bg-[rgba(34,197,94,0.1)] border border-[rgba(34,197,94,0.3)] rounded-xl p-4 mb-6">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium text-sm">Gmail conectado correctamente</span>
                </div>
              ) : null}

              <button
                onClick={connectGmail}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white hover:bg-gray-100 disabled:opacity-60 text-gray-900 py-3.5 rounded-xl font-semibold transition-all mb-3"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                {loading ? "Redirigiendo..." : gmailConnected ? "Reconectar Gmail" : "Conectar con Google"}
              </button>

              {gmailConnected && (
                <button
                  onClick={() => setCurrentStep(3)}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#2563EB] hover:opacity-90 text-white py-3.5 rounded-xl font-semibold transition-all"
                >
                  Continuar →
                </button>
              )}

              <button
                onClick={() => setCurrentStep(1)}
                className="mt-3 w-full text-sm text-[#94A3B8] hover:text-white transition-colors py-2"
              >
                ← Volver al paso anterior
              </button>
            </div>
          )}

          {/* Paso 3: Activar */}
          {currentStep === 3 && (
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
                  {[
                    "Detección ilimitada de carritos",
                    "Mails automáticos 24/7",
                    "Dashboard de métricas",
                    "Cancelás cuando querés",
                  ].map((f) => (
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

              <p className="text-center text-xs text-[#94A3B8] mt-3">
                Pago seguro con Stripe. Podés cancelar en cualquier momento.
              </p>

              <button
                onClick={() => setCurrentStep(2)}
                className="mt-3 w-full text-sm text-[#94A3B8] hover:text-white transition-colors py-2"
              >
                ← Volver al paso anterior
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
