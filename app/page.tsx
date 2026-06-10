import Link from "next/link";
import { ArrowRight, ShoppingCart, Mail, Zap, CheckCircle, TrendingUp, Bell, BarChart3, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function LandingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-[#F1F5F9]">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(139,92,246,0.15)] bg-[rgba(10,10,15,0.85)] backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#c026d3] flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">Nova Recover</span>
          </div>
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 text-sm bg-[#0d0d14] hover:bg-[#111118] text-[#A78BFA] px-4 py-2 rounded-lg font-medium transition-all border border-[#8b5cf6] shadow-[0_0_12px_rgba(139,92,246,0.35)] hover:shadow-[0_0_20px_rgba(139,92,246,0.55)]"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Ir al dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-sm text-[#94A3B8] hover:text-white transition-colors">
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-[#8b5cf6] hover:bg-[#a78bfa] text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Empezar gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15)_0%,transparent_70%)] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.3)] rounded-full px-4 py-2 text-sm font-medium text-[#a78bfa] mb-8">
            <Bell className="w-3.5 h-3.5" />
            Sistema automático de recuperación de carritos
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight mb-6">
            Recuperá{" "}
            <span className="gradient-text">ventas perdidas</span>
            <br />
            en tu tienda TiendaNube
          </h1>

          <p className="text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Cada carrito abandonado es plata que ya estuvo en tu tienda.
            Nova Recover detecta esos carritos y manda mails automáticos para
            traer al cliente de vuelta, sin que vos hagas nada.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#c026d3] hover:opacity-90 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-lg shadow-[rgba(139,92,246,0.3)]"
            >
              Empezar ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 bg-[#0d0d14] hover:bg-[#111118] text-[#A78BFA] px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 border border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.45)] hover:shadow-[0_0_32px_rgba(139,92,246,0.65)]"
            >
              <LayoutDashboard className="w-5 h-5" />
              Ir al dashboard
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { value: "+23%", label: "tasa de recuperación" },
              { value: "< 5 min", label: "para conectar" },
              { value: "24/7", label: "en piloto automático" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-[#94A3B8] mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section id="como-funciona" className="py-24 px-6 bg-[#0d0d14]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.3)] rounded-full px-4 py-2 text-sm font-medium text-[#a78bfa] mb-6">
              ¿Cómo funciona?
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-4">En 3 pasos y listo</h2>
            <p className="text-[#94A3B8] text-lg">
              No necesitás saber de tecnología. Conectás y nosotros nos encargamos del resto.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                icon: <ShoppingCart className="w-7 h-7" />,
                title: "Conectás tu tienda",
                desc: "Ingresás tu Store ID y API Token de TiendaNube. Son dos campos, menos de un minuto.",
              },
              {
                step: "02",
                icon: <Zap className="w-7 h-7" />,
                title: "Activás el servicio",
                desc: "Con el pago de la suscripción el sistema arranca automáticamente. A partir de ahí trabaja solo.",
              },
              {
                step: "03",
                icon: <Mail className="w-7 h-7" />,
                title: "El sistema trabaja solo",
                desc: "Detecta cada carrito abandonado y manda mails de recuperación en el momento justo, sin que vos hagas nada.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-[#111118] border border-[rgba(139,92,246,0.2)] rounded-2xl p-7 hover:border-[rgba(139,92,246,0.4)] transition-all group"
              >
                <div className="absolute top-6 right-6 text-5xl font-black text-[rgba(139,92,246,0.08)] group-hover:text-[rgba(139,92,246,0.12)] transition-colors select-none">
                  {item.step}
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#c026d3] flex items-center justify-center text-white mb-5">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-[#94A3B8] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">
              Todo incluido en{" "}
              <span className="gradient-text">un solo sistema</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                icon: <Bell className="w-5 h-5" />,
                title: "Detección automática",
                desc: "Identifica cada carrito abandonado en tu tienda en tiempo real.",
              },
              {
                icon: <Mail className="w-5 h-5" />,
                title: "Secuencia de mails",
                desc: "Manda una serie de mails estratégicos en el momento justo para maximizar la recuperación.",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                title: "Seguimiento de clics",
                desc: "Sabés exactamente cuántos clientes abrieron el mail y volvieron a tu tienda.",
              },
              {
                icon: <BarChart3 className="w-5 h-5" />,
                title: "Dashboard de métricas",
                desc: "Ves en tiempo real cuántos mails se enviaron, clics y ventas recuperadas.",
              },
              {
                icon: <CheckCircle className="w-5 h-5" />,
                title: "Mails de recuperación automáticos",
                desc: "El sistema manda la secuencia de mails en el momento exacto para maximizar la chance de que el cliente vuelva.",
              },
              {
                icon: <Zap className="w-5 h-5" />,
                title: "100% automático",
                desc: "Una vez activo no necesitás hacer nada. El sistema trabaja solo, 24 horas al día.",
              },
            ].map((feat) => (
              <div
                key={feat.title}
                className="flex gap-4 bg-[#111118] border border-[rgba(139,92,246,0.15)] rounded-xl p-5 hover:border-[rgba(139,92,246,0.35)] transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[rgba(139,92,246,0.15)] flex items-center justify-center text-[#a78bfa] shrink-0">
                  {feat.icon}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{feat.title}</h4>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 bg-[#0d0d14]">
        <div className="max-w-lg mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[rgba(139,92,246,0.12)] border border-[rgba(139,92,246,0.3)] rounded-full px-4 py-2 text-sm font-medium text-[#a78bfa] mb-8">
            Precio
          </div>
          <h2 className="text-4xl font-black mb-4">Un solo plan, todo incluido</h2>
          <p className="text-[#94A3B8] mb-12">Sin costos ocultos. Sin límites de envíos.</p>

          <div className="bg-[#111118] border border-[rgba(139,92,246,0.4)] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8b5cf6] via-[#c026d3] to-[#06B6D4]" />

            <div className="inline-flex items-center gap-2 bg-[rgba(139,92,246,0.15)] text-[#a78bfa] rounded-full px-3 py-1 text-xs font-semibold mb-6">
              MÁS POPULAR
            </div>

            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-2xl text-[#94A3B8] font-medium">USD</span>
              <span className="text-7xl font-black">59</span>
              <span className="text-[#94A3B8] mb-3">/mes</span>
            </div>
            <p className="text-[#94A3B8] text-sm mb-8">Cancelás cuando querés. Sin permanencia.</p>

            <ul className="space-y-3 mb-8 text-left">
              {[
                "Detección ilimitada de carritos abandonados",
                "Secuencia de mails automática",
                "Sistema de mails automáticos",
                "Dashboard de métricas en tiempo real",
                "Soporte por WhatsApp",
                "Sin límite de mails enviados",
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#8b5cf6] shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#8b5cf6] to-[#c026d3] hover:opacity-90 text-white py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] shadow-lg shadow-[rgba(139,92,246,0.3)]"
            >
              Empezar ahora
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-2 w-full bg-[#0d0d14] hover:bg-[#111118] text-[#A78BFA] py-4 rounded-xl font-semibold text-lg transition-all hover:scale-[1.02] border border-[#8b5cf6] shadow-[0_0_20px_rgba(139,92,246,0.45)] hover:shadow-[0_0_32px_rgba(139,92,246,0.65)]"
            >
              <LayoutDashboard className="w-5 h-5" />
              Ir al dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black mb-6">
            ¿Cuánto estás perdiendo{" "}
            <span className="gradient-text">por mes?</span>
          </h2>
          <p className="text-xl text-[#94A3B8] mb-10">
            En promedio el 70% de los carritos se abandonan. Con Nova Recover
            recuperás una parte importante de esa plata, en automático.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#8b5cf6] to-[#c026d3] hover:opacity-90 text-white px-10 py-5 rounded-xl font-bold text-lg transition-all hover:scale-105 shadow-xl shadow-[rgba(139,92,246,0.3)]"
            >
              Empezar ahora — USD 59/mes
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-[#0d0d14] hover:bg-[#111118] text-[#A78BFA] px-10 py-5 rounded-xl font-bold text-lg transition-all hover:scale-105 border border-[#8b5cf6] shadow-[0_0_24px_rgba(139,92,246,0.5)] hover:shadow-[0_0_40px_rgba(139,92,246,0.7)]"
            >
              <LayoutDashboard className="w-5 h-5" />
              Ir al dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(139,92,246,0.15)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#8b5cf6] to-[#c026d3] flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-white">Nova Recover</span>
            <span>— by Nova Agency</span>
          </div>
          <div>© 2025 Nova Agency. Todos los derechos reservados.</div>
        </div>
      </footer>
    </div>
  );
}
