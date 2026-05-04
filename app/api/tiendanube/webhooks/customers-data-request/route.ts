import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

function verifySignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.TIENDANUBE_APP_SECRET) return false;
  const hmac = crypto.createHmac("sha256", process.env.TIENDANUBE_APP_SECRET).update(body).digest("hex");
  return hmac === signature;
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
