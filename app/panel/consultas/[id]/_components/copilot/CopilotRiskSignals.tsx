"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  COPILOT_RISK_EMPTY_MESSAGE,
  COPILOT_SILENCE_MESSAGE,
  getRiskLevelStyles,
  type ClinicalRiskSignal,
} from "@/lib/clinical-copilot-intelligence";

export function CopilotRiskSignals({ signals }: { signals: ClinicalRiskSignal[] }) {
  return (
    <section aria-label="Clinical Risk Signals" className="space-y-hd-2">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Clinical Risk Signals™</h3>
        <p className="text-[11px] text-slate-500">
          Reglas determinísticas — no IA
        </p>
      </div>
      {signals.length === 0 ? (
        <div
          role="status"
          data-ui-state="empty"
          className="rounded-hd-md border border-dashed border-slate-200 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-500"
        >
          <p className="font-medium text-slate-700">Sin señales de riesgo</p>
          <p className="mt-1 leading-relaxed">{COPILOT_RISK_EMPTY_MESSAGE}</p>
        </div>
      ) : (
        <ul className="space-y-hd-2" data-ui-state="ready">
          {signals.map((signal) => {
          const styles = getRiskLevelStyles(signal.level);
          return (
            <li
              key={signal.id}
              className={`rounded-hd-md border px-hd-3 py-hd-2 ${styles.border} ${styles.bg}`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className={`text-sm font-medium ${styles.text}`}>
                  {signal.title}
                </p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${styles.badge}`}
                >
                  {signal.level}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-600">
                {signal.body}
              </p>
            </li>
          );
        })}
        </ul>
      )}
    </section>
  );
}
