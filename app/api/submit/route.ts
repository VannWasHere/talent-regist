import { randomUUID } from "node:crypto";

import { registrationSchema, type SubmissionRecord } from "@/lib/schema";
import { saveSubmission, submissionExists } from "@/lib/storage";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

/**
 * Rate limit sederhana per instance (in-memory, tanpa biaya storage).
 * Cukup untuk menahan spam ringan tanpa menambah service apa pun.
 */
const HITS = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    HITS.set(ip, recent);
    return true;
  }
  recent.push(now);
  HITS.set(ip, recent);
  if (HITS.size > 500) {
    for (const [key, times] of HITS) {
      if (times.every((t) => now - t >= WINDOW_MS)) HITS.delete(key);
    }
  }
  return false;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return json(
      { ok: false, error: "Terlalu banyak percobaan. Coba lagi 10 menit lagi." },
      429,
    );
  }

  const size = Number(request.headers.get("content-length") ?? 0);
  if (size > 20_000) {
    return json({ ok: false, error: "Data terlalu besar." }, 413);
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, error: "Body request tidak valid." }, 400);
  }

  // Honeypot: bot biasanya mengisi semua field yang ada.
  if (
    typeof payload === "object" &&
    payload !== null &&
    typeof (payload as Record<string, unknown>).website === "string" &&
    (payload as Record<string, unknown>).website !== ""
  ) {
    return json({ ok: true, duplicate: false });
  }

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      fieldErrors[key] ??= issue.message;
    }
    return json({ ok: false, error: "Data belum lengkap.", fieldErrors }, 422);
  }

  const data = parsed.data;

  try {
    if (await submissionExists(data.email)) {
      return json(
        {
          ok: false,
          error:
            "Email ini sudah pernah mendaftar. Kalau perlu mengubah data, hubungi admin lewat WhatsApp.",
        },
        409,
      );
    }

    const record: SubmissionRecord = {
      ...data,
      id: randomUUID(),
      createdAt: new Date().toISOString(),
    };

    await saveSubmission(record);
    return json({ ok: true, id: record.id });
  } catch (error) {
    console.error("[submit] gagal menyimpan pendaftaran", error);
    return json(
      {
        ok: false,
        error:
          "Server gagal menyimpan pendaftaran. Coba lagi beberapa saat, atau hubungi admin.",
      },
      500,
    );
  }
}
