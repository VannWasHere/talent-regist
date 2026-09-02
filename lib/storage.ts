import "server-only";

import type { SubmissionRecord } from "@/lib/schema";
import { getSupabase, supabaseConfigured, tableName } from "@/lib/supabase";

export { supabaseConfigured };

/** Baris tabel Supabase (snake_case). */
type Row = {
  id: string;
  created_at: string;
  nama_akun_gosh: string;
  id_gosh: string;
  email: string;
  jenis_kelamin: string;
  platform_siaran: string;
  link_sosmed: string;
  video_link: string;
  whatsapp: string;
};

const SELECT_COLUMNS =
  "id, created_at, nama_akun_gosh, id_gosh, email, jenis_kelamin, platform_siaran, link_sosmed, video_link, whatsapp";

function toRecord(row: Row): SubmissionRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    namaAkunGosh: row.nama_akun_gosh,
    idGosh: row.id_gosh,
    email: row.email,
    jenisKelamin: row.jenis_kelamin as SubmissionRecord["jenisKelamin"],
    platformSiaran: row.platform_siaran,
    linkSosmed: row.link_sosmed,
    videoLink: row.video_link,
    whatsapp: row.whatsapp,
    setuju: true,
  };
}

/** Error khusus supaya API bisa balas 409 saat email sudah terdaftar. */
export class DuplicateEmailError extends Error {
  constructor() {
    super("Email sudah terdaftar");
    this.name = "DuplicateEmailError";
  }
}

export async function submissionExists(email: string): Promise<boolean> {
  const { data, error } = await getSupabase()
    .from(tableName())
    .select("id")
    .eq("email", email.trim().toLowerCase())
    .limit(1);

  if (error) throw new Error(error.message);
  return (data?.length ?? 0) > 0;
}

export async function saveSubmission(
  record: Omit<SubmissionRecord, "id" | "createdAt">,
): Promise<SubmissionRecord> {
  const { data, error } = await getSupabase()
    .from(tableName())
    .insert({
      nama_akun_gosh: record.namaAkunGosh,
      id_gosh: record.idGosh,
      email: record.email,
      jenis_kelamin: record.jenisKelamin,
      platform_siaran: record.platformSiaran,
      link_sosmed: record.linkSosmed,
      video_link: record.videoLink,
      whatsapp: record.whatsapp,
    })
    .select(SELECT_COLUMNS)
    .single<Row>();

  if (error) {
    // 23505 = unique_violation (email sudah ada)
    if (error.code === "23505") throw new DuplicateEmailError();
    throw new Error(error.message);
  }

  return toRecord(data);
}

/** Ambil semua pendaftar, terbaru dulu. Hanya dipanggil dari halaman admin. */
export async function listSubmissions(): Promise<SubmissionRecord[]> {
  const { data, error } = await getSupabase()
    .from(tableName())
    .select(SELECT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(5000);

  if (error) throw new Error(error.message);
  return (data as Row[] | null)?.map(toRecord) ?? [];
}
