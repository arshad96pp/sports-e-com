import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.E2E_DIST_DIR ? { distDir: process.env.E2E_DIST_DIR } : {}),
  images: {
    remotePatterns: [
      // Local Supabase stack (`pnpm db:start`).
      { protocol: "http", hostname: "127.0.0.1", port: "54321", pathname: "/storage/v1/object/public/**" },
      // Hosted Supabase project.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
    ],
    // The local Supabase stack serves storage over a private IP (127.0.0.1), which
    // Next's image optimizer refuses to fetch by default (SSRF protection). Hosted
    // Supabase uses a public `*.supabase.co` host, so this is dev-only.
    ...(process.env.NODE_ENV !== "production" ? { dangerouslyAllowLocalIP: true } : {}),
  },
};

export default nextConfig;
