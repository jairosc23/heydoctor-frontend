/**
 * CB-2 — Emit Clinical Copilot telemetry (PHI-safe).
 * Reuses window-hook + sanitizer patterns from auth/session telemetry.
 */

import { buildSafeDetail } from "./phi-safe";
import type {
  ClinicalTelemetryDetail,
  ClinicalTelemetryEventName,
  ClinicalTelemetrySink,
} from "./types";

declare global {
  interface Window {
    __HEYDOCTOR_COPILOT_TELEMETRY__?: ClinicalTelemetrySink;
  }
}

let extraSink: ClinicalTelemetrySink | null = null;

/** Test/prod hook to capture events without network. */
export function registerClinicalTelemetrySink(
  sink: ClinicalTelemetrySink | null,
): void {
  extraSink = sink;
}

export function emitClinicalTelemetry(
  event: ClinicalTelemetryEventName,
  detail: Omit<ClinicalTelemetryDetail, "observabilityVersion"> = {},
): ClinicalTelemetryDetail {
  const safe = buildSafeDetail(detail);

  try {
    if (typeof window !== "undefined") {
      window.__HEYDOCTOR_COPILOT_TELEMETRY__?.(event, safe);
    }
  } catch {
    /* noop */
  }

  try {
    extraSink?.(event, safe);
  } catch {
    /* noop */
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(`[copilot-telemetry] ${event}`, safe);
  }

  return safe;
}
