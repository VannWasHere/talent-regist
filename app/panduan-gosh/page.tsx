import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircle2Icon,
  ExternalLinkIcon,
  GlobeIcon,
  SmartphoneIcon,
  VideoIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  GOSH_APP_STEPS,
  GOSH_FINAL_CHECK,
  GOSH_WEB_STEPS,
  GOSH_WEB_URL,
  VIDEO_TIPS,
  type GuideStep,
} from "@/lib/content";

export const metadata: Metadata = {
  title: "Panduan Akun GOSH - Pendaftaran Talent",
  description:
    "Cara bikin akun GOSH lewat web gosh.com (disarankan) atau aplikasi, dan cara mengambil ID GOSH untuk pendaftaran talent streamer.",
};

function StepList({ steps }: { steps: GuideStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step) => (
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
  );
}

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
        GOSH) semuanya diambil dari akun GOSH kamu. Ada dua cara: lewat web
        (disarankan) atau lewat aplikasi HP. Pilih salah satu.
      </p>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <GlobeIcon className="size-4" />
          <h2 className="font-heading text-base font-medium">
            Cara 1 — Daftar lewat web
          </h2>
          <Badge>Disarankan</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Paling cepat: tidak perlu install aplikasi, dan ID kamu langsung
          kelihatan di halaman profil.
        </p>
        <Button
          render={
            <a href={GOSH_WEB_URL} target="_blank" rel="noreferrer noopener" />
          }
        >
          Buka {GOSH_WEB_URL.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          <ExternalLinkIcon />
        </Button>

        <StepList steps={GOSH_WEB_STEPS} />
      </section>

      <Separator className="my-8" />

      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <SmartphoneIcon className="size-4" />
          <h2 className="font-heading text-base font-medium">
            Cara 2 — Lewat aplikasi HP
          </h2>
          <Badge variant="secondary">Alternatif</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Pilih ini kalau kamu memang lebih nyaman pakai aplikasi.
        </p>

        <StepList steps={GOSH_APP_STEPS} />
      </section>

      <Alert className="mt-8">
        <CheckCircle2Icon />
        <AlertTitle>Sebelum submit</AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 pl-5">
            {GOSH_FINAL_CHECK.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <Alert className="mt-3">
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
