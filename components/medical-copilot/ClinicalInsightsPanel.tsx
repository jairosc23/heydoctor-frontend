"use client";

/**
 * CI-2 — Clinical Insights panel (read-only consolidation of Findings).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { ClinicalInsight } from "@/lib/medical-copilot/clinical-intelligence/insights";
import { useClinicalInsights } from "@/lib/medical-copilot/clinical-intelligence/insights-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const SEVERITY_LABEL: Record<ClinicalInsight["severity"], string> = {
  info: "Info",
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export function ClinicalInsightsPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalInsights({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="clinical-insights-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Insights">
          <p className="mb-3 text-xs text-slate-500">
            Insights consolidados desde Clinical Findings. Requiere revisión
            médica · no ejecuta acciones · no persiste en EMR.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando insights…</p>
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
                <span>{result.collection.count} insights</span>
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

              {result.collection.insights.length === 0 ? (
                <p className="text-sm text-slate-500">Sin insights por ahora.</p>
              ) : (
                <ul className="space-y-2" data-testid="clinical-insights-list">
                  {result.collection.insights.map((insight) => (
                    <li
                      key={insight.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-insight-item"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold uppercase tracking-wide text-slate-700">
                          {insight.category}
                        </span>
                        <span>
                          severidad {SEVERITY_LABEL[insight.severity]}
                        </span>
                        <span>
                          · conf {(insight.confidence * 100).toFixed(0)}%
                        </span>
                        <span>· {insight.findingIds.length} findings</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-800">
                        {insight.summary}
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
