"use client";

import { StewardReviewPanel } from "@/components/aec1/steward/StewardReviewPanel";
import { isAec1StewardReviewEnabled } from "@/lib/aec1/steward-flags";

/**
 * AEC-1 M1 Steward Governance UX — Review Mode harness.
 * Mounts under /dev; uses HCX workspace container only (no Liquid M4, no second OS).
 */
export default function Aec1StewardReviewDevPage() {
  return <StewardReviewPanel enabled={isAec1StewardReviewEnabled()} />;
}
