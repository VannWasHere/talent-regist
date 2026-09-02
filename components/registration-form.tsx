"use client";

import { useState } from "react";
import { CheckCircle2Icon, ExternalLinkIcon, InfoIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { GENDERS, fieldsSchema, type RegistrationInput } from "@/lib/schema";

type Values = {
  namaAkunGosh: string;
  idGosh: string;
  email: string;
  jenisKelamin: string;
  platformSiaran: string;
  linkSosmed: string;
  videoLink: string;
  whatsapp: string;
};

const EMPTY: Values = {
  namaAkunGosh: "",
  idGosh: "",
  email: "",
  jenisKelamin: "",
  platformSiaran: "",
  linkSosmed: "",
  videoLink: "",
  whatsapp: "",
};

type Errors = Partial<Record<keyof Values | "form", string>>;

export function RegistrationForm() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function setField<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined, form: undefined }));
  }

  function validate(): boolean {
    const result = fieldsSchema.safeParse(values as unknown as RegistrationInput);
    if (result.success) {
      setErrors({});
      return true;
    }

    const next: Errors = {};
    for (const issue of result.error.issues) {
      const key = String(issue.path[0] ?? "form") as keyof Errors;
      if (!next[key]) next[key] = issue.message;
    }
    setErrors(next);

    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      document
        .querySelector<HTMLElement>(`[data-field="${firstKey}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    return false;
  }

  async function submit() {
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, setuju: true, website: "" }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        fieldErrors?: Record<string, string>;
      };

      if (!res.ok || !data.ok) {
        setConfirmOpen(false);
        setErrors({
          ...(data.fieldErrors as Errors),
          form: data.error ?? "Gagal mengirim pendaftaran.",
        });
        return;
      }

      setConfirmOpen(false);
      setDone(true);
    } catch {
      setConfirmOpen(false);
      setErrors({ form: "Koneksi bermasalah. Cek internet kamu lalu coba lagi." });
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <Card className="w-full">
        <CardHeader className="text-center">
          <CheckCircle2Icon className="mx-auto size-10 text-primary" />
          <CardTitle className="text-lg">Pendaftaran terkirim</CardTitle>
          <CardDescription>
            Data kamu sudah masuk. Tim kami akan mengecek followers dan video
            livestream kamu, lalu menghubungi lewat WhatsApp kalau lolos seleksi
            awal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Simpan nomor WhatsApp yang kamu daftarkan dan pastikan aktif, karena
            undangan grup akan dikirim ke nomor tersebut.
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Daftarkan akun lain
          </Button>
        </CardContent>
      </Card>
    );
  }

  const label = (key: keyof Values, text: string) => (
    <Label htmlFor={key} className="gap-1">
      {text} <span className="text-destructive">*</span>
    </Label>
  );

  const errorText = (key: keyof Values) =>
    errors[key] ? (
      <p className="text-xs text-destructive">{errors[key]}</p>
    ) : null;

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Form Pendaftaran Talent</CardTitle>
          <CardDescription>
            Semua kolom wajib diisi. Pastikan data GOSH kamu benar sebelum
            mengirim.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <section className="space-y-4">
            <h3 className="font-heading text-sm font-medium">Data akun GOSH</h3>

            <Alert>
              <InfoIcon />
              <AlertTitle>Belum punya akun GOSH?</AlertTitle>
              <AlertDescription>
                <p>
                  Bikin akunnya dulu, lalu ambil ID kamu dari halaman profil.{" "}
                  <a href="/panduan-gosh" target="_blank" rel="noreferrer">
                    Buka panduan lengkap
                    <ExternalLinkIcon className="ml-1 inline size-3 align-[-2px]" />
                  </a>
                </p>
              </AlertDescription>
            </Alert>

            <div className="space-y-2" data-field="namaAkunGosh">
              {label("namaAkunGosh", "Nama Akun GOSH")}
              <Input
                id="namaAkunGosh"
                value={values.namaAkunGosh}
                aria-invalid={Boolean(errors.namaAkunGosh)}
                onChange={(e) => setField("namaAkunGosh", e.target.value)}
                placeholder="Username / nickname di aplikasi GOSH"
                autoComplete="off"
              />
              {errorText("namaAkunGosh")}
            </div>

            <div className="space-y-2" data-field="idGosh">
              {label("idGosh", "ID GOSH")}
              <Input
                id="idGosh"
                value={values.idGosh}
                aria-invalid={Boolean(errors.idGosh)}
                onChange={(e) => setField("idGosh", e.target.value)}
                placeholder="Contoh: 12345678"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Angka unik akun kamu, ada di tab Profil / Me di bawah nama akun.
              </p>
              {errorText("idGosh")}
            </div>

            <div className="space-y-2" data-field="email">
              {label("email", "Email yang didaftarkan di GOSH")}
              <Input
                id="email"
                type="email"
                inputMode="email"
                value={values.email}
                aria-invalid={Boolean(errors.email)}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
              />
              {errorText("email")}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="font-heading text-sm font-medium">Profil streamer</h3>

            <div className="space-y-2" data-field="jenisKelamin">
              <Label className="gap-1">
                Jenis Kelamin <span className="text-destructive">*</span>
              </Label>
              <RadioGroup
                value={values.jenisKelamin}
                onValueChange={(value) => setField("jenisKelamin", String(value))}
                className="flex flex-wrap gap-4"
              >
                {GENDERS.map((gender) => (
                  <Label
                    key={gender}
                    className="group/field-label cursor-pointer font-normal"
                  >
                    <RadioGroupItem
                      value={gender}
                      aria-invalid={Boolean(errors.jenisKelamin)}
                    />
                    {gender}
                  </Label>
                ))}
              </RadioGroup>
              {errorText("jenisKelamin")}
            </div>

            <div className="space-y-2" data-field="platformSiaran">
              {label("platformSiaran", "Biasanya kamu siaran di platform apa?")}
              <Input
                id="platformSiaran"
                value={values.platformSiaran}
                aria-invalid={Boolean(errors.platformSiaran)}
                onChange={(e) => setField("platformSiaran", e.target.value)}
                placeholder="Contoh: TikTok Live, YouTube, Nimo, Bigo"
                autoComplete="off"
              />
              {errorText("platformSiaran")}
            </div>

            <div className="space-y-2" data-field="linkSosmed">
              {label("linkSosmed", "Link sosmed yang aktif (min. 3.000 subs/followers)")}
              <Input
                id="linkSosmed"
                type="url"
                value={values.linkSosmed}
                aria-invalid={Boolean(errors.linkSosmed)}
                onChange={(e) => setField("linkSosmed", e.target.value)}
                placeholder="https://www.tiktok.com/@akunkamu"
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Di bawah 3.000 followers tetap boleh daftar, asal kualitas
                livestream kamu bagus.
              </p>
              {errorText("linkSosmed")}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="font-heading text-sm font-medium">
              Video siaran / clip / cuplikan saat livestream
            </h3>
            <p className="text-sm text-muted-foreground">
              Tunjukkan gimana pembawaanmu saat livestreaming. Jangan hanya
              gameplay, harus ada interaksi dengan viewers.
            </p>

            <div className="space-y-2" data-field="videoLink">
              {label("videoLink", "Link video siaran")}
              <Input
                id="videoLink"
                type="url"
                value={values.videoLink}
                aria-invalid={Boolean(errors.videoLink)}
                onChange={(e) => setField("videoLink", e.target.value)}
                placeholder="https://drive.google.com/..."
                autoComplete="off"
              />
              <p className="text-xs text-muted-foreground">
                Upload dulu videomu ke Google Drive, YouTube, atau TikTok, lalu
                tempel linknya di sini. Pastikan aksesnya publik supaya bisa kami
                tonton.
              </p>
              {errorText("videoLink")}
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <h3 className="font-heading text-sm font-medium">Kontak</h3>
            <div className="space-y-2" data-field="whatsapp">
              {label("whatsapp", "Nomor WhatsApp (untuk dimasukkan ke grup)")}
              <Input
                id="whatsapp"
                type="tel"
                inputMode="tel"
                value={values.whatsapp}
                aria-invalid={Boolean(errors.whatsapp)}
                onChange={(e) => setField("whatsapp", e.target.value)}
                placeholder="081234567890"
                autoComplete="tel"
              />
              {errorText("whatsapp")}
            </div>
          </section>

          {errors.form ? (
            <Alert variant="destructive">
              <InfoIcon />
              <AlertTitle>Gagal mengirim</AlertTitle>
              <AlertDescription>{errors.form}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            type="button"
            size="lg"
            className="w-full"
            disabled={submitting}
            onClick={() => {
              if (validate()) setConfirmOpen(true);
            }}
          >
            Lanjut &amp; baca ketentuan
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        submitting={submitting}
        onConfirm={submit}
        summary={{
          "Nama Akun GOSH": values.namaAkunGosh,
          "ID GOSH": values.idGosh,
          Email: values.email,
          WhatsApp: values.whatsapp,
        }}
      />
    </>
  );
}
