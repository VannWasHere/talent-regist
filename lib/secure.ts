import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";

/**
 * Satu secret dipakai untuk dua hal:
 *  - menurunkan kunci AES-256-GCM (enkripsi data pendaftar saat disimpan)
 *  - menandatangani cookie sesi admin
 *
 * Wajib di-set di environment. Kalau secret ini hilang/diganti,
 * data pendaftar lama tidak bisa dibaca lagi.
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

let cachedKey: Buffer | null = null;
function dataKey(): Buffer {
  if (!cachedKey) {
    cachedKey = scryptSync(appSecret(), "talent-regist:data:v1", 32);
  }
  return cachedKey;
}

const b64 = (buf: Buffer) => buf.toString("base64url");

/** Enkripsi objek jadi string `v1.iv.tag.ciphertext` (AES-256-GCM). */
export function encryptJson(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey(), iv);
  const payload = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return ["v1", b64(iv), b64(cipher.getAuthTag()), b64(payload)].join(".");
}

/** Kebalikan dari {@link encryptJson}. Melempar error kalau data rusak. */
export function decryptJson<T>(blob: string): T {
  const [version, ivPart, tagPart, dataPart] = blob.trim().split(".");
  if (version !== "v1" || !ivPart || !tagPart || !dataPart) {
    throw new Error("Format data terenkripsi tidak dikenal");
  }
  const decipher = createDecipheriv(
    "aes-256-gcm",
    dataKey(),
    Buffer.from(ivPart, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(dataPart, "base64url")),
    decipher.final(),
  ]);
  return JSON.parse(plain.toString("utf8")) as T;
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

/** Hash stabil untuk dipakai sebagai nama file (tanpa membocorkan email). */
export function stableHash(value: string): string {
  return createHmac("sha256", appSecret())
    .update(value.trim().toLowerCase())
    .digest("hex")
    .slice(0, 32);
}
