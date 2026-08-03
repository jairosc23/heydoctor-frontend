"use client";

import { ClinicalCard } from "@/components/clinical/design";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  getCopilotInsightIcon,
  type CopilotInsight,
} from "@/lib/clinical-copilot-intelligence";

function InsightCard({ insight }: { insight: CopilotInsight }) {
  return (
    <ClinicalCard className="border-l-[3px] border-l-primary/40">
      <div className="flex items-start gap-hd-2">
        <span className="text-base" aria-hidden>
          {getCopilotInsightIcon(insight.kind)}
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
            Clinical Insight™
          </p>
          <p className="text-sm font-medium text-slate-900">{insight.title}</p>
          <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
            {insight.body}
          </p>
        </div>
      </div>
    </ClinicalCard>
  );
}

export function CopilotInsightCards({ insights }: { insights: CopilotInsight[] }) {
  return (
    <section aria-label="Clinical Insights" className="space-y-hd-2">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Clinical Insights™</h3>
        <p className="text-[11px] text-slate-500">
          Observaciones contextuales — sin diagnósticos automáticos
        </p>
      </div>
      {insights.length === 0 ? (
        <p className="text-[11px] text-slate-500">
          Sin observaciones contextuales adicionales.
        </p>
      ) : (
        <div className="space-y-hd-2">
          {insights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}
    </section>
  );
}
