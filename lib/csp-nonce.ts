/**
 * CSP por solicitud (Edge / middleware).
 * Producción: nonce + strict-dynamic (sin unsafe-eval en script).
 * Estilos: unsafe-inline (Tailwind / Next hasta migración completa a nonce en style).
 */

const SENTRY_CONNECT_HOSTS = [
  "https://*.ingest.sentry.io",
  "https://*.ingest.us.sentry.io",
  "https://*.ingest.de.sentry.io",
  "https://*.sentry.io",
];

const SSOT_CONNECT_DEFAULTS = [
  "https://pro-api.heydoctor.health",
  "wss://pro-api.heydoctor.health",
  "https://vitals.vercel-insights.com",
  "https://vercel.live",
  "wss://vercel.live",
  "https://ws-us3.pusher.com",
  "wss://ws-us3.pusher.com",
  "https://*.railway.app",
  "wss://*.railway.app",
  "https://*.heydoctor.health",
  "wss://*.heydoctor.health",
];

export type BuildCspOptions = {
  nonce: string;
  isProd: boolean;
  reportUri?: string;
};

function addHttpOrigin(connect: Set<string>, raw: string | undefined): void {
  const value = raw?.trim();
  if (!value) return;
  try {
    let normalized = value;
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    normalized = normalized.replace(/\/api\/?$/i, "");
    const origin = new URL(normalized).origin;
    connect.add(origin);
    if (/^https:\/\//i.test(origin)) {
      connect.add(origin.replace(/^https:\/\//i, "wss://"));
    } else if (/^http:\/\//i.test(origin)) {
      connect.add(origin.replace(/^http:\/\//i, "ws://"));
    }
  } catch {
    /* ignore invalid URL */
  }
}

function addConnectList(connect: Set<string>, raw: string | undefined): void {
  raw
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      if (/^(stuns?|turns?):/i.test(part)) {
        connect.add(part);
        const scheme = part.split(":")[0]?.toLowerCase();
        if (scheme) connect.add(`${scheme}:`);
        return;
      }
      addHttpOrigin(connect, part);
    });
}

export function buildCspWithNonce(
  nonce: string,
  isProd: boolean,
  reportUri?: string,
): string;
export function buildCspWithNonce(options: BuildCspOptions): string;
export function buildCspWithNonce(
  nonceOrOptions: string | BuildCspOptions,
  isProdArg?: boolean,
  reportUriArg?: string,
): string {
  const opts: BuildCspOptions =
    typeof nonceOrOptions === "string"
      ? {
          nonce: nonceOrOptions,
          isProd: isProdArg ?? false,
          reportUri: reportUriArg,
        }
      : nonceOrOptions;

  const { nonce, isProd, reportUri } = opts;
  const connect = new Set<string>(["'self'"]);

  SSOT_CONNECT_DEFAULTS.forEach((entry) => connect.add(entry));

  if (!isProd) {
    addHttpOrigin(connect, "http://localhost:3000");
    addHttpOrigin(connect, "http://127.0.0.1:3000");
    addHttpOrigin(connect, "http://localhost:3001");
    addHttpOrigin(connect, "ws://localhost:3001");
    addHttpOrigin(connect, "http://127.0.0.1:3001");
    addHttpOrigin(connect, "ws://127.0.0.1:3001");
  }

  addHttpOrigin(connect, process.env.NEXT_PUBLIC_HEYDOCTOR_API_URL);
  addHttpOrigin(connect, process.env.HEYDOCTOR_API_INTERNAL_URL);
  addHttpOrigin(connect, process.env.NEXT_PUBLIC_SITE_URL);
  addConnectList(connect, process.env.NEXT_PUBLIC_CSP_CONNECT_SRC);
  addConnectList(connect, process.env.NEXT_PUBLIC_TURN_URLS);
  addConnectList(connect, process.env.WEBRTC_STUN_URLS);

  connect.add("https://api.stripe.com");
  connect.add("stun:");
  connect.add("stuns:");
  connect.add("turn:");
  connect.add("turns:");

  if (process.env.NEXT_PUBLIC_SENTRY_DSN?.trim()) {
    SENTRY_CONNECT_HOSTS.forEach((host) => connect.add(host));
  }

  const scriptSrc = isProd
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://vercel.live https://va.vercel-scripts.com`
    : `'self' 'nonce-${nonce}' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://vercel.live https://va.vercel-scripts.com`;

  const directives = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
    "font-src 'self' https://fonts.gstatic.com https://vercel.live https://assets.vercel.com data:",
    "img-src 'self' data: blob: https://vercel.live https://vercel.com https://assets.vercel.com",
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    `connect-src ${Array.from(connect).join(" ")}`,
    "frame-src 'self' https://vercel.live https://js.stripe.com https://checkout.stripe.com https://hooks.stripe.com",
    "form-action 'self'",
    "manifest-src 'self'",
  ];

  if (isProd) {
    directives.push("upgrade-insecure-requests");
  }
  if (reportUri) {
    directives.push(`report-uri ${reportUri}`);
  }

  return directives.join("; ");
}
