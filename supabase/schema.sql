-- =============================================================================
-- Talent Registration - skema Supabase
-- Jalankan seluruh file ini di Supabase Dashboard → SQL Editor → New query → Run
-- Aman dijalankan berulang kali (idempotent).
-- =============================================================================

create table if not exists public.talent_registrations (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  nama_akun_gosh   text        not null,
  id_gosh          text        not null,
  email            text        not null,
  jenis_kelamin    text        not null,
  platform_siaran  text        not null,
  link_sosmed      text        not null,
  video_link       text        not null,
  whatsapp         text        not null
);

-- Migrasi label lama (Cowo/Cewe) ke label baru (Pria/Wanita).
-- Constraint lama dilepas dulu supaya update tidak ditolak.
alter table public.talent_registrations
  drop constraint if exists talent_registrations_jenis_kelamin_check;

update public.talent_registrations set jenis_kelamin = 'Pria'   where jenis_kelamin = 'Cowo';
update public.talent_registrations set jenis_kelamin = 'Wanita' where jenis_kelamin = 'Cewe';

-- Hanya boleh 'Pria' atau 'Wanita'
alter table public.talent_registrations
  add constraint talent_registrations_jenis_kelamin_check
  check (jenis_kelamin in ('Pria', 'Wanita'));

-- Satu email hanya bisa mendaftar sekali (case-insensitive).
create unique index if not exists talent_registrations_email_unique
  on public.talent_registrations (lower(email));

-- Urutan tampil di halaman admin: terbaru dulu.
create index if not exists talent_registrations_created_at_idx
  on public.talent_registrations (created_at desc);

-- =============================================================================
-- Keamanan: RLS ON tanpa policy apa pun.
-- Artinya anon key / browser TIDAK bisa baca-tulis tabel ini sama sekali.
-- Aplikasi mengakses tabel dari server memakai SERVICE ROLE KEY, yang
-- otomatis melewati RLS. Jadi data pendaftar tidak bisa diakses publik.
-- =============================================================================
alter table public.talent_registrations enable row level security;

revoke all on public.talent_registrations from anon;
revoke all on public.talent_registrations from authenticated;
