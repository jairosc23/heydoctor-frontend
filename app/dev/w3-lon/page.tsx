"use client";

import { useState } from "react";
import { W3LonInsightPanel } from "@/components/hcx/intelligence/lon";
import { isW3LonInsightsEnabled } from "@/lib/w3/flags";

export default function W3LonDevPage() {
  const enabled = isW3LonInsightsEnabled();
  const [message, setMessage] = useState<string | null>(null);
  const [insights, setInsights] = useState([
    {
      insightId: "i1",
      kind: "trend",
      title: "High-salience clustering (demo)",
      summary:
        "Observational trend demo. Not a diagnosis. Does not authorize treatment.",
      salienceScore: 0.7,
      status: "published",
      isDiagnosis: false as const,
    },
    {
      insightId: "i2",
      kind: "pattern",
      title: "Open episode continuity (demo)",
      summary: "Observational pattern demo.",
      salienceScore: 0.55,
      status: "published",
      isDiagnosis: false as const,
    },
  ]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-lon-disabled">
          Define <code>NEXT_PUBLIC_W3_LON_INSIGHTS=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 720 }}>
      <W3LonInsightPanel
        enabled
        insights={insights}
        message={message}
        onPublish={() => {
          setMessage(
            "Insights published (advisory). COS state unchanged. No Ready/Confirm/Emit.",
          );
        }}
        onDismiss={(id) => {
          setInsights((prev) =>
            prev.map((i) =>
              i.insightId === id ? { ...i, status: "dismissed" } : i,
            ),
          );
          setMessage("Insight dismissed (advisory lifecycle).");
        }}
      />
    </main>
  );
}
