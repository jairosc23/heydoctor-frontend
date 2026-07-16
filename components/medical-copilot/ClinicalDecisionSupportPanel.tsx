"use client";

/**
 * CI-4 — Clinical Decision Support panel (read-only consolidation of Recommendations).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { ClinicalDecision } from "@/lib/medical-copilot/clinical-intelligence/decisions";
import { useClinicalDecisionSupport } from "@/lib/medical-copilot/clinical-intelligence/decisions-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const PRIORITY_LABEL: Record<ClinicalDecision["priority"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export function ClinicalDecisionSupportPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalDecisionSupport({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="clinical-decision-support-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Decision Support (CI-4)">
          <p className="mb-3 text-xs text-slate-500">
            Decisiones consolidadas desde Clinical Recommendations. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando decisiones…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {result ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status}</span>
                <span>·</span>
                <span>{result.collection.count} decisiones</span>
                <span>·</span>
                <span>engine {result.engineVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {result.collection.decisions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin decisiones por ahora.
                </p>
              ) : (
                <ul
                  className="space-y-2"
                  data-testid="clinical-decision-support-list"
                >
                  {result.collection.decisions.map((decision) => (
                    <li
                      key={decision.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-decision-item"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold uppercase tracking-wide text-slate-700">
                          {decision.category}
                        </span>
                        <span>
                          prioridad {PRIORITY_LABEL[decision.priority]}
                        </span>
                        <span>
                          · conf {(decision.confidence * 100).toFixed(0)}%
                        </span>
                        <span>
                          · {decision.recommendationIds.length} recomendaciones
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-800">
                        {decision.summary}
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
