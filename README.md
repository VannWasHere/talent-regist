# Pendaftaran Talent Streamer GOSH

Pengganti Google Form untuk pendaftaran talent livestreaming. Dibuat dengan
Next.js 16 (App Router) + komponen shadcn/ui, siap deploy ke Vercel, dan
dirancang supaya hemat di Hobby (free) plan.

## Isi aplikasi

| Halaman            | Keterangan                                                            |
| ------------------ | --------------------------------------------------------------------- |
| `/`                | Form pendaftaran + ringkasan syarat. Halaman statis.                  |
| `/panduan-gosh`    | Panduan bikin akun GOSH, melengkapi profil, dan mengambil ID GOSH.    |
| `/admin`           | Login password → tabel pendaftar + tombol unduh CSV.                  |
| `/api/submit`      | Menyimpan pendaftaran (validasi ulang di server).                     |
| `/api/upload`      | Menandatangani izin upload video langsung dari browser ke Vercel Blob. |
| `/api/admin/export`| Export CSV (butuh sesi admin).                                        |

Field form (semua wajib): Nama Akun GOSH, ID GOSH, Email GOSH, Jenis Kelamin
(Cowo/Cewe), platform siaran, link sosmed, video siaran (**link atau file**,
pilih salah satu), dan nomor WhatsApp. Sebelum terkirim, muncul modal
konfirmasi berisi Sistem & SOW + Requirements dengan dua checkbox persetujuan.

## Cara deploy ke Vercel

1. Push project ini ke GitHub, lalu **Import Project** di Vercel.
2. Buat Blob store: tab **Storage → Create → Blob**, lalu **Connect** ke
   project. Vercel otomatis menambahkan `BLOB_READ_WRITE_TOKEN`.
3. Tambah environment variable (Production + Preview):

   ```
   ADMIN_PASSWORD=<password untuk /admin>
   APP_SECRET=<random 32 byte hex>
   MAX_VIDEO_MB=100            # opsional
   ```

   Bikin `APP_SECRET`:

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

4. Deploy, lalu buka `/admin` untuk cek data masuk.

> `APP_SECRET` dipakai untuk mengenkripsi data pendaftar **dan** menandatangani
> cookie admin. Kalau nilainya diganti, data pendaftar lama tidak bisa dibaca
> lagi. Simpan di tempat aman.

## Jalan di lokal

```bash
cp .env.example .env.local   # isi ADMIN_PASSWORD dan APP_SECRET
npm install
npm run dev
```

Tanpa `BLOB_READ_WRITE_TOKEN`, aplikasi tetap jalan: data disimpan terenkripsi
di folder `.data/` dan tab **Upload file** dimatikan (peserta pakai link).

## Cara data disimpan

- Satu pendaftar = satu file terenkripsi **AES-256-GCM** di Vercel Blob
  (`submissions/<hash-email>.enc`). Nama file berupa HMAC dari email, jadi
  isi maupun nama file tidak membocorkan data.
- Email dipakai sebagai kunci unik, jadi satu email tidak bisa daftar dua kali.
- Video hasil upload disimpan di `videos/...` dengan nama acak. File video
  **tidak** dienkripsi supaya bisa diputar langsung dari dashboard admin.
- Tidak ada database. Tidak ada service tambahan.

## Kenapa hemat di free tier

- `/` dan `/panduan-gosh` di-prerender statis → dilayani dari CDN, bukan Function.
- Tidak ada polling, tidak ada SWR/React Query, tidak ada analytics.
  Function hanya jalan saat submit, saat upload, dan saat admin membuka data.
- Tanpa font Google dan tanpa `next/image` remote → nol request eksternal.
- Prefetch link dimatikan (`prefetch={false}`) supaya navigasi tidak menarik
  payload tambahan.
- Upload video **client upload**: file mengalir langsung browser → Blob, tidak
  lewat Function (hemat bandwidth dan waktu eksekusi).
- Batas upload default 100 MB (`MAX_VIDEO_MB`). Free tier Blob = 1 GB storage /
  10 GB transfer per bulan, jadi arahkan peserta memakai link kalau videonya
  besar.
- Perlindungan spam tanpa biaya: honeypot, batas ukuran body, dan rate limit
  in-memory (5 submit / 10 menit / instance).

## Yang perlu kamu sesuaikan

- `lib/content.ts` — teks Sistem & SOW, Requirements, dan langkah panduan GOSH.
  Langkah panduan ditulis generik (Profil / Me → ID di bawah nama akun); cek
  ulang dengan versi aplikasi GOSH terbaru dan sesuaikan kalimatnya bila menu
  berubah. Tambahkan screenshot di `public/` kalau perlu.
- `MAX_VIDEO_MB` sesuai kuota Blob kamu.
