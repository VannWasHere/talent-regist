// Menjalankan supabase/schema.sql ke database Supabase lewat koneksi Postgres.
//
// Skrip sekali pakai untuk membuat tabel (tabel sudah dibuat, ini cuma buat
// jaga-jaga kalau perlu dijalankan ulang).
//
// Butuh SUPABASE_DB_NAME dan SUPABASE_DB_PASSWORD di .env.local.
// Cara pakai:
//   npm install pg --no-save
//   node scripts/setup-db.mjs
//   npm uninstall pg
import { readFileSync } from "node:fs";
import { Client } from "pg";

function loadEnv() {
  const raw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

const env = loadEnv();
const projectRef = new URL(env.SUPABASE_URL).hostname.split(".")[0];
const password = process.env.SUPABASE_DB_PASSWORD || env.SUPABASE_DB_PASSWORD;
const database = process.env.SUPABASE_DB_NAME || env.SUPABASE_DB_NAME || "postgres";

if (!password) {
  console.error(
    "SUPABASE_DB_PASSWORD belum di-set di .env.local.\n" +
      "Ambil / reset di Supabase → Project Settings → Database.",
  );
  process.exit(3);
}
const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

const regions = [
  "ap-southeast-1",
  "ap-southeast-2",
  "us-east-1",
  "us-west-1",
  "eu-central-1",
  "ap-northeast-1",
  "ap-south-1",
];

const candidates = [
  // Direct connection
  { host: `db.${projectRef}.supabase.co`, port: 5432, user: "postgres" },
  // Poolers (session 5432 + transaction 6543) across regions
  ...regions.flatMap((r) => [
    { host: `aws-0-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}` },
    { host: `aws-1-${r}.pooler.supabase.com`, port: 5432, user: `postgres.${projectRef}` },
  ]),
];

async function tryConnect(cfg) {
  const client = new Client({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
    query_timeout: 20000,
  });
  await client.connect();
  return client;
}

let client = null;
let used = null;
for (const cfg of candidates) {
  try {
    client = await tryConnect(cfg);
    used = cfg;
    break;
  } catch (e) {
    process.stderr.write(`skip ${cfg.host}:${cfg.port} (${e.code || e.message})\n`);
  }
}

if (!client) {
  console.error("NO_CONNECTION");
  process.exit(1);
}

try {
  console.error(`connected via ${used.host}:${used.port}`);
  await client.query(sql);
  const { rows } = await client.query(
    "select count(*)::int as n from public.talent_registrations",
  );
  console.log("OK rows=" + rows[0].n + " host=" + used.host);
} catch (e) {
  console.error("SQL_ERR " + e.message);
  process.exit(2);
} finally {
  await client.end();
}
