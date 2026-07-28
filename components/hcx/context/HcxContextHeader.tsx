import { HcxText } from "../primitive/HcxText";
import { HcxBadge } from "../foundation/HcxBadge";

export type HcxContextHeaderProps = {
  /** Structural title only — not clinical patient identity from COS. */
  workspaceTitle?: string;
  environment?: "development" | "staging" | "production";
  sessionLabel?: string;
};

/**
 * Context header chrome — placeholders only.
 * Must not bind real clinical context / patient PHI in Phase 14.
 */
export function HcxContextHeader({
  workspaceTitle = "Espacio de trabajo",
  environment = "development",
  sessionLabel = "Sesión local",
}: HcxContextHeaderProps) {
  const envTone =
    environment === "production"
      ? "critical"
      : environment === "staging"
        ? "warning"
        : "brand";

  return (
    <div
      data-testid="hcx-context-header"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--hcx-space-3)",
        padding: "var(--hcx-space-3) var(--hcx-space-4)",
        background: "var(--hcx-color-bg-raised)",
        borderBottom: "1px solid var(--hcx-color-border-subtle)",
      }}
    >
      <HcxText as="h2" variant="section" weight="semibold" style={{ flex: 1 }}>
        {workspaceTitle}
      </HcxText>
      <span data-testid="hcx-environment-badge">
        <HcxBadge tone={envTone}>{environment}</HcxBadge>
      </span>
      <span data-testid="hcx-session-indicator">
        <HcxText variant="meta" tone="muted">
          {sessionLabel}
        </HcxText>
      </span>
    </div>
  );
}
