"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { DocumentationGap } from "@/lib/clinical-copilot-intelligence";

export function CopilotDocumentationGaps({ gaps }: { gaps: DocumentationGap[] }) {
  return (
    <section aria-label="Documentation Gaps" className="space-y-hd-2">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Documentation Gaps™</h3>
        <p className="text-[11px] text-slate-500">
          Oportunidades de completitud documental — informativo
        </p>
      </div>
      {gaps.length === 0 ? (
        <p className="rounded-hd-md border border-emerald-200/80 bg-emerald-50/40 px-hd-3 py-hd-2 text-[11px] text-emerald-900">
          No se detectaron gaps documentales relevantes con los datos actuales.
        </p>
      ) : (
        <ul className="space-y-1.5">
          {gaps.map((gap) => (
            <li
              key={gap.id}
              className="rounded-hd-md border border-slate-200/80 bg-slate-50/80 px-hd-3 py-hd-2"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                {gap.field}
              </p>
              <p className="text-xs text-slate-700">{gap.message}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
