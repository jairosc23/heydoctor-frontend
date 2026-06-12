"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import { MOCK_COPILOT_ACTIONS } from "@/lib/clinical-copilot-mock";

export function CopilotActionSystem() {
  return (
    <section aria-label="Copilot Action System" className="space-y-hd-2">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Copilot Action System™</h3>
        <p className="text-[11px] text-slate-500">
          Acciones futuras — deshabilitadas en Phase 4.0
        </p>
      </div>
      <ul className="space-y-hd-2">
        {MOCK_COPILOT_ACTIONS.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              disabled
              title="Disponible en fase posterior con gobernanza clínica"
              className="flex w-full cursor-not-allowed items-start gap-hd-2 rounded-hd-md border border-dashed border-hd-border-subtle bg-hd-surface-muted/60 px-hd-3 py-hd-2 text-left opacity-70"
            >
              <span className="text-base" aria-hidden>
                {action.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium text-slate-700">
                  {action.label}
                </span>
                <span className="block text-[11px] text-slate-500">
                  {action.description}
                </span>
                <span className="mt-1 inline-block text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                  Próximamente
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
