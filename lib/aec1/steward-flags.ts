/**
 * AEC-1 M1 — Steward Review Mode chrome flag.
 * Default OFF. Does not disable COS HAB / fail-closed rules.
 */

import { envTruthy } from "@/lib/env-truthy";

export const AEC1_STEWARD_REVIEW_FLAG = "aec1.steward_review" as const;

export function isAec1StewardReviewEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_AEC1_STEWARD_REVIEW,
): boolean {
  return envTruthy(raw);
}
