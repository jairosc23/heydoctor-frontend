import type { ReactNode } from "react";
import { isHcxContextShellEnabled } from "@/lib/hcx/flags";
import { hcxDensityClass, type HcxDensity } from "@/lib/hcx/theme";

export type HcxContextShellGateProps = {
  children: ReactNode;
  enabled?: boolean;
  density?: HcxDensity;
  fallback?: ReactNode;
};

/**
 * Gates Context & Offline chrome behind `hcx.context_shell`.
 * Structural experience only — no COS authority behavior.
 */
export function HcxContextShellGate({
  children,
  enabled,
  density = "calm",
  fallback = null,
}: HcxContextShellGateProps) {
  const on = enabled ?? isHcxContextShellEnabled();
  if (!on) return <>{fallback}</>;
  return (
    <div
      className={["hcx-root", hcxDensityClass(density)].join(" ")}
      data-testid="hcx-context-shell-root"
      data-hcx-flag="hcx.context_shell"
    >
      {children}
    </div>
  );
}
