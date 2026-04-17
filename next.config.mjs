import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Orígenes permitidos para fetch/WebSocket/Socket.IO (además de lo que pida el entorno).
 * Sin esto, una CSP mínima rompe panel, teleconsulta o Sentry en producción.
 */
function connectSrcDirective() {
  const parts = [
    "'self'",
    "https://pro-api.heydoctor.health",
    "wss://pro-api.heydoctor.health",
    "https://vitals.vercel-insights.com",
    "https://vercel.live",
    "wss://vercel.live",
    "https://*.railway.app",
    "wss://*.railway.app",
    "https://*.heydoctor.health",
    "wss://*.heydoctor.health",
    "https://*.ingest.sentry.io",
    "https://*.sentry.io",
  ];
  const raw = process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL?.trim();
  if (raw) {
    try {
      const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      const u = new URL(normalized.replace(/\/api\/?$/i, ""));
      const origin = u.origin;
      const wss = u.protocol === "https:" ? `wss://${u.host}` : "";
      if (origin && !parts.includes(origin)) parts.push(origin);
      if (wss && !parts.includes(wss)) parts.push(wss);
    } catch {
      /* URL inválida: se omiten entradas extra */
    }
  }
  return parts.join(" ");
}

/**
 * CSP única (evitar duplicar con middleware: varias políticas se combinan y endurecen todo).
 * script-src: 'unsafe-inline' + 'unsafe-eval' — requerido por hidratación App Router en Vercel;
 * endurecer después con nonces si aplica.
 */
function contentSecurityPolicy() {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    `connect-src ${connectSrcDirective()}`,
    "frame-src 'self' https://vercel.live https://*.payku.cl",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async headers() {
    const csp = contentSecurityPolicy();
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
