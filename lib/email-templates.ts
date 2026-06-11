import { sanitizeHtml } from "@/lib/sanitize";

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
  palette: { bg: string; card: string; accent: string; text: string };
  build: (storeName: string, checkoutLink: string) => string;
}

// El nombre del contacto lo inyecta n8n en runtime.
const NAME = "{{ $json.nombre_contacto }}";

// Badge "by Nova Agency" — pill que se adapta al estilo de cada template.
function novaBadge(color: string, border: string, font?: string): string {
  return `<table cellpadding="0" cellspacing="0" align="center" style="margin:14px auto 0;"><tr><td style="border:1px solid ${border};border-radius:100px;padding:5px 13px;"><a href="https://novaagency.info" style="text-decoration:none;font-size:9px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${color};${font ? `font-family:${font};` : ""}">⚡ by Nova Agency</a></td></tr></table>`;
}

function doc(bg: string, inner: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:${bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:${bg};padding:40px 16px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">${inner}</table>
</td></tr></table></body></html>`;
}

// ════════════════════════════════════════════════════════════════════════════
//  NEON VIOLET — hero gradiente + barra de progreso de compra
// ════════════════════════════════════════════════════════════════════════════
function buildNeonViolet(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#0a0a0f", `
<tr><td style="padding:0 0 20px;text-align:center;"><p style="margin:0;font-size:11px;font-weight:800;letter-spacing:5px;text-transform:uppercase;color:#a78bfa;">${s}</p></td></tr>
<tr><td style="background:#111118;border:1px solid #2d1b4e;border-radius:24px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 36px 8px;background:linear-gradient(160deg,#2d0a5e 0%,#1a0b33 45%,#111118 100%);text-align:center;">
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 24px;"><tr><td style="background:linear-gradient(90deg,#8b5cf6,#c026d3);border-radius:100px;padding:8px 20px;font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#fff;">🛒 Tu carrito sigue vivo</td></tr></table>
<p style="margin:0 0 10px;font-size:32px;font-weight:900;color:#fff;line-height:1.15;">Estás a un paso<br>de que sea tuyo.</p>
<p style="margin:0 0 6px;font-size:14px;color:#c4b5fd;line-height:1.7;">Hola ${NAME} 👋 — guardamos tu carrito,<br>pero el stock no espera a nadie.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 36px 6px;">
<table width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;">Elegiste ✓</td>
<td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#8b5cf6;text-align:center;">Carrito ✓</td>
<td style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#64748b;text-align:right;">Pago&nbsp;&nbsp;○</td>
</tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;"><tr>
<td width="66%" style="height:6px;background:linear-gradient(90deg,#8b5cf6,#c026d3);border-radius:100px 0 0 100px;font-size:0;line-height:0;">&nbsp;</td>
<td width="34%" style="height:6px;background:#26203a;border-radius:0 100px 100px 0;font-size:0;line-height:0;">&nbsp;</td>
</tr></table>
<p style="margin:10px 0 0;font-size:12px;color:#94a3b8;text-align:center;">Tu compra está <strong style="color:#c084fc;">66% completa</strong> — solo falta confirmar el pago.</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:26px 36px 10px;" align="center">
<table cellpadding="0" cellspacing="0" width="100%"><tr><td style="background:linear-gradient(90deg,#8b5cf6,#c026d3);border-radius:14px;text-align:center;"><a href="${link}" style="display:block;padding:18px 32px;font-weight:800;font-size:15px;text-decoration:none;color:#fff;">Completar mi compra →</a></td></tr></table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:8px 36px 30px;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#1a1126;border:1px solid #3b2a5e;border-radius:14px;"><tr><td style="padding:14px 18px;font-size:12px;color:#c4b5fd;line-height:1.6;">⚡ <strong style="color:#fff;">Atención:</strong> no reservamos unidades. Si se agota tu talle o color, desaparece del carrito.</td></tr></table>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 0 8px;text-align:center;"><p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#475569;">${s}</p>${novaBadge("#8b5cf6","#2d1b4e")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  DARK MINIMAL — cyan, ultra minimalista, mucho aire, líneas finas
// ════════════════════════════════════════════════════════════════════════════
function buildDarkMinimal(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#030303", `
<tr><td style="padding:60px 40px 0;text-align:center;">
<p style="margin:0 0 56px;font-size:10px;font-weight:700;letter-spacing:8px;text-transform:uppercase;color:#00C4D4;">${s}</p>
<p style="margin:0 0 28px;font-size:40px;font-weight:200;color:#fff;line-height:1.1;letter-spacing:-1px;">Tu carrito<br><span style="font-weight:700;">te espera.</span></p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 36px;"><tr><td style="width:40px;height:2px;background:#00C4D4;font-size:0;line-height:0;">&nbsp;</td></tr></table>
<p style="margin:0 0 44px;font-size:15px;color:#888;line-height:1.9;font-weight:300;">Hola ${NAME}. Dejaste algo sin comprar.<br>El stock se mueve rápido y no reservamos unidades.</p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto;"><tr><td style="border:1px solid #00C4D4;border-radius:2px;"><a href="${link}" style="display:block;padding:16px 44px;font-size:11px;font-weight:600;letter-spacing:3px;text-transform:uppercase;text-decoration:none;color:#00C4D4;">Completar pedido</a></td></tr></table>
</td></tr>
<tr><td style="padding:56px 40px;text-align:center;"><p style="margin:0;font-size:9px;letter-spacing:4px;text-transform:uppercase;color:#333;">${s}</p>${novaBadge("#2a7a82","#143034")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  WHITE CLEAN — editorial, blanco, headline grande, reglas finas
// ════════════════════════════════════════════════════════════════════════════
function buildWhiteClean(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#f5f5f5", `
<tr><td style="background:#fff;border-radius:4px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:32px 44px 0;border-bottom:1px solid #ececec;"><p style="margin:0 0 24px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#111;">${s}</p></td></tr>
<tr><td style="padding:48px 44px 0;">
<p style="margin:0 0 8px;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;color:#999;">Todavía disponible</p>
<p style="margin:0 0 24px;font-size:46px;font-weight:800;color:#111;line-height:1.05;letter-spacing:-2px;">Te faltó<br>un clic.</p>
<p style="margin:0 0 36px;font-size:16px;color:#555;line-height:1.7;">Hola ${NAME}, tu carrito está esperando. Completá tu compra antes de que el stock se agote.</p>
<table cellpadding="0" cellspacing="0" style="margin-bottom:48px;"><tr><td style="background:#111;border-radius:2px;"><a href="${link}" style="display:block;padding:17px 40px;font-size:13px;font-weight:700;letter-spacing:1px;text-decoration:none;color:#fff;">Ver mi carrito →</a></td></tr></table>
</td></tr>
<tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #ececec;"><tr>
<td style="padding:20px;text-align:center;border-right:1px solid #ececec;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;">Envío gratis</td>
<td style="padding:20px;text-align:center;border-right:1px solid #ececec;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;">Pago seguro</td>
<td style="padding:20px;text-align:center;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#999;">Devolución fácil</td>
</tr></table></td></tr>
</table></td></tr>
<tr><td style="padding:24px 0;text-align:center;"><p style="margin:0;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#bbb;">${s}</p>${novaBadge("#999","#e0e0e0")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  LUXURY GOLD — negro + dorado, serif, ornamento central, premium
// ════════════════════════════════════════════════════════════════════════════
function buildLuxuryGold(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#0a0805", `
<tr><td style="background:#141008;border:1px solid #2a2010;border-radius:6px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:48px 44px 0;text-align:center;">
<p style="margin:0 0 8px;font-size:11px;font-weight:600;letter-spacing:6px;text-transform:uppercase;color:#c9a84c;">${s}</p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:24px auto 28px;"><tr>
<td style="width:30px;height:1px;background:#c9a84c;font-size:0;">&nbsp;</td>
<td style="padding:0 12px;color:#c9a84c;font-size:14px;">✦</td>
<td style="width:30px;height:1px;background:#c9a84c;font-size:0;">&nbsp;</td>
</tr></table>
<p style="margin:0 0 22px;font-family:Georgia,'Times New Roman',serif;font-size:36px;font-weight:400;color:#f5e6c8;line-height:1.25;font-style:italic;">Tu selección<br>te espera.</p>
<p style="margin:0 0 38px;font-size:14px;color:#a89878;line-height:1.9;">Estimado/a ${NAME}, sus artículos de edición limitada<br>siguen reservados. Complete su pedido antes de que se agoten.</p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 12px;"><tr><td style="background:#c9a84c;border-radius:2px;"><a href="${link}" style="display:block;padding:16px 46px;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;text-decoration:none;color:#0a0805;">Finalizar compra</a></td></tr></table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #2a2010;margin-top:40px;"><tr>
<td style="padding:18px 8px;text-align:center;border-right:1px solid #2a2010;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7a6a44;">Envío premium</td>
<td style="padding:18px 8px;text-align:center;border-right:1px solid #2a2010;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7a6a44;">Pago seguro</td>
<td style="padding:18px 8px;text-align:center;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#7a6a44;">Devolución fácil</td>
</tr></table>
</td></tr>
<tr><td style="padding:24px 0;text-align:center;"><p style="margin:0;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#3a3018;">${s}</p>${novaBadge("#c9a84c","#2a2010","Georgia,serif")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  BOLD PURPLE — violeta vibrante, bloques de color, energético
// ════════════════════════════════════════════════════════════════════════════
function buildBoldPurple(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#1a0533", `
<tr><td style="padding:0 0 18px;text-align:center;"><p style="margin:0;font-size:11px;font-weight:900;letter-spacing:4px;text-transform:uppercase;color:#d8b4fe;">${s}</p></td></tr>
<tr><td style="background:#a855f7;border-radius:28px 28px 0 0;padding:44px 40px 36px;text-align:center;">
<p style="margin:0 0 14px;font-size:64px;line-height:1;">🔥</p>
<p style="margin:0;font-size:38px;font-weight:900;color:#fff;line-height:1.05;letter-spacing:-1px;">Tu carrito<br>sigue acá.</p>
</td></tr>
<tr><td style="background:#2d0a5e;border-radius:0 0 28px 28px;padding:36px 40px 40px;text-align:center;">
<p style="margin:0 0 30px;font-size:16px;color:#e9d5ff;line-height:1.7;font-weight:500;">Hola ${NAME}, no pierdas lo que ya elegiste.<br>Stock limitado — completá tu compra ahora.</p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 14px;"><tr><td style="background:#fff;border-radius:100px;"><a href="${link}" style="display:block;padding:18px 48px;font-size:14px;font-weight:900;letter-spacing:0.5px;text-transform:uppercase;text-decoration:none;color:#a855f7;">Completar pedido</a></td></tr></table>
<p style="margin:14px 0 0;font-size:12px;color:#b794d4;">⏱ No te lo pierdas — el stock se agota rápido</p>
</td></tr>
<tr><td style="padding:22px 0;text-align:center;"><p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#6b3fa0;">${s}</p>${novaBadge("#d8b4fe","#6b3fa0")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  SPORTS RED — rojo/negro, itálicas agresivas, impacto, barra diagonal
// ════════════════════════════════════════════════════════════════════════════
function buildSportsRed(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#0d0d0d", `
<tr><td style="background:#1a0000;border-left:4px solid #ef4444;border-radius:4px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:44px 40px 0;">
<table cellpadding="0" cellspacing="0" style="margin-bottom:24px;"><tr><td style="background:#ef4444;padding:6px 16px;font-size:10px;font-weight:900;letter-spacing:2px;text-transform:uppercase;color:#fff;font-style:italic;">⚡ Stock por agotarse</td></tr></table>
<p style="margin:0 0 20px;font-size:44px;font-weight:900;font-style:italic;color:#fff;line-height:0.95;letter-spacing:-1px;text-transform:uppercase;">No lo dejés<br><span style="color:#ef4444;">escapar.</span></p>
<p style="margin:0 0 34px;font-size:15px;color:#999;line-height:1.7;">Hola ${NAME}, elegiste bien. Ahora cerralo. El stock no espera y nadie reserva por vos.</p>
<table cellpadding="0" cellspacing="0" style="margin-bottom:40px;"><tr><td style="background:#ef4444;"><a href="${link}" style="display:block;padding:18px 40px;font-size:14px;font-weight:900;font-style:italic;letter-spacing:1px;text-transform:uppercase;text-decoration:none;color:#fff;">Cerrar compra →</a></td></tr></table>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="background:#000;"><tr>
<td style="padding:16px 8px;text-align:center;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#ef4444;">Entrega rápida</td>
<td style="padding:16px 8px;text-align:center;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#ef4444;">Pago seguro</td>
<td style="padding:16px 8px;text-align:center;font-size:10px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#ef4444;">Devolución gratis</td>
</tr></table>
</td></tr>
<tr><td style="padding:22px 0;text-align:center;"><p style="margin:0;font-size:10px;font-weight:800;font-style:italic;letter-spacing:3px;text-transform:uppercase;color:#3a1010;">${s}</p>${novaBadge("#ef4444","#3a1010")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  FASHION — beige cálido, minúsculas chic, mucho aire, elegante
// ════════════════════════════════════════════════════════════════════════════
function buildFashion(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#f9f4ee", `
<tr><td style="background:#fff;border-radius:2px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:56px 48px 0;text-align:center;">
<p style="margin:0 0 44px;font-size:12px;font-weight:400;letter-spacing:5px;text-transform:lowercase;color:#8b6f5e;">${s}</p>
<p style="margin:0 0 8px;font-size:13px;font-style:italic;color:#b0a090;letter-spacing:1px;">pensado para vos,</p>
<p style="margin:0 0 28px;font-family:Georgia,serif;font-size:42px;font-weight:400;color:#2c1810;line-height:1.15;letter-spacing:-1px;">tu estilo<br>te espera.</p>
<p style="margin:0 0 40px;font-size:15px;color:#8b7d70;line-height:1.9;font-weight:300;">hola ${NAME}, los productos que elegiste<br>siguen disponibles. completá tu pedido y lucílos.</p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 56px;"><tr><td style="border:1px solid #2c1810;"><a href="${link}" style="display:block;padding:16px 48px;font-size:12px;font-weight:500;letter-spacing:3px;text-transform:lowercase;text-decoration:none;color:#2c1810;">ver mi carrito</a></td></tr></table>
</td></tr></table></td></tr>
<tr><td style="padding:28px 0;text-align:center;"><p style="margin:0;font-size:10px;letter-spacing:3px;text-transform:lowercase;color:#c4b5a8;">${s} · envío y devolución fácil</p>${novaBadge("#8b6f5e","#e5dccf","Georgia,serif")}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  TECH NEON — negro + verde neón, estética terminal/código, monospace
// ════════════════════════════════════════════════════════════════════════════
function buildTechNeon(store: string, link: string): string {
  const s = sanitizeHtml(store);
  const mono = "'SF Mono',ui-monospace,'Cascadia Code',Menlo,Consolas,monospace";
  return doc("#020c02", `
<tr><td style="background:#041804;border:1px solid #0a3a0a;border-radius:10px;overflow:hidden;">
<table width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding:16px 22px;background:#031003;border-bottom:1px solid #0a3a0a;">
<table cellpadding="0" cellspacing="0"><tr>
<td style="width:9px;height:9px;border-radius:50%;background:#22c55e;font-size:0;">&nbsp;</td>
<td style="padding-left:14px;font-family:${mono};font-size:11px;color:#22c55e;">${s.toLowerCase()} ~ %</td>
</tr></table></td></tr>
<tr><td style="padding:38px 30px 0;">
<p style="margin:0 0 6px;font-family:${mono};font-size:12px;color:#4ade80;">// disponible ahora</p>
<p style="margin:0 0 20px;font-family:${mono};font-size:30px;font-weight:700;color:#e0ffe0;line-height:1.2;">Carrito<br>pendiente_</p>
<p style="margin:0 0 12px;font-family:${mono};font-size:13px;color:#6ee79b;line-height:1.8;">&gt; hola ${NAME}, tenés productos esperando.<br>&gt; stock en tiempo real — sin garantía de disponibilidad.</p>
<table cellpadding="0" cellspacing="0" style="margin:26px 0 36px;"><tr><td style="background:#22c55e;border-radius:4px;"><a href="${link}" style="display:block;padding:16px 36px;font-family:${mono};font-size:13px;font-weight:700;text-decoration:none;color:#020c02;">[ completar_pedido ]</a></td></tr></table>
</td></tr>
<tr><td style="padding:0;"><table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #0a3a0a;"><tr>
<td style="padding:14px 8px;text-align:center;border-right:1px solid #0a3a0a;font-family:${mono};font-size:10px;color:#3a7a4a;">garantía_oficial</td>
<td style="padding:14px 8px;text-align:center;border-right:1px solid #0a3a0a;font-family:${mono};font-size:10px;color:#3a7a4a;">envío_rápido</td>
<td style="padding:14px 8px;text-align:center;font-family:${mono};font-size:10px;color:#3a7a4a;">soporte_24/7</td>
</tr></table></td></tr>
</table></td></tr>
<tr><td style="padding:22px 0;text-align:center;"><p style="margin:0;font-family:${mono};font-size:10px;letter-spacing:2px;color:#1a3a1a;">// ${s.toLowerCase()}</p>${novaBadge("#3a7a4a","#0a3a0a",mono)}</td></tr>`);
}

// ════════════════════════════════════════════════════════════════════════════
//  WARM FRIENDLY — naranja cálido, conversacional, redondeado, emoji
// ════════════════════════════════════════════════════════════════════════════
function buildWarmFriendly(store: string, link: string): string {
  const s = sanitizeHtml(store);
  return doc("#fff8f0", `
<tr><td style="padding:0 0 18px;text-align:center;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#f97316;">${s}</p></td></tr>
<tr><td style="background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 4px 0 #ffe4c4;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 40px 0;text-align:center;">
<p style="margin:0 0 18px;font-size:56px;line-height:1;">👋</p>
<p style="margin:0 0 16px;font-size:30px;font-weight:800;color:#1c0a00;line-height:1.2;">Oye ${NAME},<br>¿te olvidaste algo?</p>
<p style="margin:0 0 30px;font-size:15px;color:#7a6a5a;line-height:1.8;">Son productos que ya elegiste 🛍️<br>Solo falta un pasito para que sean tuyos.</p>
<table cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 10px;"><tr><td style="background:#f97316;border-radius:100px;"><a href="${link}" style="display:block;padding:18px 44px;font-size:15px;font-weight:800;text-decoration:none;color:#fff;">Terminar mi compra 🎉</a></td></tr></table>
<p style="margin:14px 0 0;font-size:13px;color:#b09080;">Te tomamos el carrito tal como lo dejaste 💛</p>
</td></tr></table>
<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;background:#fff8f0;"><tr>
<td style="padding:18px 8px;text-align:center;font-size:11px;font-weight:600;color:#d18445;">🚚 Envío rápido</td>
<td style="padding:18px 8px;text-align:center;font-size:11px;font-weight:600;color:#d18445;">🔒 Pago seguro</td>
<td style="padding:18px 8px;text-align:center;font-size:11px;font-weight:600;color:#d18445;">↩️ Devolución fácil</td>
</tr></table>
</td></tr>
<tr><td style="padding:22px 0;text-align:center;"><p style="margin:0;font-size:11px;color:#d4b8a0;">Con cariño, el equipo de ${s} 🧡</p>${novaBadge("#f97316","#ffe0c0")}</td></tr>`);
}

// ─── Registro ─────────────────────────────────────────────────────────────────

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
    description: "Negro absoluto, acento cyan, tipografía fina y mucho aire.",
    palette: { bg: "#030303", card: "#0f0f0f", accent: "#00C4D4", text: "#ffffff" },
    build: buildDarkMinimal,
  },
  {
    id: "white-clean",
    name: "White Clean",
    description: "Editorial blanco, headline gigante y reglas finas. Minimalista.",
    palette: { bg: "#f5f5f5", card: "#ffffff", accent: "#111111", text: "#111111" },
    build: buildWhiteClean,
  },
  {
    id: "luxury-gold",
    name: "Luxury Gold",
    description: "Negro y dorado con serif itálica y ornamento. Premium.",
    palette: { bg: "#0a0805", card: "#141008", accent: "#c9a84c", text: "#f5e6c8" },
    build: buildLuxuryGold,
  },
  {
    id: "bold-purple",
    name: "Bold Purple",
    description: "Violeta vibrante en bloques de color. Energético y llamativo.",
    palette: { bg: "#1a0533", card: "#2d0a5e", accent: "#a855f7", text: "#ffffff" },
    build: buildBoldPurple,
  },
  {
    id: "sports-red",
    name: "Sports Red",
    description: "Rojo y negro, itálicas agresivas en mayúscula. Impacto deportivo.",
    palette: { bg: "#0d0d0d", card: "#1a0000", accent: "#ef4444", text: "#ffffff" },
    build: buildSportsRed,
  },
  {
    id: "fashion-beige",
    name: "Fashion",
    description: "Beige cálido, serif y minúsculas chic. Moda y lifestyle.",
    palette: { bg: "#f9f4ee", card: "#ffffff", accent: "#8b6f5e", text: "#2c1810" },
    build: buildFashion,
  },
  {
    id: "tech-green",
    name: "Tech Neon",
    description: "Estética terminal: negro, verde neón y monospace. Para gadgets.",
    palette: { bg: "#020c02", card: "#041804", accent: "#22c55e", text: "#e0ffe0" },
    build: buildTechNeon,
  },
  {
    id: "warm-orange",
    name: "Warm Friendly",
    description: "Naranja cálido, redondeado y conversacional con emojis. Cercano.",
    palette: { bg: "#fff8f0", card: "#ffffff", accent: "#f97316", text: "#1c0a00" },
    build: buildWarmFriendly,
  },
];

export function getTemplate(id: string): EmailTemplate {
  return EMAIL_TEMPLATES.find((t) => t.id === id) ?? EMAIL_TEMPLATES[0];
}

export function buildSubject(template: string, storeName: string): string {
  return template.replace(/\{store\}/g, storeName);
}
