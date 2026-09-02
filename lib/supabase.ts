import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase khusus server (pakai service role key).
 * Jangan pernah import file ini dari komponen client.
 */
let cached: SupabaseClient | null = null;

export function supabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
  ).replace(/\/+$/, "");
}

export function supabaseKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

/** True kalau env Supabase sudah lengkap. */
export function supabaseConfigured(): boolean {
  return Boolean(supabaseUrl() && supabaseKey());
}

export function getSupabase(): SupabaseClient {
  if (!supabaseConfigured()) {
    throw new Error(
      "Supabase belum dikonfigurasi. Set SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  if (!cached) {
    cached = createClient(supabaseUrl(), supabaseKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { "x-application-name": "talent-regist" } },
    });
  }

  return cached;
}

/** Nama tabel bisa diganti lewat env kalau perlu. */
export function tableName(): string {
  return process.env.SUPABASE_TABLE || "talent_registrations";
}
