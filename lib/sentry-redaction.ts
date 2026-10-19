import type { Event } from "@sentry/nextjs";
import { sanitizeTelemetryValue } from "@/lib/telemetry-sanitizer";

/**
 * Aplica la política compartida de redacción PHI/auth a un evento Sentry.
 * Wrapper delgado sobre {@link sanitizeTelemetryValue}; no duplica reglas.
 */
export function sanitizeTelemetry<E extends Event>(event: E): E {
  return sanitizeTelemetryValue(event) as E;
}
