import "server-only";

import { head, list, put } from "@vercel/blob";

import { decryptJson, encryptJson, stableHash } from "@/lib/secure";
import type { SubmissionRecord } from "@/lib/schema";

const PREFIX = "submissions/";
const LOCAL_DIR = ".data/submissions";

/** Blob store aktif? Kalau tidak, jatuh ke penyimpanan lokal (khusus dev). */
export function blobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function pathnameFor(email: string): string {
  return `${PREFIX}${stableHash(email)}.enc`;
}

/* -------------------------------------------------------------------------- */
/* Penyimpanan lokal (hanya untuk `next dev` tanpa Blob store)                */
/* -------------------------------------------------------------------------- */

async function localFs() {
  const [fs, path] = await Promise.all([import("node:fs/promises"), import("node:path")]);
  const dir = path.join(process.cwd(), LOCAL_DIR);
  await fs.mkdir(dir, { recursive: true });
  return { fs, path, dir };
}

/* -------------------------------------------------------------------------- */
/* API publik                                                                 */
/* -------------------------------------------------------------------------- */

export async function submissionExists(email: string): Promise<boolean> {
  if (!blobEnabled()) {
    const { fs, path, dir } = await localFs();
    try {
      await fs.access(path.join(dir, `${stableHash(email)}.enc`));
      return true;
    } catch {
      return false;
    }
  }

  try {
    await head(pathnameFor(email));
    return true;
  } catch {
    // head() melempar BlobNotFoundError kalau file belum ada.
    return false;
  }
}

export async function saveSubmission(record: SubmissionRecord): Promise<void> {
  const payload = encryptJson(record);

  if (!blobEnabled()) {
    const { fs, path, dir } = await localFs();
    await fs.writeFile(path.join(dir, `${stableHash(record.email)}.enc`), payload, "utf8");
    return;
  }

  await put(pathnameFor(record.email), payload, {
    access: "public",
    contentType: "text/plain",
    addRandomSuffix: false,
    allowOverwrite: false,
    cacheControlMaxAge: 0,
  });
}

/**
 * Ambil semua pendaftar, terbaru dulu.
 * Hanya dipanggil dari halaman admin, jadi tidak ada request berkala.
 */
export async function listSubmissions(): Promise<SubmissionRecord[]> {
  const raw: string[] = [];

  if (!blobEnabled()) {
    const { fs, path, dir } = await localFs();
    const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".enc"));
    for (const file of files) {
      raw.push(await fs.readFile(path.join(dir, file), "utf8"));
    }
  } else {
    const { blobs } = await list({ prefix: PREFIX, limit: 1000 });
    const batchSize = 8;
    for (let i = 0; i < blobs.length; i += batchSize) {
      const batch = await Promise.all(
        blobs.slice(i, i + batchSize).map(async (blob) => {
          const res = await fetch(blob.url, { cache: "no-store" });
          return res.ok ? res.text() : null;
        }),
      );
      raw.push(...batch.filter((value): value is string => Boolean(value)));
    }
  }

  const records: SubmissionRecord[] = [];
  for (const value of raw) {
    try {
      records.push(decryptJson<SubmissionRecord>(value));
    } catch {
      // Data yang tidak bisa didekripsi (APP_SECRET berubah) dilewati.
    }
  }

  return records.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
