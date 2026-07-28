import type { CSSProperties, ReactNode } from "react";
import { HcxPressable } from "../primitive/HcxPressable";

export type HcxButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type HcxButtonSize = "sm" | "md" | "lg";

export type HcxButtonProps = {
  children?: ReactNode;
  variant?: HcxButtonVariant;
  size?: HcxButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  "aria-label"?: string;
  "data-testid"?: string;
};

const sizeStyles: Record<HcxButtonSize, CSSProperties> = {
  sm: {
    padding: "var(--hcx-space-2) var(--hcx-space-3)",
    fontSize: "var(--hcx-font-size-body-sm)",
  },
  md: {
    padding: "var(--hcx-space-3) var(--hcx-space-4)",
    fontSize: "var(--hcx-font-size-body)",
  },
  lg: {
    padding: "var(--hcx-space-4) var(--hcx-space-6)",
    fontSize: "var(--hcx-font-size-body)",
  },
};

function variantStyles(variant: HcxButtonVariant): CSSProperties {
  switch (variant) {
    case "primary":
      return {
        background: "var(--hcx-color-action-primary)",
        color: "var(--hcx-color-text-on-brand)",
        border: "1px solid transparent",
      };
    case "secondary":
      return {
        background: "var(--hcx-color-bg-raised)",
        color: "var(--hcx-color-text-primary)",
        border: "1px solid var(--hcx-color-action-secondary-border)",
      };
    case "ghost":
      return {
        background: "transparent",
        color: "var(--hcx-color-text-secondary)",
        border: "1px solid transparent",
      };
    case "destructive":
      return {
        background: "var(--hcx-color-action-destructive)",
        color: "var(--hcx-color-text-on-brand)",
        border: "1px solid transparent",
      };
  }
}

/**
 * Foundation Button — generic CTA chrome.
 * Must not encode HAB Confirm / Emit / clinical verbs.
 */
export function HcxButton({
  children,
  variant = "primary",
  size = "md",
  disabled,
  type = "button",
  onClick,
  "aria-label": ariaLabel,
  "data-testid": testId = "hcx-button",
}: HcxButtonProps) {
  return (
    <HcxPressable
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={testId}
      style={{
        ...sizeStyles[size],
        ...variantStyles(variant),
        borderRadius: "var(--hcx-radius-md)",
        fontFamily: "var(--hcx-font-family-ui)",
        fontWeight: "var(--hcx-font-weight-semibold)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: `background var(--hcx-motion-duration-fast) var(--hcx-motion-easing-standard),
          border-color var(--hcx-motion-duration-fast) var(--hcx-motion-easing-standard),
          opacity var(--hcx-motion-duration-fast) var(--hcx-motion-easing-standard)`,
      }}
    >
      {children}
    </HcxPressable>
  );
}
