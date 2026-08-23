import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === "production";

/**
 * Origen Nest para el rewrite /hd-api.
 * Misma variable y normalización que getBackendOrigin.
 */
function nestOriginForHdApiRewrite() {
  const fromEnv = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL?.trim();
  let s = fromEnv || "http://localhost:3001";
  s = s.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }
  if (/\/api$/i.test(s)) {
    s = s.replace(/\/api$/i, "");
  }
  return s.replace(/\/+$/, "");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async headers() {
    const list = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      {
        key: "Permissions-Policy",
        value:
          "camera=(self), microphone=(self), geolocation=(), payment=(), usb=()",
      },
      /** CSP (nonce + connect-src): ver `middleware.ts` — no duplicar directivas aquí. */
    ];
    if (isProd) {
      list.push({
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      });
    }
    return [{ source: "/:path*", headers: list }];
  },
  async rewrites() {
    const nestOrigin = nestOriginForHdApiRewrite();
    return [
      {
        source: "/hd-api/:path*",
        destination: `${nestOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
