"use client";

import { useState } from "react";
import { W3CdsPanel } from "@/components/hcx/intelligence/cds";
import { isW3CdsEnabled } from "@/lib/w3/flags";

/**
 * WP-03 CDS showcase — no Confirm/Emit/Place order.
 */
export default function W3CdsDevPage() {
  const enabled = isW3CdsEnabled();
  const [acked, setAcked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [recs, setRecs] = useState([
    {
      recommendationId: "d1",
      ruleId: "stub.guideline.htn_followup",
      severity: "info" as const,
      title: "Guideline hint",
      detail: "Advisory demo",
      status: "proposed",
    },
    {
      recommendationId: "d2",
      ruleId: "stub.lab.consider_baseline",
      severity: "critical" as const,
      title: "Safety hint",
      detail: "Critical = label only",
      status: "proposed",
    },
  ]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-cds-disabled">
          Define <code>NEXT_PUBLIC_W3_CDS=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <W3CdsPanel
        enabled
        recommendations={recs}
        conflicts={[
          {
            conflictId: "c1",
            summary: "Multiple recommendations — review all; no auto-merge.",
          },
        ]}
        conflictsAcknowledged={acked}
        onAcknowledgeConflicts={() => setAcked(true)}
        message={message}
        onDismiss={(id) => {
          setRecs((prev) =>
            prev.map((r) =>
              r.recommendationId === id ? { ...r, status: "dismissed" } : r,
            ),
          );
          setMessage("Recommendation dismissed (advisory).");
        }}
        onApply={(id) => {
          setRecs((prev) =>
            prev.map((r) =>
              r.recommendationId === id ? { ...r, status: "applied" } : r,
            ),
          );
          setMessage(
            "Inserted into draft. Ready/Confirm remain on COS surfaces.",
          );
        }}
      />
    </main>
  );
}
