export type LogNamespace = "AUTH" | "SSR" | "VIDEO" | "API" | "REFRESH";
export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

type LogMeta = Record<string, unknown>;

const DEFAULT_LEVEL: LogLevel =
  process.env.NODE_ENV === "production" ? "warn" : "debug";

function parseLevel(raw?: string | null): LogLevel {
  const v = (raw ?? "").trim().toLowerCase();
  if (
    v === "debug" ||
    v === "info" ||
    v === "warn" ||
    v === "error" ||
    v === "silent"
  ) {
    return v;
  }
  return DEFAULT_LEVEL;
}

function levelRank(level: LogLevel): number {
  switch (level) {
    case "debug":
      return 10;
    case "info":
      return 20;
    case "warn":
      return 30;
    case "error":
      return 40;
    case "silent":
      return 100;
    default:
      return 30;
  }
}

function parseNamespaces(raw?: string | null): Set<LogNamespace> | "all" {
  const v = (raw ?? "").trim();
  if (!v) return "all";
  const out = new Set<LogNamespace>();
  for (const part of v.split(",")) {
    const ns = part.trim().toUpperCase();
    if (
      ns === "AUTH" ||
      ns === "SSR" ||
      ns === "VIDEO" ||
      ns === "API" ||
      ns === "REFRESH"
    ) {
      out.add(ns);
    }
  }
  return out.size > 0 ? out : "all";
}

const CONFIG = {
  level: parseLevel(process.env.NEXT_PUBLIC_LOG_LEVEL),
  namespaces: parseNamespaces(process.env.NEXT_PUBLIC_LOG_NAMESPACES),
};

function shouldLog(ns: LogNamespace, level: LogLevel): boolean {
  if (levelRank(level) < levelRank(CONFIG.level)) return false;
  if (CONFIG.namespaces === "all") return true;
  return CONFIG.namespaces.has(ns);
}

const SECRET_KEYS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "access_token",
  "refresh_token",
  "token",
  "jwt",
  "password",
  "secret",
  "csrf",
  "x-csrf-token",
]);

function redactValue(v: unknown): unknown {
  if (v == null) return v;
  if (typeof v === "string") {
    // Redact obvious bearer/token-ish strings.
    if (/bearer\s+/i.test(v)) return "[REDACTED]";
    if (v.length > 256 && /[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\./.test(v)) {
      return "[REDACTED]";
    }
    return v;
  }
  if (typeof v !== "object") return v;
  if (v instanceof Error) {
    return { name: v.name, message: v.message };
  }
  if (Array.isArray(v)) {
    return v.map((x) => redactValue(x));
  }
  const o = v as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, val] of Object.entries(o)) {
    const key = k.toLowerCase();
    if (SECRET_KEYS.has(key)) {
      out[k] = "[REDACTED]";
    } else {
      out[k] = redactValue(val);
    }
  }
  return out;
}

function safeMeta(meta?: LogMeta): LogMeta | undefined {
  if (!meta) return undefined;
  return redactValue(meta) as LogMeta;
}

function emit(
  ns: LogNamespace,
  level: Exclude<LogLevel, "silent">,
  message: string,
  meta?: LogMeta,
): void {
  if (typeof console === "undefined") return;
  if (!shouldLog(ns, level)) return;
  const payload = safeMeta(meta);
  const prefix = `[${ns}]`;
  switch (level) {
    case "debug":
      console.debug(prefix, message, payload ?? "");
      return;
    case "info":
      console.info(prefix, message, payload ?? "");
      return;
    case "warn":
      console.warn(prefix, message, payload ?? "");
      return;
    case "error":
      console.error(prefix, message, payload ?? "");
      return;
  }
}

export function getLogger(namespace: LogNamespace) {
  return {
    debug(message: string, meta?: LogMeta) {
      emit(namespace, "debug", message, meta);
    },
    info(message: string, meta?: LogMeta) {
      emit(namespace, "info", message, meta);
    },
    warn(message: string, meta?: LogMeta) {
      emit(namespace, "warn", message, meta);
    },
    error(message: string, meta?: LogMeta) {
      emit(namespace, "error", message, meta);
    },
  };
}

/**
 * Logger condicional: solo emite en desarrollo.
 * En producción (NODE_ENV=production), los logs son silenciados.
 * Reemplaza console.log/warn/error en código de aplicación.
 */

const isDev =
  typeof process !== "undefined" &&
  (process as { env?: { NODE_ENV?: string } }).env?.NODE_ENV !== "production";

function noop() {}

export const logger = {
  log: isDev ? console.log.bind(console) : noop,
  warn: isDev ? console.warn.bind(console) : noop,
  error: isDev ? console.error.bind(console) : noop,
};
