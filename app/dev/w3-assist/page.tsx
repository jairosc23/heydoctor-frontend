"use client";

import { useMemo, useState } from "react";
import { W3AssistDock } from "@/components/hcx/intelligence/assist";
import { isW3AssistEnabled } from "@/lib/w3/flags";
import type { W3ProposalCardModel } from "@/components/hcx/intelligence/assist/W3ProposalCard";

const DEMO: W3ProposalCardModel[] = [
  {
    proposalId: "demo-1",
    kind: "note_fragment",
    status: "active",
    summary: "Fragmento de nota demo (advisory).",
  },
  {
    proposalId: "demo-2",
    kind: "plan_item",
    status: "active",
    summary: "Ítem de plan demo (advisory).",
  },
];

/**
 * WP-02 Assist showcase — no Confirm/Emit CTAs.
 */
export default function W3AssistDevPage() {
  const enabled = isW3AssistEnabled();
  const [proposals, setProposals] = useState(DEMO);
  const [message, setMessage] = useState<string | null>(null);

  const dock = useMemo(
    () => (
      <W3AssistDock
        enabled={enabled}
        proposals={proposals}
        message={message}
        onDispose={(id) => {
          setProposals((prev) =>
            prev.map((p) =>
              p.proposalId === id ? { ...p, status: "disposed" } : p,
            ),
          );
          setMessage("Dispose provisional registrado (≠ Confirm).");
        }}
        onDismiss={(id) => {
          setProposals((prev) =>
            prev.map((p) =>
              p.proposalId === id ? { ...p, status: "dismissed" } : p,
            ),
          );
          setMessage("Propuesta descartada.");
        }}
        onApply={(id) => {
          setProposals((prev) =>
            prev.map((p) =>
              p.proposalId === id ? { ...p, status: "applied" } : p,
            ),
          );
          setMessage(
            "Insertado en draft. Ready/Confirm siguen en superficies COS.",
          );
        }}
      />
    ),
    [enabled, proposals, message],
  );

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-assist-disabled">
          Define <code>NEXT_PUBLIC_W3_ASSIST=true</code> para el harness Assist.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      {dock}
    </main>
  );
}
