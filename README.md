# Pendaftaran Talent Streamer GOSH

Pengganti Google Form untuk pendaftaran talent livestreaming. Next.js 16 (App
Router) + shadcn/ui, data disimpan di **Supabase Postgres**, siap deploy ke
Vercel free tier.

## Isi aplikasi

| Halaman             | Keterangan                                                         |
| ------------------- | ------------------------------------------------------------------ |
| `/`                 | Form pendaftaran + ringkasan syarat. Halaman statis.               |
| `/panduan-gosh`     | Panduan bikin akun GOSH, melengkapi profil, dan mengambil ID GOSH. |
| `/admin`            | Login password → tabel pendaftar + tombol unduh CSV.               |
| `/api/submit`       | Simpan pendaftaran ke Supabase (validasi ulang di server).         |
| `/api/admin/export` | Export CSV (butuh sesi admin).                                     |

Field form (semua wajib): Nama Akun GOSH, ID GOSH, Email GOSH, Jenis Kelamin
(Cowo/Cewe), platform siaran, link sosmed, link video siaran, nomor WhatsApp.
Sebelum terkirim muncul modal konfirmasi berisi Sistem & SOW + Requirements
dengan dua checkbox persetujuan. Video dikirim sebagai **link saja** (Google
Drive / YouTube / TikTok), tidak ada upload file.

## Setup Supabase (3 langkah)

**1. Bikin tabel.** Supabase Dashboard → **SQL Editor** → **New query** →
tempel seluruh isi [`supabase/schema.sql`](supabase/schema.sql) → **Run**.

Script itu membuat tabel `talent_registrations`, unique index email
(case-insensitive, jadi satu email tidak bisa daftar dua kali), index urutan
waktu, lalu menyalakan RLS **tanpa policy** sehingga tabel tidak bisa dibaca
dari browser / anon key sama sekali.

**2. Ambil kredensial.** Supabase Dashboard → **Project Settings** → **API**:

| Yang dicari                 | Dipakai untuk               |
| --------------------------- | --------------------------- |
| **Project URL**             | `SUPABASE_URL`              |
| **service_role** secret key | `SUPABASE_SERVICE_ROLE_KEY` |

**3. Isi environment variable.**

```
SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
ADMIN_PASSWORD=<password untuk buka /admin>
APP_SECRET=<random 32 byte hex>
```

Bikin `APP_SECRET`:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Opsional: `SUPABASE_TABLE` kalau nama tabelnya bukan `talent_registrations`.

### Catatan penting soal key

- Pakai **service_role**, bukan anon / publishable key. Anon key akan kena RLS
  dan semua query bakal balik kosong atau error permission.
- Jangan pernah menambahkan prefix `NEXT_PUBLIC_` ke service role key. Key ini
  hanya dibaca di server (`app/api/*` dan `/admin`), tidak pernah masuk bundle
  browser.
- `SUPABASE_URL` tanpa slash di akhir. (Kode juga sudah membuang slash ekstra.)

## Deploy ke Vercel

1. Push ke GitHub, lalu **Import Project** di Vercel.
2. Masukkan 4 environment variable di atas untuk **Production** dan **Preview**.
3. Deploy, lalu buka `/admin` dan login pakai `ADMIN_PASSWORD`.

Tidak perlu Vercel Blob, KV, atau storage lain.

## Jalan di lokal

```bash
cp .env.example .env.local   # isi keempat variabel
npm install
npm run dev
```

## Struktur data

Tabel `public.talent_registrations`:

| Kolom             | Tipe          | Isi                        |
| ----------------- | ------------- | -------------------------- |
| `id`              | `uuid`        | primary key, auto          |
| `created_at`      | `timestamptz` | auto `now()`               |
| `nama_akun_gosh`  | `text`        | Nama Akun GOSH             |
| `id_gosh`         | `text`        | ID GOSH                    |
| `email`           | `text`        | unique (lower), lowercase  |
| `jenis_kelamin`   | `text`        | `Cowo` / `Cewe`            |
| `platform_siaran` | `text`        | Platform siaran            |
| `link_sosmed`     | `text`        | Link sosmed                |
| `video_link`      | `text`        | Link video livestream      |
| `whatsapp`        | `text`        | Dinormalkan ke `08xxxxxxx` |

Mapping snake_case ↔ camelCase ada di `lib/storage.ts`.

## Kenapa hemat di free tier

- `/` dan `/panduan-gosh` di-prerender statis → dilayani CDN, bukan Function.
- Tidak ada polling, SWR/React Query, atau analytics. Function hanya jalan saat
  submit dan saat admin membuka data / export.
- Tanpa Google Fonts dan tanpa `next/image` remote → nol request eksternal.
- `prefetch={false}` di semua link internal.
- Tanpa upload file → nol biaya storage & bandwidth video.
- Anti spam gratis: honeypot, batas ukuran body, rate limit in-memory
  (5 submit / 10 menit / instance), plus unique email di database.

## Yang bisa kamu sesuaikan

- `lib/content.ts` — teks Sistem & SOW, Requirements, dan langkah panduan GOSH.
- `lib/schema.ts` — aturan validasi (panjang, format WhatsApp, dll).
