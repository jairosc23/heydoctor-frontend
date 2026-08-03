"use client";

/**
 * CI-3 — Clinical Recommendations panel (read-only consolidation of Insights).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { ClinicalRecommendation } from "@/lib/medical-copilot/clinical-intelligence/recommendations";
import { useClinicalRecommendations } from "@/lib/medical-copilot/clinical-intelligence/recommendations-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const PRIORITY_LABEL: Record<ClinicalRecommendation["priority"], string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

export function ClinicalRecommendationsPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalRecommendations({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="clinical-recommendations-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Recommendations">
          <p className="mb-3 text-xs text-slate-500">
            Recomendaciones consolidadas desde Clinical Insights. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando recomendaciones…</p>
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
                <span>{result.collection.count} recomendaciones</span>
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

              {result.collection.recommendations.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin recomendaciones por ahora.
                </p>
              ) : (
                <ul
                  className="space-y-2"
                  data-testid="clinical-recommendations-list"
                >
                  {result.collection.recommendations.map((recommendation) => (
                    <li
                      key={recommendation.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-recommendation-item"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold uppercase tracking-wide text-slate-700">
                          {recommendation.category}
                        </span>
                        <span>
                          prioridad {PRIORITY_LABEL[recommendation.priority]}
                        </span>
                        <span>
                          · conf{" "}
                          {(recommendation.confidence * 100).toFixed(0)}%
                        </span>
                        <span>
                          · {recommendation.insightIds.length} insights
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-800">
                        {recommendation.summary}
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
