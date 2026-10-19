"use client";

import { W3AnalyticsWorkspace } from "@/components/hcx/intelligence/analytics";
import { isW3AnalyticsEnabled } from "@/lib/w3/flags";

export default function W3AnalyticsDevPage() {
  const enabled = isW3AnalyticsEnabled();

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-analytics-disabled">
          Define <code>NEXT_PUBLIC_W3_ANALYTICS=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <W3AnalyticsWorkspace
        enabled
        window="30d"
        message="Demo dashboard — read-only / advisory. No Confirm / Emit / Order."
        kpis={[
          {
            kpiId: "k1",
            code: "consult_volume",
            label: "Consultation volume",
            value: 100,
            unit: "count",
            advisory: true,
          },
          {
            kpiId: "k2",
            code: "doc_completion_rate",
            label: "Documentation completion rate",
            value: 0.8,
            unit: "ratio",
            advisory: true,
          },
        ]}
        operational={[
          {
            metricId: "o1",
            code: "docs_in_draft",
            label: "Documentation drafts open",
            value: 12,
            advisory: true,
          },
        ]}
        quality={[
          {
            indicatorId: "q1",
            code: "qi_doc_completion",
            label: "Documentation completion (quality)",
            value: 0.8,
            status: "above",
            advisory: true,
          },
        ]}
        trends={[
          {
            trendId: "t1",
            code: "trend_consults",
            label: "Consultation trend",
            direction: "up",
            delta: 8,
            advisory: true,
          },
        ]}
      />
    </main>
  );
}
