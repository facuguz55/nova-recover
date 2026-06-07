import { createClient } from "@supabase/supabase-js";
import { sanitizeString, sanitizeHtml } from "@/lib/sanitize";

const N8N_BASE_URL = "https://devn8n.santafeia.shop";
const NOVA_SUPABASE_URL = "https://ooqwjywukihfztmkffym.supabase.co";
const WEBHOOK_BASE = "https://devwebhookn8n.santafeia.shop";
const GMAIL_CREDENTIAL_ID = "gEbteWyyA09LiUSE";

async function n8nRequest(path: string, method: string, body?: object) {
  const apiKey = process.env.N8N_API_KEY!;
  const res = await fetch(`${N8N_BASE_URL}/api/v1${path}`, {
    method,
    headers: { "Content-Type": "application/json", "X-N8N-API-KEY": apiKey },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`n8n error ${res.status}: ${await res.text()}`);
  return res.json();
}

function buildWebhookTracking(clientId: string, supabaseAnon: string) {
  return {
    name: `${clientId} - Webhook Tracking`,

    settings: { executionOrder: "v1" },
    connections: {
      "Webhook Track Carrito": { main: [[{ node: "Guardar Click Supabase", type: "main", index: 0 }]] },
      "Guardar Click Supabase": { main: [[{ node: "Redirigir al Checkout", type: "main", index: 0 }]] },
    },
    nodes: [
      { id: "node-wt-1", name: "Webhook Track Carrito", type: "n8n-nodes-base.webhook", typeVersion: 2.1, position: [160, 300], parameters: { path: `track-carrito-${clientId}`, responseMode: "responseNode", options: {} } },
      { id: "node-wt-2", name: "Guardar Click Supabase", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [420, 300], parameters: { method: "POST", url: `${NOVA_SUPABASE_URL}/rest/v1/clicks_tracking`, sendHeaders: true, headerParameters: { parameters: [{ name: "apikey", value: supabaseAnon }, { name: "Authorization", value: `Bearer ${supabaseAnon}` }, { name: "Content-Type", value: "application/json" }, { name: "Prefer", value: "return=minimal" }] }, sendBody: true, specifyBody: "json", jsonBody: `={{ JSON.stringify({ client_id: "${clientId}", email: $json.query.email, checkout_url: $json.query.checkout, fecha_click: new Date().toISOString() }) }}`, options: {} } },
      { id: "node-wt-3", name: "Redirigir al Checkout", type: "n8n-nodes-base.respondToWebhook", typeVersion: 1.5, position: [680, 300], parameters: { respondWith: "redirect", redirectURL: "={{ $('Webhook Track Carrito').first().json.query.checkout }}", options: {} } },
    ],
  };
}

function buildRecuperador(clientId: string, tnStoreId: string, tnApiToken: string, nombreMarca: string, senderName: string, supabaseAnon: string) {
  const emailHtml = `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:#030303;font-family:Arial,sans-serif;"><table width="100%" cellpadding="0" cellspacing="0" style="background:#030303;padding:32px 0;"><tr><td align="center" style="padding:0 16px;"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;"><tr><td style="padding:0 0 28px;text-align:center;"><p style="margin:0;font-size:24px;font-weight:900;letter-spacing:8px;text-transform:uppercase;color:#ffffff;">${sanitizeHtml(nombreMarca)}</p></td></tr><tr><td style="background:#0f0f0f;border:1px solid rgba(255,255,255,0.07);border-radius:16px;overflow:hidden;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="background:#00C4D4;padding:10px 28px;"><p style="margin:0;font-size:11px;font-weight:800;letter-spacing:4px;text-transform:uppercase;color:#030303;">Stock limitado - No te quedes sin el tuyo</p></td></tr></table><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 28px 24px;"><p style="margin:0 0 6px;font-size:13px;color:rgba(255,255,255,0.4);">Hola {{ $json.nombre_contacto }},</p><p style="margin:0 0 20px;font-size:32px;font-weight:900;text-transform:uppercase;color:#ffffff;line-height:1.1;">Tu carrito<br>te espera.<br><span style="color:#00C4D4;">Lo queres?</span></p><p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.7;">Dejaste algo en el carrito. El stock se mueve rapido y no reservamos unidades.</p><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;"><tr><td style="background:#0a0a0a;border:1px solid rgba(255,255,255,0.07);border-left:3px solid #00C4D4;border-radius:8px;padding:14px 18px;"><p style="margin:0 0 3px;font-size:13px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#00C4D4;">El que llega primero, juega.</p><p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">No hay mas unidades reservadas.</p></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;"><tr><td align="center"><a href="${WEBHOOK_BASE}/webhook/track-carrito-${clientId}?email={{ $json.email_destino }}&checkout={{ $json.checkout_url_limpia }}" style="display:block;background:#00C4D4;color:#030303;font-weight:900;font-size:16px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;padding:18px 32px;border-radius:10px;text-align:center;">Completar pedido</a></td></tr></table></td></tr></table><table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid rgba(255,255,255,0.07);"><tr><td width="50%" style="padding:16px 0;text-align:center;border-right:1px solid rgba(255,255,255,0.07);"><p style="margin:0 0 2px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">Envio gratis</p><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">todo el pais</p></td><td width="50%" style="padding:16px 0;text-align:center;"><p style="margin:0 0 2px;font-size:13px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ffffff;">Pago seguro</p><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.3);">tarjeta o transferencia</p></td></tr></table></td></tr><tr><td style="padding:24px 0;text-align:center;"><p style="margin:0;font-size:11px;color:rgba(255,255,255,0.15);">${sanitizeHtml(nombreMarca)}</p></td></tr></table></td></tr></table></body></html>`;

  return {
    name: `${clientId} - Recuperador de Carritos`,

    settings: { executionOrder: "v1" },
    connections: {
      "Trigger cada 2 horas": { main: [[{ node: "Consultar Carritos TiendaNube", type: "main", index: 0 }, { node: "Leer Emails Enviados", type: "main", index: 0 }]] },
      "Consultar Carritos TiendaNube": { main: [[{ node: "Filtrar Abandonados", type: "main", index: 0 }]] },
      "Filtrar Abandonados": { main: [[{ node: "Filtrar No Enviados", type: "main", index: 0 }]] },
      "Leer Emails Enviados": { main: [[{ node: "Filtrar No Enviados", type: "main", index: 1 }]] },
      "Filtrar No Enviados": { main: [[{ node: "Preparar Datos Email", type: "main", index: 0 }]] },
      "Preparar Datos Email": { main: [[{ node: "Enviar Gmail Recuperacion", type: "main", index: 0 }]] },
      "Enviar Gmail Recuperacion": { main: [[{ node: "Extraer Email y Fecha", type: "main", index: 0 }]] },
      "Extraer Email y Fecha": { main: [[{ node: "Registrar Envio Supabase", type: "main", index: 0 }]] },
    },
    nodes: [
      { id: "node-r-1", name: "Trigger cada 2 horas", type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.3, position: [208, 304], parameters: { rule: { interval: [{ field: "hours", hoursInterval: 2 }] } } },
      { id: "node-r-2", name: "Consultar Carritos TiendaNube", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [448, 192], parameters: { url: `https://api.tiendanube.com/v1/${tnStoreId}/checkouts?per_page=200&page=1&sort_by=created_at&sort_direction=desc`, sendHeaders: true, headerParameters: { parameters: [{ name: "Authentication", value: `bearer ${tnApiToken}` }, { name: "User-Agent", value: "Nova Recover (soporte@novaagency.info)" }] }, options: {} } },
      { id: "node-r-3", name: "Filtrar Abandonados", type: "n8n-nodes-base.code", typeVersion: 2, position: [688, 192], parameters: { jsCode: "const abandoned = [];\nconst emailsVistos = new Set();\nfor (const item of items) {\n  const checkout = item.json;\n  const email = (checkout.customer?.email || checkout.contact_email || '').toLowerCase().trim();\n  if (!email) continue;\n  if (checkout.order_id) continue;\n  if (emailsVistos.has(email)) continue;\n  emailsVistos.add(email);\n  checkout.customer = checkout.customer || {};\n  checkout.customer.email = email;\n  abandoned.push(item);\n}\nreturn abandoned;" } },
      { id: "node-r-4", name: "Leer Emails Enviados", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [448, 432], parameters: { url: `${NOVA_SUPABASE_URL}/rest/v1/emails_enviados?select=email&client_id=eq.${clientId}`, sendHeaders: true, headerParameters: { parameters: [{ name: "apikey", value: supabaseAnon }, { name: "Authorization", value: `Bearer ${supabaseAnon}` }, { name: "Range", value: "0-9999" }, { name: "Prefer", value: "count=none" }] }, options: { response: { response: { responseFormat: "json" } } } } },
      { id: "node-r-5", name: "Filtrar No Enviados", type: "n8n-nodes-base.merge", typeVersion: 3, position: [928, 304], parameters: { mode: "combine", advanced: true, mergeByFields: { values: [{ field1: "customer.email", field2: "email" }] }, joinMode: "keepNonMatches", outputDataFrom: "input1", options: {} } },
      { id: "node-r-6", name: "Preparar Datos Email", type: "n8n-nodes-base.code", typeVersion: 2, position: [1168, 304], parameters: { jsCode: "return items.map(item => {\n  const d = item.json;\n  const checkoutRaw = d.abandoned_checkout_url || '';\n  const checkoutUrl = checkoutRaw.replace('/v3/proxy/', '/v3/next/');\n  const email = (d.customer?.email || d.contact_email || '').toLowerCase().trim();\n  const nombre = d.contact_name || d.customer?.name || 'cliente';\n  return { json: { ...d, email_destino: email, nombre_contacto: nombre, checkout_url_limpia: checkoutUrl } };\n});" } },
      { id: "node-r-7", name: "Enviar Gmail Recuperacion", type: "n8n-nodes-base.gmail", typeVersion: 2, position: [1408, 304], credentials: { gmailOAuth2: { id: GMAIL_CREDENTIAL_ID, name: "novaagency" } }, parameters: { sendTo: "={{ $json.email_destino }}", subject: `Completaste tu carrito en ${sanitizeHtml(nombreMarca)}`, message: `=${emailHtml}`, options: { senderName: senderName } } },
      { id: "node-r-8", name: "Extraer Email y Fecha", type: "n8n-nodes-base.code", typeVersion: 2, position: [1648, 304], parameters: { jsCode: "return $('Preparar Datos Email').all().map(item => ({\n  json: { email: item.json.email_destino || '', fecha: new Date().toISOString() }\n}));" } },
      { id: "node-r-9", name: "Registrar Envio Supabase", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [1888, 304], parameters: { method: "POST", url: `${NOVA_SUPABASE_URL}/rest/v1/emails_enviados?on_conflict=client_id,email`, sendHeaders: true, headerParameters: { parameters: [{ name: "apikey", value: supabaseAnon }, { name: "Authorization", value: `Bearer ${supabaseAnon}` }, { name: "Content-Type", value: "application/json" }, { name: "Prefer", value: "resolution=merge-duplicates,return=minimal" }] }, sendBody: true, specifyBody: "json", jsonBody: `={{ JSON.stringify({ client_id: "${clientId}", email: $json.email, fecha: $json.fecha }) }}`, options: {} } },
    ],
  };
}

function buildVerificarConversiones(clientId: string, tnStoreId: string, tnApiToken: string, supabaseAnon: string) {
  return {
    name: `${clientId} - Verificar Conversiones`,

    settings: { executionOrder: "v1" },
    connections: {
      "Trigger cada 6 horas": { main: [[{ node: "Leer Clicks Supabase", type: "main", index: 0 }, { node: "Leer Ordenes TiendaNube", type: "main", index: 0 }]] },
      "Leer Clicks Supabase": { main: [[{ node: "Cruzar Emails", type: "main", index: 0 }]] },
      "Leer Ordenes TiendaNube": { main: [[{ node: "Cruzar Emails", type: "main", index: 1 }]] },
      "Cruzar Emails": { main: [[{ node: "Filtrar y Formatear Conversiones", type: "main", index: 0 }]] },
      "Filtrar y Formatear Conversiones": { main: [[{ node: "Guardar Conversion Supabase", type: "main", index: 0 }]] },
    },
    nodes: [
      { id: "node-c-1", name: "Trigger cada 6 horas", type: "n8n-nodes-base.scheduleTrigger", typeVersion: 1.3, position: [200, 300], parameters: { rule: { interval: [{ field: "hours", hoursInterval: 6 }] } } },
      { id: "node-c-2", name: "Leer Clicks Supabase", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [440, 180], parameters: { url: `${NOVA_SUPABASE_URL}/rest/v1/clicks_tracking?select=email,checkout_url,fecha_click&client_id=eq.${clientId}&order=fecha_click.desc`, sendHeaders: true, headerParameters: { parameters: [{ name: "apikey", value: supabaseAnon }, { name: "Authorization", value: `Bearer ${supabaseAnon}` }, { name: "Range", value: "0-9999" }, { name: "Prefer", value: "count=none" }] }, options: { response: { response: { responseFormat: "json" } } } } },
      { id: "node-c-3", name: "Leer Ordenes TiendaNube", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [440, 420], parameters: { url: `https://api.tiendanube.com/v1/${tnStoreId}/orders?per_page=200&status=any`, sendHeaders: true, headerParameters: { parameters: [{ name: "Authentication", value: `bearer ${tnApiToken}` }, { name: "User-Agent", value: "Nova Recover (soporte@novaagency.info)" }] }, options: {} } },
      { id: "node-c-4", name: "Cruzar Emails", type: "n8n-nodes-base.merge", typeVersion: 3, position: [700, 300], parameters: { mode: "combine", advanced: true, mergeByFields: { values: [{ field1: "email", field2: "contact_email" }] }, options: {} } },
      { id: "node-c-5", name: "Filtrar y Formatear Conversiones", type: "n8n-nodes-base.code", typeVersion: 2, position: [940, 300], parameters: { jsCode: `const results = [];\nfor (const item of $input.all()) {\n  const data = item.json;\n  const fechaClick = data.fecha_click ? new Date(data.fecha_click) : null;\n  const fechaOrden = data.created_at ? new Date(data.created_at) : null;\n  if (!fechaOrden || !fechaClick || fechaOrden <= fechaClick) continue;\n  if (data.payment_status !== 'paid') continue;\n  const email = data.email || data.contact_email || '';\n  results.push({ json: { client_id: '${clientId}', email, nombre_cliente: data.contact_name || '', id_orden: String(data.id || ''), total_orden: String(data.total || ''), fecha_orden: fechaOrden.toISOString(), fecha_click: fechaClick.toISOString(), fecha_verificacion: new Date().toISOString(), utm_campaign: 'recuperacion' } });\n}\nreturn results;` } },
      { id: "node-c-6", name: "Guardar Conversion Supabase", type: "n8n-nodes-base.httpRequest", typeVersion: 4.2, position: [1180, 300], parameters: { method: "POST", url: `${NOVA_SUPABASE_URL}/rest/v1/conversiones?on_conflict=client_id,id_orden`, sendHeaders: true, headerParameters: { parameters: [{ name: "apikey", value: supabaseAnon }, { name: "Authorization", value: `Bearer ${supabaseAnon}` }, { name: "Content-Type", value: "application/json" }, { name: "Prefer", value: "resolution=merge-duplicates,return=minimal" }] }, sendBody: true, specifyBody: "json", jsonBody: "={{ JSON.stringify($json) }}", options: {} } },
    ],
  };
}

export async function runProvision(userId: string, options?: { force?: boolean }): Promise<{ success: boolean; clientId?: string; already_provisioned?: boolean; error?: string }> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: onboarding } = await admin
    .from("onboarding_data")
    .select("*")
    .eq("client_id", userId)
    .single();

  if (!onboarding?.tn_store_id || !onboarding?.tn_api_token) {
    return { success: false, error: "Faltan datos de TiendaNube" };
  }

  if (onboarding.n8n_client_id && !options?.force) {
    return { success: true, already_provisioned: true };
  }

  const { data: client } = await admin
    .from("clients")
    .select("name, email")
    .eq("id", userId)
    .single();

  const emailSlug = sanitizeString((client?.email || userId).split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "-"), 30);
  const clientId = `${emailSlug}-${Date.now().toString(36)}`;
  const nombreMarca = sanitizeString(client?.name || emailSlug, 100);
  const senderName = sanitizeString(onboarding.email_sender_name || nombreMarca, 60);
  const tnStoreId = sanitizeString(onboarding.tn_store_id, 20);
  const tnApiToken = onboarding.tn_api_token as string;
  const supabaseAnon = process.env.NOVA_SUPABASE_ANON_KEY!;

  const [w1, w2, w3] = await Promise.all([
    n8nRequest("/workflows", "POST", buildWebhookTracking(clientId, supabaseAnon)),
    n8nRequest("/workflows", "POST", buildRecuperador(clientId, tnStoreId, tnApiToken, nombreMarca, senderName, supabaseAnon)),
    n8nRequest("/workflows", "POST", buildVerificarConversiones(clientId, tnStoreId, tnApiToken, supabaseAnon)),
  ]);

  await Promise.all([
    n8nRequest(`/workflows/${w1.id}/activate`, "POST"),
    n8nRequest(`/workflows/${w2.id}/activate`, "POST"),
    n8nRequest(`/workflows/${w3.id}/activate`, "POST"),
  ]);

  await admin.from("onboarding_data").update({
    n8n_workflow_tracking: w1.id,
    n8n_workflow_recuperador: w2.id,
    n8n_workflow_conversiones: w3.id,
    n8n_client_id: clientId,
  }).eq("client_id", userId);

  return { success: true, clientId };
}

export async function reprovision(userId: string): Promise<{ success: boolean; error?: string }> {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: onboarding } = await admin
    .from("onboarding_data")
    .select("n8n_workflow_tracking, n8n_workflow_recuperador, n8n_workflow_conversiones, n8n_client_id")
    .eq("client_id", userId)
    .single();

  // Eliminar workflows viejos de n8n (ignorar errores si ya no existen)
  const ids = [
    onboarding?.n8n_workflow_tracking,
    onboarding?.n8n_workflow_recuperador,
    onboarding?.n8n_workflow_conversiones,
  ].filter(Boolean);

  await Promise.allSettled(
    ids.map((id) =>
      fetch(`${N8N_BASE_URL}/api/v1/workflows/${id}`, {
        method: "DELETE",
        headers: { "X-N8N-API-KEY": process.env.N8N_API_KEY! },
      })
    )
  );

  // Limpiar referencias viejas para que runProvision no devuelva already_provisioned
  await admin.from("onboarding_data").update({
    n8n_workflow_tracking: null,
    n8n_workflow_recuperador: null,
    n8n_workflow_conversiones: null,
    n8n_client_id: null,
  }).eq("client_id", userId);

  return runProvision(userId);
}
