import type { ReactNode } from "react";
import { isHcxWorkspaceShellEnabled } from "@/lib/hcx/flags";
import { hcxDensityClass, type HcxDensity } from "@/lib/hcx/theme";

export type HcxWorkspaceShellGateProps = {
  children: ReactNode;
  enabled?: boolean;
  density?: HcxDensity;
  fallback?: ReactNode;
};

/**
 * Gates Workspace Shell behind `hcx.workspace_shell`.
 * Structural chrome only — no COS behavior.
 */
export function HcxWorkspaceShellGate({
  children,
  enabled,
  density = "calm",
  fallback = null,
}: HcxWorkspaceShellGateProps) {
  const on = enabled ?? isHcxWorkspaceShellEnabled();
  if (!on) return <>{fallback}</>;
  return (
    <div
      className={["hcx-root", hcxDensityClass(density)].join(" ")}
      data-testid="hcx-workspace-shell-root"
      data-hcx-flag="hcx.workspace_shell"
    >
      {children}
    </div>
  );
}
