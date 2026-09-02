import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, VideoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GOSH_ACCOUNT_STEPS, VIDEO_TIPS } from "@/lib/content";

export const metadata: Metadata = {
  title: "Panduan Akun GOSH - Pendaftaran Talent",
  description:
    "Cara bikin akun GOSH, melengkapi profil, dan mengambil ID GOSH untuk pendaftaran talent streamer.",
};

export default function PanduanGoshPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <Link
        href="/"
        prefetch={false}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground underline underline-offset-4"
      >
        <ArrowLeftIcon className="size-4" />
        Kembali ke form pendaftaran
      </Link>

      <h1 className="font-heading mb-2 text-2xl font-semibold">
        Panduan akun GOSH
      </h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Tiga data yang wajib diisi di form (Nama Akun GOSH, ID GOSH, dan email
        GOSH) semuanya diambil dari aplikasi GOSH. Ikuti langkah di bawah.
      </p>

      <div className="space-y-3">
        {GOSH_ACCOUNT_STEPS.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle className="text-sm">{step.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {step.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Alert className="mt-6">
        <VideoIcon />
        <AlertTitle>Soal video siaran</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 pl-5">
            {VIDEO_TIPS.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <p className="mt-8 text-sm">
        <Link
          href="/"
          prefetch={false}
          className="font-medium underline underline-offset-4"
        >
          Sudah siap? Lanjut isi form pendaftaran
        </Link>
      </p>
    </main>
  );
}
