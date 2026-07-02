/** Valor sustituto uniforme para datos sensibles en telemetría. */
export const TELEMETRY_REDACTED = "[REDACTED]";

const MAX_DEPTH = 5;
/** Longitud máxima del string de salida tras redacción. */
const MAX_STRING_LENGTH = 2_000;
/** Trunca la entrada antes de regex para evitar costo O(n) en payloads enormes. */
const MAX_INPUT_STRING_LENGTH = 8_192;
const MAX_OBJECT_KEYS = 200;
const MAX_ARRAY_LENGTH = 100;
const MAX_NODE_BUDGET = 2_000;

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const JWT_RE = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;
const BEARER_RE = /Bearer\s+\S+/gi;
const API_KEY_INLINE_RE =
  /(?:api[_-]?key|apikey|x-api-key)\s*[:=]\s*\S+/gi;

/**
 * Nombres de claves cuyo valor debe redactarse en objetos de telemetría.
 * Compartido por Sentry, CSP (futuro) y sinks adicionales.
 */
export const SENSITIVE_KEY_NAMES = new Set([
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
  "sdp",
  "candidate",
  "icecandidate",
  "email",
  "patient",
  "patientname",
  "diagnosis",
  "prescription",
  "clinicalnote",
  "medicalhistory",
  "api_key",
  "apikey",
  "x-api-key",
]);

type SanitizeState = {
  depth: number;
  seen: WeakSet<object>;
  nodesRemaining: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    !(value instanceof Date) &&
    !(value instanceof Error)
  );
}

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[_-]/g, "");
}

function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase();
  const normalized = normalizeKey(key);
  return SENSITIVE_KEY_NAMES.has(lower) || SENSITIVE_KEY_NAMES.has(normalized);
}

function sanitizeChild(value: unknown, state: SanitizeState): unknown {
  state.depth += 1;
  try {
    return sanitizeTelemetryValueInternal(value, state);
  } finally {
    state.depth -= 1;
  }
}

function consumeNode(state: SanitizeState): boolean {
  if (state.nodesRemaining <= 0) return false;
  state.nodesRemaining -= 1;
  return true;
}

/**
 * Redacta patrones sensibles en strings sueltos (JWT, Bearer, email, API keys).
 */
export function redactSensitiveString(value: string): string {
  const bounded =
    value.length > MAX_INPUT_STRING_LENGTH
      ? `${value.slice(0, MAX_INPUT_STRING_LENGTH)}...[input truncated]`
      : value;

  let out = bounded;
  out = out.replace(JWT_RE, TELEMETRY_REDACTED);
  out = out.replace(BEARER_RE, TELEMETRY_REDACTED);
  if (out.includes("@")) {
    out = out.replace(EMAIL_RE, TELEMETRY_REDACTED);
  }
  out = out.replace(API_KEY_INLINE_RE, TELEMETRY_REDACTED);
  if (out.length > MAX_STRING_LENGTH) {
    return `${out.slice(0, MAX_STRING_LENGTH)}...[truncated]`;
  }
  return out;
}

function sanitizeTelemetryValueInternal(
  value: unknown,
  state: SanitizeState,
): unknown {
  if (!consumeNode(state)) return "[MaxNodes]";

  if (value === null || value === undefined) return value;
  if (typeof value === "string") return redactSensitiveString(value);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSensitiveString(value.message),
    };
  }
  if (state.depth >= MAX_DEPTH) return "[MaxDepth]";

  if (Array.isArray(value)) {
    if (state.seen.has(value)) return "[Circular]";
    state.seen.add(value);

    const total = value.length;
    const limit = Math.min(total, MAX_ARRAY_LENGTH);
    const out: unknown[] = [];
    for (let i = 0; i < limit; i += 1) {
      out.push(sanitizeChild(value[i], state));
    }
    if (total > MAX_ARRAY_LENGTH) {
      out.push(`...[${total - MAX_ARRAY_LENGTH} more items]`);
    }
    return out;
  }

  if (!isRecord(value)) return String(value);

  if (state.seen.has(value)) return "[Circular]";
  state.seen.add(value);

  const entries = Object.entries(value);
  const out: Record<string, unknown> = {};
  const limit = Math.min(entries.length, MAX_OBJECT_KEYS);

  for (let i = 0; i < limit; i += 1) {
    const [key, child] = entries[i]!;
    out[key] = isSensitiveKey(key)
      ? TELEMETRY_REDACTED
      : sanitizeChild(child, state);
  }

  if (entries.length > MAX_OBJECT_KEYS) {
    out["...[truncated]"] = `${entries.length - MAX_OBJECT_KEYS} more keys`;
  }

  return out;
}

/**
 * Sanitiza recursivamente valores para telemetría (Sentry, CSP logs, futuros sinks).
 */
export function sanitizeTelemetryValue(
  value: unknown,
  depth = 0,
): unknown {
  const state: SanitizeState = {
    depth,
    seen: new WeakSet<object>(),
    nodesRemaining: MAX_NODE_BUDGET,
  };
  return sanitizeTelemetryValueInternal(value, state);
}
