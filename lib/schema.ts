import { z } from "zod";

/** Pilihan jenis kelamin. */
export const GENDERS = ["Pria", "Wanita"] as const;

/**
 * Normalisasi nomor WhatsApp Indonesia ke format lokal `08xxxxxxxxxx`.
 * Menerima input `+62`, `62`, `8`, atau `08` dengan spasi / tanda hubung.
 */
export function normalizeWhatsapp(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.startsWith("62")) return `0${digits.slice(2)}`;
  if (digits.startsWith("8")) return `0${digits}`;
  return digits;
}

const requiredText = (label: string, max = 120) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(max, `${label} maksimal ${max} karakter`);

const httpUrl = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .max(500, `${label} terlalu panjang`)
    .refine((value) => {
      try {
        const url = new URL(value);
        return url.protocol === "http:" || url.protocol === "https:";
      } catch {
        return false;
      }
    }, `${label} harus berupa link lengkap yang diawali https://`);

/** Field isian, tanpa persetujuan. Dipakai untuk validasi form di browser. */
const baseFields = z.object({
  namaAkunGosh: requiredText("Nama Akun GOSH", 80),
  idGosh: requiredText("ID GOSH", 40).regex(
    /^[A-Za-z0-9._-]+$/,
    "ID GOSH hanya boleh huruf, angka, titik, garis bawah, atau tanda hubung",
  ),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email wajib diisi")
    .max(160, "Email terlalu panjang")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, "Format email tidak valid"),
  jenisKelamin: z.enum(GENDERS, { message: "Pilih jenis kelamin" }),
  platformSiaran: requiredText("Platform siaran", 120),
  linkSosmed: httpUrl("Link sosmed"),
  videoLink: httpUrl("Link video siaran"),
  whatsapp: z
    .string()
    .trim()
    .min(1, "Nomor WhatsApp wajib diisi")
    .transform(normalizeWhatsapp)
    .refine(
      (value) => /^08\d{7,13}$/.test(value),
      "Nomor WhatsApp tidak valid. Contoh: 081234567890",
    ),
});

/** Validasi isian form (dipakai di browser sebelum modal konfirmasi). */
export const fieldsSchema = baseFields;

/** Validasi final: isian + persetujuan. Dipakai API `/api/submit`. */
export const registrationSchema = baseFields.extend({
  setuju: z.literal(true, {
    message: "Kamu harus menyetujui sistem, SOW, dan requirements",
  }),
});

export type RegistrationInput = z.input<typeof registrationSchema>;
export type RegistrationData = z.output<typeof registrationSchema>;

/** Data satu pendaftar yang disimpan (hasil validasi + metadata). */
export type SubmissionRecord = RegistrationData & {
  id: string;
  createdAt: string;
};
