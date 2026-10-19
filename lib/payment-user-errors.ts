/**
 * User-facing payment copy — never surface provider/config/stack details.
 */

export const PAYMENT_UNAVAILABLE_USER_MESSAGE =
  "Los pagos en línea no están disponibles temporalmente. Puedes continuar explorando la plataforma o intentarlo más tarde.";

/** Thrown by checkout clients; `.message` is always UI-safe. */
export class PaymentCheckoutError extends Error {
  readonly status: number;
  constructor(status = 503) {
    super(PAYMENT_UNAVAILABLE_USER_MESSAGE);
    this.status = status;
    this.name = "PaymentCheckoutError";
  }
}
const LEAKY_PAYMENT_PATTERNS = [
  /payment provider/i,
  /payku/i,
  /not configured/i,
  /start-checkout\s*HTTP/i,
  /HTTP\s*\d{3}/i,
  /Internal Server Error/i,
  /ECONNREFUSED/i,
  /stack/i,
  /exception/i,
];

export function isLeakyPaymentMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return true;
  return LEAKY_PAYMENT_PATTERNS.some((re) => re.test(trimmed));
}

/** Map any payment failure to a safe Spanish UI string. */
export function toPaymentUserMessage(
  err: unknown,
  fallback: string = PAYMENT_UNAVAILABLE_USER_MESSAGE,
): string {
  const status =
    typeof err === "object" &&
    err !== null &&
    "status" in err &&
    typeof (err as { status: unknown }).status === "number"
      ? (err as { status: number }).status
      : undefined;

  if (status === 401) {
    return "Tu sesión expiró. Inicia sesión de nuevo e inténtalo otra vez.";
  }
  if (status === 403) {
    return "No tienes permiso para iniciar este pago.";
  }
  if (status === 404) {
    return "No encontramos el recurso de pago. Puedes seguir explorando o contactar soporte.";
  }
  if (status !== undefined && status >= 500) {
    return PAYMENT_UNAVAILABLE_USER_MESSAGE;
  }

  let raw = "";
  if (err instanceof Error) raw = err.message;
  else if (typeof err === "string") raw = err;
  else if (
    typeof err === "object" &&
    err !== null &&
    "message" in err &&
    typeof (err as { message: unknown }).message === "string"
  ) {
    raw = (err as { message: string }).message;
  }

  if (raw && !isLeakyPaymentMessage(raw)) {
    // Allow short, already-friendly product messages only.
    if (raw.length <= 160 && !/[{\[\]]/.test(raw)) return raw;
  }

  return fallback;
}

/** Sanitize a backend `message` field before showing it in booking/pricing UI. */
export function sanitizePaymentApiMessage(
  message: string | string[] | undefined,
  status: number,
): string {
  const joined = Array.isArray(message)
    ? message.filter((m) => typeof m === "string").join(" · ")
    : typeof message === "string"
      ? message
      : "";
  return toPaymentUserMessage(
    { status, message: joined },
    PAYMENT_UNAVAILABLE_USER_MESSAGE,
  );
}
