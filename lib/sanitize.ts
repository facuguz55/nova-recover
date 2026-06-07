// Sanitización centralizada para toda la app

export function sanitizeString(str: string, maxLength = 255): string {
  return str
    .trim()
    .slice(0, maxLength)
    .replace(/[<>"'`]/g, ""); // previene XSS básico
}

export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 254);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
