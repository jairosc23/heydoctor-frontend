"use client";

import { ClinicalCard } from "@/components/clinical/design";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  getCopilotInsightIcon,
  MOCK_COPILOT_INSIGHTS,
  type CopilotInsight,
} from "@/lib/clinical-copilot-mock";

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
          <p className="mt-1 text-[9px] font-medium uppercase tracking-wide text-slate-400">
            Datos simulados — sin IA
          </p>
        </div>
      </div>
    </ClinicalCard>
  );
}

export function CopilotInsightCards() {
  return (
    <section aria-label="Clinical Insight Cards" className="space-y-hd-2">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Clinical Insight Cards™</h3>
        <p className="text-[11px] text-slate-500">
          Vista previa de insights — contenido mock
        </p>
      </div>
      <div className="space-y-hd-2">
        {MOCK_COPILOT_INSIGHTS.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </section>
  );
}
