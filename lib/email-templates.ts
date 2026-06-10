import { sanitizeHtml } from "@/lib/sanitize";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  palette: { bg: string; card: string; accent: string; text: string };
  build: (storeName: string, checkoutLink: string) => string;
}

// ─── helper ─────────────────────────────────────────────────────────────────

function base(
  bg: string, card: string, accent: string, text: string,
  storeName: string, checkoutLink: string,
  opts: {
    badge?: string;
    headline: string;
    sub: string;
    cta: string;
    features?: string[];
  }
) {
  const {
    badge = "Stock limitado",
    headline, sub, cta,
    features = ["Envío gratis", "Pago seguro", "Devolución fácil"],
  } = opts;

  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:0 0 24px;text-align:center;"><p style="margin:0;font-size:10px;font-weight:800;letter-spacing:6px;text-transform:uppercase;color:${text};opacity:0.3;">${sanitizeHtml(storeName)}</p></td></tr>
<tr><td style="background:${card};border-radius:20px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 32px 28px;background:linear-gradient(150deg,${accent}1a 0%,${card} 55%);">
<table cellpadding="0" cellspacing="0" style="margin-bottom:22px;"><tr><td style="background:${accent};border-radius:100px;padding:7px 18px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:${bg};">${badge}</td></tr></table>
<p style="margin:0 0 8px;font-size:13px;color:${text};opacity:0.45;font-weight:500;">Hola {{ $json.nombre_contacto }},</p>
<p style="margin:0 0 18px;font-size:27px;font-weight:900;color:${text};line-height:1.2;">${headline}</p>
<p style="margin:0 0 28px;font-size:14px;color:${text};opacity:0.55;line-height:1.8;">${sub}</p>
<table cellpadding="0" cellspacing="0"><tr><td style="background:${accent};border-radius:12px;padding:15px 32px;"><a href="${checkoutLink}" style="font-weight:800;font-size:13px;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;color:${bg};white-space:nowrap;">${cta}</a></td></tr></table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${text}14;"><tr>${features.map((f, i) => `<td style="padding:14px 8px;text-align:center;${i < features.length - 1 ? `border-right:1px solid ${text}14;` : ""}"><p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${text};opacity:0.4;">${f}</p></td>`).join("")}</tr></table>
</td></tr>
<tr><td style="padding:24px 0 8px;text-align:center;"><p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:${text};opacity:0.18;">${sanitizeHtml(storeName)}</p></td></tr>
</table>
</td></tr></table>
</body></html>`;
}

// ─── Templates ───────────────────────────────────────────────────────────────

