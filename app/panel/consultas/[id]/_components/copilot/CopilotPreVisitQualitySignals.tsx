"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  labelQualitySignalStatus,
  type PreVisitQualitySignalsView,
  type QualitySignalStatus,
} from "@/lib/epic3/pre-visit-quality-signals";
import { cn } from "@/lib/utils";

function statusTone(status: QualitySignalStatus): string {
  switch (status) {
    case "present":
      return "border-emerald-200 bg-emerald-50/80 text-emerald-800";
    case "missing":
      return "border-amber-200 bg-amber-50/80 text-amber-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

export function CopilotPreVisitQualitySignals({
  view,
}: {
  view: PreVisitQualitySignalsView;
}) {
  return (
    <section
      aria-label="Pre-Visit Quality Signals"
      data-testid="copilot-pre-visit-quality-signals"
      className="space-y-hd-3"
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          EPIC-3 · Prep · Determinístico
        </p>
        <h3 className={CLINICAL_SECTION_TITLE}>{view.title}</h3>
        <p className="text-[11px] text-slate-500">
          Solo observación de datos ya cargados · sin IA · sin recomendaciones
        </p>
      </div>

      <ul className="space-y-hd-2">
        {view.signals.map((signal) => (
          <li
            key={signal.id}
            data-testid={`quality-signal-${signal.id}`}
            data-status={signal.status}
            className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised px-hd-3 py-hd-2"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-slate-800">{signal.label}</p>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  statusTone(signal.status),
                )}
              >
                {labelQualitySignalStatus(signal.status)}
              </span>
            </div>
            <p className="mt-1 text-[11px] leading-snug text-slate-500">
              {signal.observation}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
