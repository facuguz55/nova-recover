import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Cifrado AES-256-GCM para tokens sensibles (ej. access_token de TiendaNube,
// que incluye scope write_orders). Formato: enc:v1:iv:authTag:cipher (todo hex).
//
// Es OPCIONAL y retrocompatible: si no hay ENCRYPTION_SECRET configurado se
// guarda en texto plano (comportamiento previo), y al leer se detecta el
// formato — así las filas viejas en texto plano siguen funcionando.

const ALGORITHM = "aes-256-gcm";
const PREFIX = "enc:v1:";

function getKey(): Buffer | null {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret) return null;
  const key = Buffer.from(secret, "base64");
  return key.length === 32 ? key : null;
}

/** Cifra si hay clave configurada; si no, devuelve el texto tal cual. */
export function maybeEncrypt(text: string): string {
  const key = getKey();
  if (!key) return text;
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const enc = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${PREFIX}${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

/** Descifra si el valor está cifrado; si está en texto plano lo devuelve igual. */
export function maybeDecrypt(value: string | null): string | null {
  if (!value || !value.startsWith(PREFIX)) return value; // texto plano legacy
  const key = getKey();
  if (!key) return value; // sin clave no podemos descifrar
  try {
    const [, , ivHex, tagHex, dataHex] = value.split(":");
    const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivHex, "hex"));
    decipher.setAuthTag(Buffer.from(tagHex, "hex"));
    return decipher.update(Buffer.from(dataHex, "hex")) + decipher.final("utf8");
  } catch {
    return null;
  }
}
