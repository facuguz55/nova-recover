import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.TIENDANUBE_APP_SECRET) return false;
  const hmac = crypto.createHmac("sha256", process.env.TIENDANUBE_APP_SECRET).update(body).digest("hex");
  // Comparacion en tiempo constante para evitar timing attacks
  const a = Buffer.from(hmac);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-linkedstore-token");

  if (!verifySignature(body, signature)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // No almacenamos datos personales de clientes finales de las tiendas
  return NextResponse.json({ success: true, data: [] });
}
