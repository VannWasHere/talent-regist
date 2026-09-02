import Link from "next/link";
import { BookOpenIcon, ClockIcon, TargetIcon, WalletIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { RegistrationForm } from "@/components/registration-form";
import { REQUIREMENTS } from "@/lib/content";

const HIGHLIGHTS = [
  { icon: ClockIcon, label: "Periode", value: "30 hari" },
  { icon: TargetIcon, label: "Target", value: "60 jam live & 20 Valid Day" },
  { icon: WalletIcon, label: "Fee", value: "Rp2.000.000 NET" },
];

export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <header className="mb-8 space-y-4 text-center">
        <Badge variant="secondary">Open recruitment</Badge>
        <h1 className="font-heading text-2xl font-semibold sm:text-3xl">
          Pendaftaran Talent Streamer GOSH
        </h1>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">
          Isi form di bawah untuk ikut seleksi. Seleksi awal dinilai dari jumlah
          followers dan video livestream yang kamu kirim.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {HIGHLIGHTS.map(({ icon: Icon, label, value }) => (
          <Card key={label} size="sm">
            <CardContent className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6" size="sm">
        <CardContent className="space-y-2">
          <h2 className="font-heading text-sm font-medium">Syarat singkat</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {REQUIREMENTS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p className="pt-1 text-sm">
            <Link
              href="/panduan-gosh"
              prefetch={false}
              className="inline-flex items-center gap-1.5 font-medium underline underline-offset-4"
            >
              <BookOpenIcon className="size-4" />
              Panduan bikin akun GOSH (web / aplikasi) &amp; cara ambil ID
            </Link>
          </p>
        </CardContent>
      </Card>

      <RegistrationForm />

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        Data kamu dipakai khusus untuk proses seleksi talent.
      </footer>
    </main>
  );
}
