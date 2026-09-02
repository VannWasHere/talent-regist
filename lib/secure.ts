import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * APP_SECRET dipakai untuk menandatangani cookie sesi admin.
 * Wajib di-set di environment (minimal 16 karakter).
 */
function appSecret(): string {
  const secret = process.env.APP_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "APP_SECRET belum di-set (minimal 16 karakter). Lihat .env.example.",
    );
  }
  return secret;
}

function hmac(value: string): string {
  return createHmac("sha256", appSecret()).update(value).digest("base64url");
}

/** Bandingkan dua string tanpa membocorkan waktu eksekusi. */
export function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/** Token sesi admin: `expiresAt.signature`. */
export function createSessionToken(ttlMs: number): string {
  const expiresAt = String(Date.now() + ttlMs);
  return `${expiresAt}.${hmac(expiresAt)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresAt, signature] = token.split(".");
  if (!expiresAt || !signature) return false;
  if (!safeEqual(signature, hmac(expiresAt))) return false;
  return Number(expiresAt) > Date.now();
}
