import { isAdmin } from "@/lib/auth";
import { listSubmissions } from "@/lib/storage";

export const runtime = "nodejs";

const COLUMNS: Array<[header: string, key: string]> = [
  ["Waktu Daftar", "createdAt"],
  ["Nama Akun GOSH", "namaAkunGosh"],
  ["ID GOSH", "idGosh"],
  ["Email GOSH", "email"],
  ["Jenis Kelamin", "jenisKelamin"],
  ["Platform Siaran", "platformSiaran"],
  ["Link Sosmed", "linkSosmed"],
  ["Link Video Siaran", "videoLink"],
  ["Nomor WhatsApp", "whatsapp"],
];

function csvCell(value: unknown): string {
  const text = value === undefined || value === null ? "" : String(value);
  // Prefix tanda petik satu supaya Excel tidak menganggapnya formula.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  let records: Awaited<ReturnType<typeof listSubmissions>>;
  try {
    records = await listSubmissions();
  } catch (error) {
    console.error("[export] gagal membaca data", error);
    return new Response("Gagal membaca data dari Supabase", { status: 500 });
  }

  const rows = [COLUMNS.map(([header]) => csvCell(header)).join(",")];

  for (const record of records) {
    const flat = record as unknown as Record<string, unknown>;
    rows.push(COLUMNS.map(([, key]) => csvCell(flat[key])).join(","));
  }

  // BOM supaya karakter non-ASCII rapi saat dibuka di Excel.
  const csv = `\uFEFF${rows.join("\r\n")}`;
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="pendaftar-talent-${stamp}.csv"`,
      "cache-control": "no-store",
    },
  });
}
