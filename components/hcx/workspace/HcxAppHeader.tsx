import type { ReactNode } from "react";
import { HcxText } from "../primitive/HcxText";
import { HcxIcon } from "../foundation/HcxIcon";
import { HcxPressable } from "../primitive/HcxPressable";

export type HcxAppHeaderProps = {
  title?: string;
  trailing?: ReactNode;
  onMenuClick?: () => void;
  showMenuButton?: boolean;
};

/**
 * Application header — brand + title chrome.
 * No consultation / HAB / clinical actions.
 */
export function HcxAppHeader({
  title = "HeyDoctor",
  trailing,
  onMenuClick,
  showMenuButton = true,
}: HcxAppHeaderProps) {
  return (
    <header
      role="banner"
      data-testid="hcx-app-header"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--hcx-space-3)",
        padding: "var(--hcx-space-3) var(--hcx-space-4)",
        background: "var(--hcx-color-bg-chrome)",
        borderBottom: "1px solid var(--hcx-color-border-subtle)",
        minHeight: 56,
      }}
    >
      {showMenuButton ? (
        <HcxPressable
          aria-label="Abrir navegación"
          data-testid="hcx-header-menu"
          onClick={onMenuClick}
          style={{
            background: "transparent",
            border: "none",
            padding: "var(--hcx-space-2)",
            color: "var(--hcx-color-text-primary)",
            cursor: "pointer",
          }}
        >
          <HcxIcon name="menu" size={24} />
        </HcxPressable>
      ) : null}
      <div
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: "var(--hcx-color-brand-500)",
          flexShrink: 0,
        }}
      />
      <HcxText as="h1" variant="section" weight="semibold" style={{ flex: 1 }}>
        {title}
      </HcxText>
      {trailing}
    </header>
  );
}
