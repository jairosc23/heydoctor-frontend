"use client";

import { useState } from "react";
import {
  HcxApplicationShell,
  HcxEmptyShell,
  HcxLoadingShell,
  HcxPanelLayout,
  HcxSkeletonShell,
  HcxSplitView,
  HcxWorkspaceShellGate,
} from "@/components/hcx/workspace";
import { HcxBadge } from "@/components/hcx/foundation";
import { HcxText } from "@/components/hcx/primitive";
import { isHcxWorkspaceShellEnabled } from "@/lib/hcx/flags";

/**
 * HCX Phase 13 — Workspace Shell showcase.
 * Structural only: no clinical, HAB, AI, or emission UI.
 */
export default function HcxWorkspaceShellShowcasePage() {
  const [active, setActive] = useState("home");
  const enabled = isHcxWorkspaceShellEnabled();

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="hcx-workspace-shell-disabled">
          HCX Workspace Shell (`hcx.workspace_shell`) desactivado. Define{" "}
          <code>NEXT_PUBLIC_HCX_WORKSPACE_SHELL=true</code>.
        </p>
      </main>
    );
  }

  const navItems = [
    {
      id: "home",
      label: "Inicio",
      active: active === "home",
      onSelect: () => setActive("home"),
    },
    {
      id: "settings",
      label: "Ajustes",
      active: active === "settings",
      onSelect: () => setActive("settings"),
    },
  ];

  return (
    <HcxWorkspaceShellGate enabled>
      <HcxApplicationShell
        title="HeyDoctor · Shell"
        navItems={navItems}
        headerTrailing={<HcxBadge tone="brand">hcx.workspace_shell</HcxBadge>}
      >
        <HcxSplitView
          primary={
            <HcxPanelLayout title="Contenedor de trabajo">
              <HcxText variant="bodySm" tone="secondary">
                Phase 13 — marco estructural. Sin consultas, documentación, HAB ni
                emisión.
              </HcxText>
              {active === "home" ? <HcxEmptyShell /> : <HcxSkeletonShell rows={4} />}
            </HcxPanelLayout>
          }
          secondary={
            <HcxPanelLayout title="Panel secundario">
              <HcxLoadingShell label="Estado de carga (shell)" />
            </HcxPanelLayout>
          }
        />
      </HcxApplicationShell>
    </HcxWorkspaceShellGate>
  );
}
