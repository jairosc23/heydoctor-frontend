/**
 * Medication Order Builder flag.
 * Default ON for production-visible premium UX.
 * Opt-out: NEXT_PUBLIC_MEDICATION_ORDER_BUILDER=0
 */

import { envTruthy } from "@/lib/env-truthy";

export const MEDICATION_ORDER_BUILDER_FLAG =
  "NEXT_PUBLIC_MEDICATION_ORDER_BUILDER" as const;

const OFF = new Set(["0", "false", "off", "no"]);

export function isMedicationOrderBuilderEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_MEDICATION_ORDER_BUILDER,
): boolean {
  if (raw === undefined || raw.trim() === "") return true;
  const trimmed = raw.trim().toLowerCase();
  if (OFF.has(trimmed)) return false;
  return envTruthy(raw);
}
