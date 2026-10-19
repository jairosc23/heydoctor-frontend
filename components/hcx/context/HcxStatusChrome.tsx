import { HcxText } from "../primitive/HcxText";
import { HcxBadge } from "../foundation/HcxBadge";

export type HcxSyncStatus = "idle" | "syncing" | "synced" | "error";

export type HcxSyncStatusProps = {
  status: HcxSyncStatus;
  label?: string;
};

const statusCopy: Record<HcxSyncStatus, string> = {
  idle: "En reposo",
  syncing: "Sincronizando",
  synced: "Sincronizado",
  error: "Error de sync",
};

export function HcxSyncStatusIndicator({
  status,
  label,
}: HcxSyncStatusProps) {
  const tone =
    status === "error"
      ? "critical"
      : status === "syncing"
        ? "info"
        : status === "synced"
          ? "success"
          : "neutral";

  return (
    <div
      data-testid="hcx-sync-status"
      data-status={status}
      style={{ display: "inline-flex", alignItems: "center", gap: "var(--hcx-space-2)" }}
    >
      <HcxBadge tone={tone}>{label ?? statusCopy[status]}</HcxBadge>
    </div>
  );
}

export type HcxWorkspaceStatusBarProps = {
  syncStatus?: HcxSyncStatus;
  environment?: string;
  extra?: string;
};

/** Bottom/status bar chrome — non-clinical. */
export function HcxWorkspaceStatusBar({
  syncStatus = "idle",
  environment = "development",
  extra,
}: HcxWorkspaceStatusBarProps) {
  return (
    <footer
      role="contentinfo"
      data-testid="hcx-workspace-status-bar"
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: "var(--hcx-space-3)",
        padding: "var(--hcx-space-2) var(--hcx-space-4)",
        borderTop: "1px solid var(--hcx-color-border-subtle)",
        background: "var(--hcx-color-bg-chrome)",
        fontSize: "var(--hcx-font-size-meta)",
      }}
    >
      <HcxSyncStatusIndicator status={syncStatus} />
      <HcxBadge tone="neutral">{environment}</HcxBadge>
      {extra ? (
        <HcxText variant="meta" tone="muted">
          {extra}
        </HcxText>
      ) : null}
    </footer>
  );
}
