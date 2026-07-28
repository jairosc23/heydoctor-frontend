import type { ReactNode } from "react";
import { isW3WorkspaceEnabled } from "@/lib/w3/flags";

export type W3WorkspaceMaturityGateProps = {
  children: ReactNode;
  enabled?: boolean;
  fallback?: ReactNode;
};

/**
 * Gates WP-01 workspace maturity chrome behind NEXT_PUBLIC_W3_WORKSPACE.
 * Structural only — never Confirm/Emit.
 */
export function W3WorkspaceMaturityGate({
  children,
  enabled,
  fallback = null,
}: W3WorkspaceMaturityGateProps) {
  const on = enabled ?? isW3WorkspaceEnabled();
  if (!on) return <>{fallback}</>;
  return (
    <div
      data-testid="w3-workspace-maturity-root"
      data-w3-flag="w3.workspace"
      data-is-authority="false"
    >
      {children}
    </div>
  );
}
