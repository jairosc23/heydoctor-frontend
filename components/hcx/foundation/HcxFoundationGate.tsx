import type { ReactNode } from "react";
import { isHcxFoundationEnabled } from "@/lib/hcx/flags";
import { hcxDensityClass, type HcxDensity } from "@/lib/hcx/theme";

export type HcxFoundationGateProps = {
  children: ReactNode;
  /** Override for tests. */
  enabled?: boolean;
  density?: HcxDensity;
  fallback?: ReactNode;
};

/**
 * Gates Foundation/Primitive showcase & consumers behind `hcx.foundation`.
 * Does not affect COS authority enforcement.
 */
export function HcxFoundationGate({
  children,
  enabled,
  density = "calm",
  fallback = null,
}: HcxFoundationGateProps) {
  const on = enabled ?? isHcxFoundationEnabled();
  if (!on) return <>{fallback}</>;
  return (
    <div
      className={["hcx-root", hcxDensityClass(density)].join(" ")}
      data-testid="hcx-foundation-root"
      data-hcx-flag="hcx.foundation"
    >
      {children}
    </div>
  );
}
