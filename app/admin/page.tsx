import type { Metadata } from "next";
import Link from "next/link";
import { DownloadIcon, ExternalLinkIcon, LockIcon } from "lucide-react";

import { loginAction, logoutAction } from "@/app/admin/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
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
import { adminPasswordConfigured, isAdmin } from "@/lib/auth";
import { blobEnabled, listSubmissions } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Admin - Pendaftar Talent",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  });
}

export default async function AdminPage(props: PageProps<"/admin">) {
  const params = await props.searchParams;
  const authed = await isAdmin();

  if (!adminPasswordConfigured()) {
    return (
      <main className="mx-auto w-full max-w-md px-4 py-16">
        <Alert variant="destructive">
          <LockIcon />
          <AlertTitle>ADMIN_PASSWORD belum di-set</AlertTitle>
          <AlertDescription>
            Tambahkan environment variable <code>ADMIN_PASSWORD</code> dan{" "}
            <code>APP_SECRET</code> di project Vercel, lalu redeploy.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="mx-auto w-full max-w-sm px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle>Login admin</CardTitle>
            <CardDescription>
              Masukkan password admin untuk melihat data pendaftar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={loginAction} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" required />
              </div>
              {params.error ? (
                <p className="text-xs text-destructive">Password salah.</p>
              ) : null}
              <Button type="submit" className="w-full">
                Masuk
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    );
  }

  const records = await listSubmissions();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-semibold">Pendaftar talent</h1>
          <p className="text-sm text-muted-foreground">
            {records.length} pendaftar
            {blobEnabled() ? "" : " (mode penyimpanan lokal)"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button render={<a href="/api/admin/export" />} variant="outline">
            <DownloadIcon />
            Unduh CSV
          </Button>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost">
              Keluar
            </Button>
          </form>
        </div>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Belum ada pendaftar.{" "}
            <Link href="/" prefetch={false} className="underline underline-offset-4">
              Buka form
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-xl bg-card ring-1 ring-foreground/10">
          <table className="w-full min-w-5xl text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Waktu</th>
                <th className="p-3 font-medium">Nama Akun</th>
                <th className="p-3 font-medium">ID GOSH</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Gender</th>
                <th className="p-3 font-medium">Platform</th>
                <th className="p-3 font-medium">Sosmed</th>
                <th className="p-3 font-medium">Video</th>
                <th className="p-3 font-medium">WhatsApp</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => {
                return (
                  <tr key={record.id} className="border-b last:border-0">
                    <td className="p-3 whitespace-nowrap text-muted-foreground">
                      {formatDate(record.createdAt)}
                    </td>
                    <td className="p-3 font-medium">{record.namaAkunGosh}</td>
                    <td className="p-3">{record.idGosh}</td>
                    <td className="p-3">{record.email}</td>
                    <td className="p-3">
                      <Badge variant="secondary">{record.jenisKelamin}</Badge>
                    </td>
                    <td className="p-3">{record.platformSiaran}</td>
                    <td className="p-3">
                      <a
                        href={record.linkSosmed}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 underline underline-offset-4"
                      >
                        Buka
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    </td>
                    <td className="p-3">
                      <a
                        href={record.videoLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 underline underline-offset-4"
                      >
                        Tonton
                        <ExternalLinkIcon className="size-3" />
                      </a>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <a
                        href={`https://wa.me/62${record.whatsapp.replace(/^0/, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline underline-offset-4"
                      >
                        {record.whatsapp}
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
