/**
 * Semua teks aturan & panduan dikumpulkan di sini supaya gampang diedit
 * tanpa menyentuh komponen UI.
 */

export const SYSTEM_SOW: string[] = [
  "Akan ada seleksi awal berdasarkan jumlah followers dan video saat livestreaming yang di-upload melalui form pendaftaran.",
  "Minimal 3.000 followers di salah satu platform media sosial.",
  "Followers di bawah 3.000 tetap diperbolehkan mendaftar, selama yakin memiliki kualitas livestreaming yang baik dan bukan sekadar streaming asal-asalan.",
  "Setelah dinyatakan lolos, streamer dapat mulai melakukan livestreaming.",
  "Periode: 30 hari.",
  "Target: 60 jam live & 20 Valid Day.",
  "1 Valid Day = livestream minimal 3 jam dalam 1 hari.",
  "Maksimal 10 hari libur dalam satu periode.",
  "Fee Rp2.000.000 NET, dicairkan setelah seluruh target terpenuhi.",
];

export const REQUIREMENTS: string[] = [
  "Minimal 3.000 followers di salah satu sosial media (namun di bawah 3.000 tetap boleh daftar).",
  "Memiliki PC/Laptop yang proper untuk streaming.",
  "Memiliki webcam.",
  "Koneksi internet stabil.",
  "Memiliki basic livestreaming dan mampu berinteraksi dengan viewers.",
];

export const AFTER_PERIOD =
  "Performa streamer akan dievaluasi. Jika performanya bagus dan tidak terkena cut dari platform, streamer berkesempatan untuk lanjut ke periode berikutnya.";

export type GuideStep = {
  title: string;
  body: string[];
};

/**
 * Panduan bikin akun GOSH + cara ambil ID.
 * Kalau tampilan aplikasi GOSH berubah, cukup edit teks di bawah ini.
 */
export const GOSH_ACCOUNT_STEPS: GuideStep[] = [
  {
    title: "1. Download aplikasi GOSH",
    body: [
      "Buka Google Play Store (Android) atau App Store (iPhone), lalu cari “GOSH Live”.",
      "Install aplikasinya dan tunggu sampai selesai. Pastikan kamu download dari store resmi, bukan APK dari luar.",
    ],
  },
  {
    title: "2. Daftar / bikin akun baru",
    body: [
      "Buka aplikasi, lalu pilih Sign Up / Daftar.",
      "Daftar memakai email aktif kamu (bukan login lewat nomor HP saja), karena email inilah yang harus kamu tulis di form pendaftaran ini.",
      "Cek inbox atau folder spam kalau GOSH mengirim kode verifikasi, lalu masukkan kodenya.",
    ],
  },
  {
    title: "3. Lengkapi profil",
    body: [
      "Masuk ke tab Profil / Me di kanan bawah, lalu pilih Edit Profile.",
      "Isi nama akun (username / nickname) dan pasang foto profil. Nama akun inilah yang kamu tulis di kolom “Nama Akun GOSH”.",
      "Simpan perubahannya.",
    ],
  },
  {
    title: "4. Ambil ID GOSH kamu",
    body: [
      "Masih di tab Profil / Me, lihat bagian atas di bawah nama akun kamu. Di situ ada tulisan “ID” diikuti angka.",
      "Tap ID tersebut untuk menyalin (copy), lalu paste ke kolom “ID GOSH” di form ini.",
      "ID GOSH itu angka unik akun kamu dan berbeda dengan username. Kalau tidak menemukannya, buka Profil → Setting / Pengaturan → Account, ID biasanya tampil di bagian informasi akun.",
    ],
  },
  {
    title: "5. Pastikan email, nama akun, dan ID cocok",
    body: [
      "Sebelum submit, cek ulang: nama akun, ID, dan email yang kamu tulis di form harus sama persis dengan yang ada di aplikasi GOSH.",
      "Kalau ada yang beda, proses verifikasi bisa tertunda atau pendaftaran ditolak.",
    ],
  },
];

export const VIDEO_TIPS: string[] = [
  "Kirim potongan livestream yang menunjukkan pembawaanmu, bukan cuma gameplay.",
  "Harus kelihatan kamu ngobrol atau berinteraksi dengan viewers.",
  "Upload videonya ke Google Drive, YouTube, atau TikTok, lalu kirim linknya di form.",
  "Pastikan link-nya bisa diakses publik (jangan private atau minta izin akses).",
];