// Layout propio (no usa base): hero con gradiente, barra de progreso de compra,
// CTA grande y bloque de urgencia. Email-safe: tablas + estilos inline.
function buildNeonViolet(storeName: string, checkoutLink: string): string {
  const safe = sanitizeHtml(storeName);
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

<tr><td style="padding:0 0 20px;text-align:center;">
<p style="margin:0;font-size:11px;font-weight:800;letter-spacing:5px;text-transform:uppercase;color:#a78bfa;">${safe}</p>
</td></tr>

<tr><td style="background:#111118;border:1px solid #2d1b4e;border-radius:24px;overflow:hidden;">

<!-- Hero -->
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="padding:40px 36px 8px;background:#1a0b33;background:linear-gradient(160deg,#2d0a5e 0%,#1a0b33 45%,#111118 100%);text-align:center;">
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;"><tr>
<td style="background:#a855f7;background:linear-gradient(90deg,#8b5cf6,#c026d3);border-radius:100px;padding:8px 20px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">🛒 Tu carrito sigue vivo</td>
</tr></table>
<p style="margin:0 0 10px;font-size:32px;font-weight:900;color:#ffffff;line-height:1.15;">Estás a un paso<br>de que sea tuyo.</p>
<p style="margin:0 0 6px;font-size:14px;color:#c4b5fd;line-height:1.7;">Hola {{ $json.nombre_contacto }} 👋 — guardamos tu carrito,<br>pero el stock no espera a nadie.</p>
</td></tr></table>

<!-- Barra de progreso -->
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 36px 6px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;">Elegiste ✓</td>
<td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;text-align:center;">Carrito ✓</td>
<td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;">Pago&nbsp;&nbsp;○</td>
</tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr>
<td width="66%" style="height:6px;background:#a855f7;background:linear-gradient(90deg,#8b5cf6,#c026d3);border-radius:100px 0 0 100px;font-size:0;line-height:0;">&nbsp;</td>
<td width="34%" style="height:6px;background:#26203a;border-radius:0 100px 100px 0;font-size:0;line-height:0;">&nbsp;</td>
</tr></table>
<p style="margin:10px 0 0;font-size:12px;color:#94a3b8;text-align:center;">Tu compra está <strong style="color:#c084fc;">66% completa</strong> — solo falta confirmar el pago.</p>
</td></tr></table>

<!-- CTA -->
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:26px 36px 10px;" align="center">
<table cellpadding="0" cellspacing="0" width="100%"><tr>
<td style="background:#a855f7;background:linear-gradient(90deg,#8b5cf6,#c026d3);border-radius:14px;text-align:center;">
<a href="${checkoutLink}" style="display:block;padding:18px 32px;font-weight:800;font-size:15px;letter-spacing:0.5px;text-decoration:none;color:#ffffff;">Completar mi compra →</a>
</td></tr></table>
<p style="margin:12px 0 0;font-size:11px;color:#64748b;">Un clic y volvés exactamente donde lo dejaste.</p>
</td></tr></table>

<!-- Urgencia -->
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:18px 36px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1126;border:1px solid #3b2a5e;border-radius:14px;"><tr>
<td style="padding:14px 18px;font-size:12px;color:#c4b5fd;line-height:1.6;">⚡ <strong style="color:#ffffff;">Atención:</strong> no reservamos unidades. Si se agota tu talle o color, desaparece del carrito.</td>
</tr></table>
</td></tr></table>

<!-- Features -->
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2d1b4e;"><tr>
<td style="padding:16px 8px;text-align:center;border-right:1px solid #2d1b4e;"><p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#8b5cf6;">🚚 Envío rápido</p></td>
<td style="padding:16px 8px;text-align:center;border-right:1px solid #2d1b4e;"><p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#8b5cf6;">🔒 Pago seguro</p></td>
<td style="padding:16px 8px;text-align:center;"><p style="margin:0;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#8b5cf6;">↩️ Devolución fácil</p></td>
</tr></table>

</td></tr>

<tr><td style="padding:24px 0 8px;text-align:center;">
<p style="margin:0 0 4px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#475569;">${safe}</p>
<p style="margin:0;font-size:10px;color:#334155;">Recibiste este mail porque dejaste productos en tu carrito.</p>
</td></tr>

</table>
</td></tr></table>
</body></html>`;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "neon-violet",
    name: "Neon Violet",
    description: "Violeta neon con barra de progreso de compra. El más completo.",
    palette: { bg: "#0a0a0f", card: "#111118", accent: "#a855f7", text: "#ffffff" },
    build: buildNeonViolet,
  },
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "Oscuro con acento cyan. Clásico y directo.",
    palette: { bg: "#030303", card: "#0f0f0f", accent: "#00C4D4", text: "#ffffff" },
    build: (s, l) => base("#030303", "#0f0f0f", "#00C4D4", "#ffffff", s, l, {
      badge: "Stock limitado",
      headline: "Tu carrito<br>te espera.",
      sub: "Dejaste algo sin comprar. El stock se mueve rápido y no reservamos unidades.",
      cta: "Completar pedido",
    }),
  },
  {
    id: "white-clean",
    name: "White Clean",
    description: "Fondo blanco, líneas limpias. Para marcas minimalistas.",
    palette: { bg: "#f5f5f5", card: "#ffffff", accent: "#111111", text: "#111111" },
    build: (s, l) => base("#f5f5f5", "#ffffff", "#111111", "#111111", s, l, {
      badge: "Todavía disponible",
      headline: "Te faltó<br>un clic.",
      sub: "Tu carrito está esperando. Completá tu compra antes de que el stock se agote.",
      cta: "Ver mi carrito →",
    }),
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description: "Negro mate con dorado. Para marcas premium.",
    palette: { bg: "#0a0805", card: "#141008", accent: "#c9a84c", text: "#f5e6c8" },
    build: (s, l) => base("#0a0805", "#141008", "#c9a84c", "#f5e6c8", s, l, {
      badge: "Reservado para vos",
      headline: "Tu selección<br>te espera.",
      sub: "Artículos de edición limitada. Completá tu pedido antes de que se agoten.",
      cta: "Finalizar compra",
      features: ["Envío premium", "Pago seguro", "Devolución fácil"],
    }),
  },
  {
    id: "bold-purple",
    name: "Bold Purple",
    description: "Violeta vibrante. Moderno y llamativo.",
    palette: { bg: "#1a0533", card: "#2d0a5e", accent: "#a855f7", text: "#ffffff" },
    build: (s, l) => base("#1a0533", "#2d0a5e", "#a855f7", "#ffffff", s, l, {
      badge: "No te lo pierdas",
      headline: "Tu carrito<br>sigue acá.",
      sub: "No pierdas lo que ya elegiste. Stock limitado — completá tu compra ahora.",
      cta: "Completar pedido",
    }),
  },
  {
    id: "sports-red",
    name: "Sports Red",
    description: "Agresivo y de impacto. Ideal para indumentaria deportiva.",
    palette: { bg: "#0d0d0d", card: "#1a0000", accent: "#ef4444", text: "#ffffff" },
    build: (s, l) => base("#0d0d0d", "#1a0000", "#ef4444", "#ffffff", s, l, {
      badge: "⚡ Stock por agotarse",
      headline: "No lo dejés<br>escapar.",
      sub: "Elegiste bien. Ahora cerralo. El stock no espera y nadie reserva por vos.",
      cta: "Cerrar compra",
      features: ["Entrega rápida", "Pago seguro", "Devolución gratis"],
    }),
  },
  {
    id: "fashion-beige",
    name: "Fashion",
    description: "Beige cálido y elegante. Para moda y lifestyle.",
    palette: { bg: "#f9f4ee", card: "#ffffff", accent: "#8b6f5e", text: "#2c1810" },
    build: (s, l) => base("#f9f4ee", "#ffffff", "#8b6f5e", "#2c1810", s, l, {
      badge: "Pensado para vos",
      headline: "Tu estilo<br>te espera.",
      sub: "Los productos que elegiste siguen disponibles. Completá tu pedido y lucílos.",
      cta: "Ver mi carrito",
    }),
  },
  {
    id: "tech-green",
    name: "Tech Neon",
    description: "Negro con verde neón. Para tecnología y gadgets.",
    palette: { bg: "#020c02", card: "#041804", accent: "#22c55e", text: "#e0ffe0" },
    build: (s, l) => base("#020c02", "#041804", "#22c55e", "#e0ffe0", s, l, {
      badge: "// Disponible ahora",
      headline: "Carrito<br>pendiente.",
      sub: "Tenés productos esperando. Stock en tiempo real — no garantizamos disponibilidad.",
      cta: "[ Completar pedido ]",
      features: ["Garantía oficial", "Envío rápido", "Soporte técnico"],
    }),
  },
  {
    id: "warm-orange",
    name: "Warm Friendly",
    description: "Naranja cálido y amigable. Cercano y conversacional.",
    palette: { bg: "#fff8f0", card: "#ffffff", accent: "#f97316", text: "#1c0a00" },
    build: (s, l) => base("#fff8f0", "#ffffff", "#f97316", "#1c0a00", s, l, {
      badge: "¡Casi lo tenés!",
      headline: "Oye, ¿te<br>olvidaste algo?",
      sub: "Son productos que ya elegiste. Solo falta un paso para que sean tuyos.",
      cta: "Terminar mi compra",
    }),
  },
];

export function getTemplate(id: string): EmailTemplate {
  return EMAIL_TEMPLATES.find((t) => t.id === id) ?? EMAIL_TEMPLATES[0];
}

export function buildSubject(template: string, storeName: string): string {
  return template.replace(/\{store\}/g, storeName);
}
