import type { ReactNode } from "react";

export type HcxBannerTone = "info" | "warning" | "critical" | "success";

export type HcxBannerProps = {
  title: string;
  children?: ReactNode;
  tone?: HcxBannerTone;
  /** Live region politeness — critical defaults assertive. */
  live?: "polite" | "assertive" | "off";
};

const toneBorder: Record<HcxBannerTone, string> = {
  info: "var(--hcx-color-status-info)",
  warning: "var(--hcx-color-status-warning)",
  critical: "var(--hcx-color-status-critical)",
  success: "var(--hcx-color-status-success)",
};

const toneBg: Record<HcxBannerTone, string> = {
  info: "var(--hcx-color-info-100)",
  warning: "var(--hcx-color-bg-warning-soft)",
  critical: "var(--hcx-color-bg-critical-soft)",
  success: "var(--hcx-color-success-100)",
};

/**
 * Foundation Banner — generic severity shell.
 * Not Clinical Context / Offline / HAB banners (those are Clinical layer).
 */
export function HcxBanner({
  title,
  children,
  tone = "info",
  live,
}: HcxBannerProps) {
  const politeness =
    live ?? (tone === "critical" || tone === "warning" ? "assertive" : "polite");

  return (
    <div
      role="status"
      aria-live={politeness === "off" ? undefined : politeness}
      data-testid="hcx-banner"
      data-tone={tone}
      style={{
        background: toneBg[tone],
        borderLeft: `4px solid ${toneBorder[tone]}`,
        borderRadius: "var(--hcx-radius-md)",
        padding: "var(--hcx-space-4)",
        fontFamily: "var(--hcx-font-family-ui)",
      }}
    >
      <div
        style={{
          fontWeight: "var(--hcx-font-weight-semibold)",
          color: "var(--hcx-color-text-primary)",
          marginBottom: children ? "var(--hcx-space-2)" : 0,
        }}
      >
        {title}
      </div>
      {children ? (
        <div style={{ color: "var(--hcx-color-text-secondary)", fontSize: "var(--hcx-font-size-body-sm)" }}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
