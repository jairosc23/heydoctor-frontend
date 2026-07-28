import type { ReactNode } from "react";
import { HcxText } from "../primitive/HcxText";

export type HcxNavItem = {
  id: string;
  label: string;
  active?: boolean;
  onSelect?: () => void;
};

export type HcxSidebarProps = {
  items?: HcxNavItem[];
  footer?: ReactNode;
  collapsed?: boolean;
};

/**
 * Sidebar navigation frame — structural labels only.
 * Items must not encode clinical workflows in Phase 13 demos.
 */
export function HcxSidebar({
  items = [],
  footer,
  collapsed = false,
}: HcxSidebarProps) {
  return (
    <aside
      role="navigation"
      aria-label="Navegación principal"
      data-testid="hcx-sidebar"
      data-collapsed={collapsed ? "true" : "false"}
      style={{
        width: collapsed ? 64 : 240,
        flexShrink: 0,
        background: "var(--hcx-color-bg-chrome)",
        borderRight: "1px solid var(--hcx-color-border-subtle)",
        display: "flex",
        flexDirection: "column",
        padding: "var(--hcx-space-3)",
        gap: "var(--hcx-space-1)",
        transition: `width var(--hcx-motion-duration-base) var(--hcx-motion-easing-spatial)`,
      }}
    >
      <ul style={{ listStyle: "none", margin: 0, padding: 0, flex: 1 }}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className="hcx-focus-ring"
              aria-current={item.active ? "page" : undefined}
              onClick={item.onSelect}
              data-testid={`hcx-nav-${item.id}`}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "var(--hcx-space-3)",
                borderRadius: "var(--hcx-radius-md)",
                border: "none",
                cursor: "pointer",
                background: item.active
                  ? "var(--hcx-color-bg-brand-soft)"
                  : "transparent",
                color: item.active
                  ? "var(--hcx-color-brand-600)"
                  : "var(--hcx-color-text-secondary)",
                fontFamily: "var(--hcx-font-family-ui)",
                fontSize: "var(--hcx-font-size-body-sm)",
                fontWeight: item.active
                  ? "var(--hcx-font-weight-semibold)"
                  : "var(--hcx-font-weight-regular)",
              }}
            >
              {collapsed ? item.label.slice(0, 1) : item.label}
            </button>
          </li>
        ))}
      </ul>
      {footer ? (
        <div style={{ paddingTop: "var(--hcx-space-3)" }}>
          {typeof footer === "string" ? (
            <HcxText variant="meta" tone="muted">
              {footer}
            </HcxText>
          ) : (
            footer
          )}
        </div>
      ) : null}
    </aside>
  );
}
