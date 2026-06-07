import { sanitizeHtml } from "@/lib/sanitize";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  palette: { bg: string; card: string; accent: string; text: string };
  build: (storeName: string, checkoutLink: string) => string;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function base(bg: string, card: string, accent: string, text: string, storeName: string, checkoutLink: string, opts: {
  badge?: string;
  headline: string;
  sub: string;
  cta: string;
  features?: string[];
}) {
  const { badge = "Stock limitado", headline, sub, cta, features = ["Envio gratis todo el pais", "Pago seguro"] } = opts;
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:${bg};font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:32px 0;">
<tr><td align="center" style="padding:0 16px;">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">
<tr><td style="padding:0 0 24px;text-align:center;"><p style="margin:0;font-size:22px;font-weight:900;letter-spacing:6px;text-transform:uppercase;color:${text};">${sanitizeHtml(storeName)}</p></td></tr>
<tr><td style="background:${card};border-radius:16px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:${accent};padding:10px 28px;"><p style="margin:0;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:${bg};">${badge}</p></td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 28px 24px;">
<p style="margin:0 0 6px;font-size:13px;color:${text};opacity:0.5;">Hola {{ $json.nombre_contacto }},</p>
<p style="margin:0 0 16px;font-size:30px;font-weight:900;text-transform:uppercase;color:${text};line-height:1.1;">${headline}</p>
<p style="margin:0 0 24px;font-size:14px;color:${text};opacity:0.55;line-height:1.7;">${sub}</p>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td align="center">
<a href="${checkoutLink}" style="display:block;background:${accent};color:${bg};font-weight:900;font-size:15px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:18px 32px;border-radius:10px;text-align:center;">${cta}</a>
</td></tr></table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(128,128,128,0.12);">
<tr>${features.map((f, i) => `<td style="padding:14px 0;text-align:center;${i < features.length - 1 ? `border-right:1px solid rgba(128,128,128,0.12);` : ""}"><p style="margin:0;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${text};">${f}</p></td>`).join("")}</tr>
</table>
</td></tr>
<tr><td style="padding:20px 0;text-align:center;"><p style="margin:0;font-size:11px;color:${text};opacity:0.2;">${sanitizeHtml(storeName)}</p></td></tr>
</table></td></tr></table></body></html>`;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "dark-minimal",
    name: "Dark Minimal",
    description: "Oscuro con acento cyan. Clásico y directo.",
    palette: { bg: "#030303", card: "#0f0f0f", accent: "#00C4D4", text: "#ffffff" },
    build: (s, l) => base("#030303", "#0f0f0f", "#00C4D4", "#ffffff", s, l, {
      headline: "Tu carrito<br>te espera.<br><span style='color:#00C4D4'>¿Lo querés?</span>",
      sub: "Dejaste algo en el carrito. El stock se mueve rápido y no reservamos unidades.",
      cta: "Completar pedido",
    }),
  },
  {
    id: "white-clean",
    name: "White Clean",
    description: "Fondo blanco, líneas limpias. Para marcas minimalistas.",
    palette: { bg: "#f5f5f5", card: "#ffffff", accent: "#111111", text: "#111111" },
    build: (s, l) => base("#f5f5f5", "#ffffff", "#111111", "#111111", s, l, {
      badge: "Todavía está disponible",
      headline: "Te olvidaste<br>algo.",
      sub: "Tu carrito está esperando. Completá tu compra antes de que se agote el stock.",
      cta: "Ir al carrito →",
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
      sub: "Artículos exclusivos con stock limitado. Completá tu pedido antes de que se agoten.",
      cta: "Finalizar compra",
    }),
  },
  {
    id: "bold-purple",
    name: "Bold Purple",
    description: "Violeta vibrante. Moderno y llamativo.",
    palette: { bg: "#1a0533", card: "#2d0a5e", accent: "#a855f7", text: "#ffffff" },
    build: (s, l) => base("#1a0533", "#2d0a5e", "#a855f7", "#ffffff", s, l, {
      badge: "No te lo pierdas",
      headline: "¡Tu carrito<br>sigue acá!",
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
      headline: "No dejes<br>que se vaya.",
      sub: "Elegiste bien. Ahora cerralo. El stock no espera.",
      cta: "Cerrar compra ahora",
      features: ["Entrega rápida", "Devolución gratis"],
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
      sub: "Los productos que elegiste siguen disponibles. Completá tu pedido y lucílos pronto.",
      cta: "Ver mi carrito",
    }),
  },
  {
    id: "tech-green",
    name: "Tech Neon",
    description: "Negro con verde neón. Para tecnología y gadgets.",
    palette: { bg: "#020c02", card: "#041804", accent: "#22c55e", text: "#e0ffe0" },
    build: (s, l) => base("#020c02", "#041804", "#22c55e", "#e0ffe0", s, l, {
      badge: "// Unidades disponibles",
      headline: "Carrito<br>pendiente.",
      sub: "Tenés productos seleccionados. Stock en tiempo real — no garantizamos disponibilidad.",
      cta: "[ COMPLETAR PEDIDO ]",
      features: ["Garantía oficial", "Soporte técnico"],
    }),
  },
  {
    id: "warm-orange",
    name: "Warm Friendly",
    description: "Naranja cálido y amigable. Cercano y conversacional.",
    palette: { bg: "#fff8f0", card: "#ffffff", accent: "#f97316", text: "#1c0a00" },
    build: (s, l) => base("#fff8f0", "#ffffff", "#f97316", "#1c0a00", s, l, {
      badge: "¡Casi lo tenés!",
      headline: "Ey, dejaste<br>cosas en<br>tu carrito 🛒",
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
