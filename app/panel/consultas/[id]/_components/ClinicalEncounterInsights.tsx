"use client";

import type { ClinicalEncounterSignal } from "./clinical-encounter-intelligence-model";

export function ClinicalEncounterInsights({
  insights,
}: {
  insights: ClinicalEncounterSignal[];
}) {
  if (insights.length === 0) return null;

  return (
    <div
      className="grid gap-2 md:grid-cols-2"
      data-testid="clinical-encounter-insights"
    >
      {insights.map((insight) => (
        <article
          key={insight.id}
          className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-3 py-2 text-xs text-slate-700"
          data-signal-kind={insight.kind}
        >
          <p className="font-semibold text-slate-900">{insight.title}</p>
          <p className="mt-1 line-clamp-2 leading-snug">{insight.detail}</p>
        </article>
      ))}
    </div>
  );
}
