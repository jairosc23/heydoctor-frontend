/**
 * Medication Domain P0 — feature flag (default OFF).
 * Implements ADR-020.
 */

import { envTruthy } from "@/lib/env-truthy";

export const MEDICATION_ORDER_BUILDER_FLAG =
  "NEXT_PUBLIC_MEDICATION_ORDER_BUILDER" as const;

export function isMedicationOrderBuilderEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_MEDICATION_ORDER_BUILDER,
): boolean {
  return envTruthy(raw);
}
