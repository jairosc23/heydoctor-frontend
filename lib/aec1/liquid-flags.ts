/**
 * AEC-1 M4 — Liquid spine soak flag.
 * Reuses HCX workspace shell (`NEXT_PUBLIC_HCX_WORKSPACE_SHELL`).
 * Default OFF. Never disables COS HAB / fail-closed clinical rules.
 */

import { isHcxWorkspaceShellEnabled } from "@/lib/hcx/flags";

export const AEC1_LIQUID_SPINE_FLAG = "aec1.liquid_spine" as const;

/** Liquid spine is enabled when HCX workspace shell soak is ON. */
export function isAec1LiquidSpineEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_HCX_WORKSPACE_SHELL,
): boolean {
  return isHcxWorkspaceShellEnabled(raw);
}
