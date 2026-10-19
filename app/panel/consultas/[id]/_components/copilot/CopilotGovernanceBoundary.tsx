"use client";

import { COPILOT_GOVERNANCE_LINES } from "@/lib/clinical-copilot-mock";
import { MEDICAL_COPILOT_GOVERNANCE } from "@/lib/medical-copilot/types";

export function CopilotGovernanceBoundary() {
  return (
    <aside
      aria-label="Límites de asistencia clínica"
      className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted/80 px-hd-3 py-hd-3"
      data-testid="copilot-governance-boundary"
    >
      <p className="mb-hd-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Governance
      </p>
      <ul className="mb-hd-2 space-y-1 rounded-md border border-slate-200 bg-white/70 px-2 py-1.5 text-[11px] text-slate-700">
        <li data-testid="hitl-seal-review">
          requiresPhysicianReview:{" "}
          {String(MEDICAL_COPILOT_GOVERNANCE.requiresPhysicianReview)}
        </li>
        <li data-testid="hitl-seal-execute">
          executesAction: {String(MEDICAL_COPILOT_GOVERNANCE.executesAction)}
        </li>
        <li data-testid="hitl-seal-emr">
          autoPersistedToEmr:{" "}
          {String(MEDICAL_COPILOT_GOVERNANCE.autoPersistedToEmr)}
        </li>
      </ul>
      <ul className="space-y-1">
        {COPILOT_GOVERNANCE_LINES.map((line) => (
          <li
            key={line}
            className="flex items-start gap-hd-2 text-[11px] leading-snug text-slate-600"
          >
            <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
              ◦
            </span>
            {line}
          </li>
        ))}
      </ul>
    </aside>
  );
}
