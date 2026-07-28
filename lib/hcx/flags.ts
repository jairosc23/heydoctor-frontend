/**
 * HCX feature flags.
 * Flags hide UX only. They MUST NEVER disable COS HAB/context fail-closed.
 */

import { envTruthy } from "@/lib/env-truthy";

export function isHcxFoundationEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_HCX_FOUNDATION,
): boolean {
  return envTruthy(raw);
}

export function isHcxWorkspaceShellEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_HCX_WORKSPACE_SHELL,
): boolean {
  return envTruthy(raw);
}

/**
 * Phase 14 — Context & Offline chrome (structural only).
 * No clinical data, HAB, AI, or emission.
 */
export function isHcxContextShellEnabled(
  raw: string | undefined = process.env.NEXT_PUBLIC_HCX_CONTEXT_SHELL,
): boolean {
  return envTruthy(raw);
}

export const HCX_FOUNDATION_FLAG = "hcx.foundation" as const;
export const HCX_WORKSPACE_SHELL_FLAG = "hcx.workspace_shell" as const;
export const HCX_CONTEXT_SHELL_FLAG = "hcx.context_shell" as const;
