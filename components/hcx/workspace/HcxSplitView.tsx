import type { ReactNode } from "react";

export type HcxSplitViewProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  /** When false, secondary is hidden (sm). */
  showSecondary?: boolean;
  secondaryWidth?: number | string;
};

/**
 * Split view layout — structural only.
 * Does not host Assist/HAB panels by semantics in Phase 13.
 */
export function HcxSplitView({
  primary,
  secondary,
  showSecondary = true,
  secondaryWidth = 320,
}: HcxSplitViewProps) {
  return (
    <div
      data-testid="hcx-split-view"
      className="hcx-split-view"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "var(--hcx-space-4)",
        height: "100%",
        minHeight: 240,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>{primary}</div>
      {showSecondary && secondary ? (
        <div
          data-testid="hcx-split-secondary"
          style={{
            width: secondaryWidth,
            flexShrink: 0,
            background: "var(--hcx-color-bg-raised)",
            border: "1px solid var(--hcx-color-border-subtle)",
            borderRadius: "var(--hcx-radius-lg)",
            padding: "var(--hcx-space-4)",
          }}
        >
          {secondary}
        </div>
      ) : null}
    </div>
  );
}
