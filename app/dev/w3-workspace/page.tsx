"use client";

import {
  HcxApplicationShell,
  HcxWorkspaceShellGate,
} from "@/components/hcx/workspace";
import { HcxBadge } from "@/components/hcx/foundation";
import { HcxText } from "@/components/hcx/primitive";
import {
  W3DenseMountLayout,
  W3WorkspaceMaturityGate,
} from "@/components/hcx/intelligence/workspace";
import { isW3WorkspaceEnabled } from "@/lib/w3/flags";
import type { W3MountCapability } from "@/lib/w3/types";

const DEMO_MOUNTS: W3MountCapability[] = [
  {
    kind: "orientation",
    visible: true,
    densityHint: "compact",
    slotLabel: "Orientation",
  },
  {
    kind: "clinical_work",
    visible: true,
    densityHint: "compact",
    slotLabel: "Clinical work",
  },
  {
    kind: "assist",
    visible: true,
    densityHint: "compact",
    slotLabel: "Assist (advisory)",
  },
  {
    kind: "confirmation",
    visible: true,
    densityHint: "compact",
    slotLabel: "Confirmation host slot",
  },
];

/**
 * WP-01 — Workspace maturity showcase.
 * No clinical Confirm/Emit/Dispose CTAs.
 */
export default function W3WorkspaceDevPage() {
  const enabled = isW3WorkspaceEnabled();

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-workspace-disabled">
          Wave-3 Workspace (`w3.workspace`) desactivado. Define{" "}
          <code>NEXT_PUBLIC_W3_WORKSPACE=true</code>.
        </p>
      </main>
    );
  }

  return (
    <W3WorkspaceMaturityGate enabled>
      <HcxWorkspaceShellGate enabled>
        <HcxApplicationShell
          title="HeyDoctor · W3 Workspace"
          navItems={[{ id: "w3", label: "W3", active: true }]}
          headerTrailing={<HcxBadge tone="brand">w3.workspace</HcxBadge>}
        >
          <HcxText>
            Madurez de workspace (WP-01). Advisory chrome only — isAuthority
            false.
          </HcxText>
          <W3DenseMountLayout
            mounts={DEMO_MOUNTS}
            maturityEnabled
            connectivityState="degraded"
            unboundVisible
          />
        </HcxApplicationShell>
      </HcxWorkspaceShellGate>
    </W3WorkspaceMaturityGate>
  );
}
