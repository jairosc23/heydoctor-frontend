"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
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
      <ul className="space-y-hd-2">
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
    </section>
  );
}
