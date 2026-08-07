"use client";

import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import { ClinicalPanelFrame } from "@/components/encounter/ClinicalPanelFrame";

/**
 * Assistant actions surface — no mock "Próximamente" cards.
 * Empty explains why actions are not available (governance / phase).
 */
export function CopilotActionSystem() {
  return (
    <section aria-label="Copilot Action System" className="space-y-hd-2">
      <div>
        <h3 className={CLINICAL_SECTION_TITLE}>Assistant actions</h3>
        <p className="text-[11px] text-slate-500">
          Acciones clínicas gobernadas — Human-in-the-Loop
        </p>
      </div>
      <ClinicalPanelFrame
        state="empty"
        label="Assistant actions"
        testId="copilot-action-system"
        emptyTitle="Sin acciones clínicas disponibles ahora"
        emptyDescription="No hay acciones ejecutables en esta fase. El Assistant permanece advisory: no confirma (HAB), no emite (PE) ni escribe en el EMR. Cuando existan acciones gobernadas, aparecerán aquí para revisión médica."
      />
    </section>
  );
}
