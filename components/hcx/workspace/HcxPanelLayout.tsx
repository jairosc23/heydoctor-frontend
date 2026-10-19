import type { ReactNode } from "react";
import { HcxText } from "../primitive/HcxText";

export type HcxPanelLayoutProps = {
  title?: string;
  children?: ReactNode;
  actions?: ReactNode;
};

/** Raised panel chrome inside workspace. */
export function HcxPanelLayout({ title, children, actions }: HcxPanelLayoutProps) {
  return (
    <section
      data-testid="hcx-panel-layout"
      style={{
        background: "var(--hcx-color-bg-raised)",
        border: "1px solid var(--hcx-color-border-subtle)",
        borderRadius: "var(--hcx-radius-lg)",
        boxShadow: "var(--hcx-elevation-1)",
        padding: "var(--hcx-space-4)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--hcx-space-3)",
      }}
    >
      {(title || actions) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--hcx-space-3)",
          }}
        >
          {title ? (
            <HcxText as="h2" variant="section" weight="semibold">
              {title}
            </HcxText>
          ) : (
            <span />
          )}
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}
