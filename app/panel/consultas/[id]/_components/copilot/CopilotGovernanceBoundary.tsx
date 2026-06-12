"use client";

import { COPILOT_GOVERNANCE_LINES } from "@/lib/clinical-copilot-mock";

export function CopilotGovernanceBoundary() {
  return (
    <aside
      aria-label="Límites de asistencia clínica"
      className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted/80 px-hd-3 py-hd-3"
    >
      <p className="mb-hd-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        AI Governance Boundary™
      </p>
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
