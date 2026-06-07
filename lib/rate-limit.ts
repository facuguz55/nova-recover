// Rate limiting simple en memoria para edge/serverless
// Para producción real usar Upstash Redis, pero esto cubre el 99% de los casos

const attempts = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = attempts.get(key);

  if (!record || now > record.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: maxAttempts - record.count };
}

// Limpiar entradas viejas cada 5 minutos para no acumular memoria
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of attempts.entries()) {
      if (now > record.resetAt) attempts.delete(key);
    }
  }, 5 * 60 * 1000);
}
