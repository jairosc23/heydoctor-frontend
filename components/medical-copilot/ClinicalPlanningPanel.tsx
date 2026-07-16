"use client";

/**
 * CI-10 — Clinical Planning panel (read-only structural plan of Clinical Context).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalPlan } from "@/lib/medical-copilot/clinical-intelligence/clinical-planning-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function ClinicalPlanningPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalPlan({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const plan = result?.plan;

  return (
    <div data-testid="clinical-planning-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Planning (CI-10)">
          <p className="mb-3 text-xs text-slate-500">
            Plan estructural de revisión a partir del Clinical Context. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR · sin
            LLM · sin diagnósticos ni tratamientos.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando plan clínico…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {plan ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {plan.metadata.status}</span>
                <span>·</span>
                <span>{plan.metadata.itemCount} ítems</span>
                <span>·</span>
                <span>revisar {plan.metadata.toReviewCount}</span>
                <span>·</span>
                <span>faltantes {plan.metadata.missingCount}</span>
                <span>·</span>
                <span>engine {plan.metadata.engineVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {plan.planItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin ítems de plan por ahora.
                </p>
              ) : (
                <ul className="space-y-2" data-testid="clinical-planning-list">
                  {plan.planItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-plan-item"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                        #{item.order} · {item.kind} · {item.layer}
                      </p>
                      <p className="mt-1 text-sm text-slate-800">
                        {item.summary}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
