"use client";

import { useState } from "react";
import { W3PopWorkspace } from "@/components/hcx/intelligence/pop";
import { isW3PopEnabled } from "@/lib/w3/flags";

export default function W3PopDevPage() {
  const enabled = isW3PopEnabled();
  const [message, setMessage] = useState<string | null>(null);
  const [cohorts, setCohorts] = useState([
    {
      cohortId: "c1",
      label: "Elderly chronic (demo)",
      memberPatientIds: [] as string[],
      members: [] as Array<{
        patientId: string;
        riskScore: number;
        riskBand: string;
        isAuthoritative: false;
      }>,
      insights: [] as Array<{
        insightId: string;
        kind: string;
        title: string;
        summary: string;
        advisory: true;
      }>,
    },
  ]);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="w3-pop-disabled">
          Define <code>NEXT_PUBLIC_W3_POP_SIGNALS=true</code>.
        </p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui", maxWidth: 800 }}>
      <W3PopWorkspace
        enabled
        cohorts={cohorts}
        message={message}
        onEvaluate={(id) => {
          setCohorts((prev) =>
            prev.map((c) =>
              c.cohortId === id
                ? {
                    ...c,
                    memberPatientIds: ["p-demo-1"],
                    members: [
                      {
                        patientId: "p-demo-1",
                        riskScore: 0.72,
                        riskBand: "high",
                        isAuthoritative: false,
                      },
                    ],
                    insights: [
                      {
                        insightId: "i1",
                        kind: "risk_distribution",
                        title: "Advisory risk distribution",
                        summary:
                          "Demo insight — non-authoritative. No orders placed.",
                        advisory: true,
                      },
                    ],
                  }
                : c,
            ),
          );
          setMessage(
            "Cohort evaluated (advisory). COS patient records unchanged. No Emit/Order.",
          );
        }}
      />
    </main>
  );
}
