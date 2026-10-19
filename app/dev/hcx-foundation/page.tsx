"use client";

import { useState } from "react";
import {
  HcxBadge,
  HcxBanner,
  HcxButton,
  HcxFoundationGate,
  HcxIcon,
  HcxInput,
  HcxLiveRegion,
  HcxModalShell,
} from "@/components/hcx/foundation";
import { HcxBox, HcxDivider, HcxSpacer, HcxText } from "@/components/hcx/primitive";
import { isHcxFoundationEnabled } from "@/lib/hcx/flags";

/**
 * HCX Phase 12 — Foundation showcase only.
 * No clinical workflows, HAB, AI, or emission.
 * Gated by NEXT_PUBLIC_HCX_FOUNDATION / hcx.foundation.
 */
export default function HcxFoundationShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const enabled = isHcxFoundationEnabled();

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="hcx-foundation-disabled">
          HCX Foundation (`hcx.foundation`) está desactivado. Define{" "}
          <code>NEXT_PUBLIC_HCX_FOUNDATION=true</code> para previsualizar.
        </p>
      </main>
    );
  }

  return (
    <HcxFoundationGate enabled>
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "var(--hcx-space-6)" }}>
        <HcxText as="h1" variant="title" weight="semibold">
          HCX Foundation
        </HcxText>
        <HcxText tone="secondary" variant="bodySm">
          Phase 12 — Primitive + Foundation only. Sin flujos clínicos, HAB ni emisión.
        </HcxText>
        <HcxSpacer size={4} />
        <HcxBanner title="Tokens activos" tone="info">
          Brand spine #078A92. Flag: hcx.foundation.
        </HcxBanner>
        <HcxSpacer size={4} />
        <HcxBox display="flex" direction="row" gap={3} className="hcx-stack hcx-stack-md-row">
          <HcxButton data-testid="hcx-demo-primary">Primario</HcxButton>
          <HcxButton variant="secondary">Secundario</HcxButton>
          <HcxButton variant="ghost">Ghost</HcxButton>
          <HcxBadge tone="brand">Brand</HcxBadge>
          <HcxIcon name="info" title="Información" />
        </HcxBox>
        <HcxDivider />
        <HcxInput label="Campo de ejemplo" hint="Sin semántica clínica" />
        <HcxSpacer size={4} />
        <HcxButton variant="secondary" onClick={() => setModalOpen(true)}>
          Abrir modal shell
        </HcxButton>
        <HcxModalShell
          open={modalOpen}
          title="Modal foundation"
          onClose={() => setModalOpen(false)}
        >
          <HcxText variant="bodySm" tone="secondary">
            Shell genérico — no es ConfirmationMount.
          </HcxText>
        </HcxModalShell>
        <HcxSpacer size={4} />
        <HcxLiveRegion>
          <HcxText variant="meta" tone="muted">
            Live region foundation lista.
          </HcxText>
        </HcxLiveRegion>
      </main>
    </HcxFoundationGate>
  );
}
