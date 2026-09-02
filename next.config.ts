import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kecilkan permukaan & jejak request:
  poweredByHeader: false,
  reactStrictMode: true,
  // Tidak ada <Image> remote, tidak ada font eksternal, tidak ada polling.
  logging: { fetches: { fullUrl: false } },
};

export default nextConfig;
