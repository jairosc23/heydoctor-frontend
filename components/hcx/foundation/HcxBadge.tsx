import type { CSSProperties, ReactNode } from "react";

export type HcxBadgeTone = "neutral" | "brand" | "success" | "warning" | "critical" | "info";

export type HcxBadgeProps = {
  children?: ReactNode;
  tone?: HcxBadgeTone;
};

const toneStyle: Record<HcxBadgeTone, CSSProperties> = {
  neutral: {
    background: "var(--hcx-color-bg-muted)",
    color: "var(--hcx-color-text-secondary)",
  },
  brand: {
    background: "var(--hcx-color-bg-brand-soft)",
    color: "var(--hcx-color-brand-600)",
  },
  success: {
    background: "var(--hcx-color-success-100)",
    color: "var(--hcx-color-status-success)",
  },
  warning: {
    background: "var(--hcx-color-bg-warning-soft)",
    color: "var(--hcx-color-status-warning)",
  },
  critical: {
    background: "var(--hcx-color-bg-critical-soft)",
    color: "var(--hcx-color-status-critical)",
  },
  info: {
    background: "var(--hcx-color-info-100)",
    color: "var(--hcx-color-status-info)",
  },
};

/** Foundation Badge — status chrome only. */
export function HcxBadge({ children, tone = "neutral" }: HcxBadgeProps) {
  return (
    <span
      data-testid="hcx-badge"
      style={{
        ...toneStyle[tone],
        display: "inline-flex",
        alignItems: "center",
        padding: "2px var(--hcx-space-2)",
        borderRadius: "var(--hcx-radius-sm)",
        fontFamily: "var(--hcx-font-family-ui)",
        fontSize: "var(--hcx-font-size-meta)",
        fontWeight: "var(--hcx-font-weight-medium)",
        lineHeight: "var(--hcx-line-height-snug)",
      }}
    >
      {children}
    </span>
  );
}
