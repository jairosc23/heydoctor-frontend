"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  labelDocQualityStatus,
  type DocQualityStatus,
  type LiveDocumentationQualityView,
} from "@/lib/epic3/live-documentation-quality";
import { cn } from "@/lib/utils";

function statusTone(status: DocQualityStatus): string {
  switch (status) {
    case "completed":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-800";
    case "pending":
      return "border-amber-200 bg-amber-50/80 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function CopilotLiveDocumentationQuality({
  view,
}: {
  view: LiveDocumentationQualityView;
}) {
  return (
    <section
      aria-label="Clinical Documentation Quality Assistant"
      data-testid="copilot-live-documentation-quality"
      className="space-y-hd-3"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          EPIC-3 · Live · Determinístico
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>{view.title}</h3>
        <p className="text-[11px] text-slate-500">
          Indicadores de documentación · sin IA · sin recomendaciones clínicas
        </p>
      </div>

      <ul className="space-y-hd-2">
        {view.indicators.map((indicator) => (
          <li
            key={indicator.id}
            data-testid={`doc-quality-${indicator.id}`}
            data-status={indicator.status}
            className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-3 py-hd-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-slate-800">
                {indicator.label}
              </p>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  statusTone(indicator.status),
                )}
              >
                {labelDocQualityStatus(indicator.status)}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              {indicator.observation}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
