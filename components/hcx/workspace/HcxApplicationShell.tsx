"use client";

import { useEffect, useState, type ReactNode } from "react";
import { HcxAppHeader } from "./HcxAppHeader";
import { HcxSidebar, type HcxNavItem } from "./HcxSidebar";
import { HcxWorkspaceContainer } from "./HcxWorkspaceContainer";

export type HcxApplicationShellProps = {
  title?: string;
  navItems?: HcxNavItem[];
  children?: ReactNode;
  headerTrailing?: ReactNode;
};

/**
 * Application Shell — responsive structural frame.
 * Composes Header + Sidebar + Workspace Container.
 * No clinical / HAB / AI / emission content.
 */
export function HcxApplicationShell({
  title = "HeyDoctor",
  navItems = [],
  children,
  headerTrailing,
}: HcxApplicationShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isNarrow, setIsNarrow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }
    const mq = window.matchMedia("(max-width: 767px)");
    const apply = () => {
      setIsNarrow(mq.matches);
      if (mq.matches) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  return (
    <div
      data-testid="hcx-application-shell"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: "var(--hcx-color-bg-canvas)",
      }}
    >
      <a
        href="#hcx-workspace-main"
        className="hcx-visually-hidden hcx-focus-ring"
        style={{
          position: "absolute",
          left: 8,
          top: 8,
          zIndex: 100,
          background: "var(--hcx-color-bg-raised)",
          padding: "var(--hcx-space-2)",
        }}
      >
        Saltar al contenido
      </a>
      <HcxAppHeader
        title={title}
        trailing={headerTrailing}
        showMenuButton={isNarrow}
        onMenuClick={() => setSidebarOpen((v) => !v)}
      />
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>
        {(sidebarOpen || !isNarrow) && (
          <HcxSidebar
            items={navItems}
            collapsed={false}
            footer={isNarrow ? undefined : "Shell · sin flujos clínicos"}
          />
        )}
        <HcxWorkspaceContainer>{children}</HcxWorkspaceContainer>
      </div>
    </div>
  );
}
