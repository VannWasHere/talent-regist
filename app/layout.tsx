import type { Metadata, Viewport } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Pendaftaran Talent Streamer GOSH",
  description:
    "Form pendaftaran talent livestreaming GOSH: isi data akun, kirim video siaran, dan baca ketentuan program.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-muted/30">{children}</body>
    </html>
  );
}
