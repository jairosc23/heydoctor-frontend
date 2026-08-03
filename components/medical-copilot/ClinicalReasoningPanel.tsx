"use client";

/**
 * CI-5 — Governed Clinical Reasoning panel (read-only consolidation of Decisions).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import type { ClinicalReasoning } from "@/lib/medical-copilot/clinical-intelligence/reasoning";
import { useClinicalReasoning } from "@/lib/medical-copilot/clinical-intelligence/reasoning-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function ClinicalReasoningPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalReasoning({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="clinical-reasoning-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Clinical Reasoning (CI-5)">
          <p className="mb-3 text-xs text-slate-500">
            Razonamiento consolidado desde Clinical Decisions. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR · sin
            LLM.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando razonamiento…</p>
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
                <span>{result.collection.count} razonamientos</span>
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

              {result.collection.reasonings.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin razonamientos por ahora.
                </p>
              ) : (
                <ul
                  className="space-y-2"
                  data-testid="clinical-reasoning-list"
                >
                  {result.collection.reasonings.map(
                    (reasoning: ClinicalReasoning) => (
                      <li
                        key={reasoning.id}
                        className="rounded-md border border-slate-200 bg-white px-3 py-2"
                        data-testid="clinical-reasoning-item"
                      >
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                          <span className="font-semibold uppercase tracking-wide text-slate-700">
                            {reasoning.category}
                          </span>
                          <span>
                            · conf {(reasoning.confidence * 100).toFixed(0)}%
                          </span>
                          <span>
                            · {reasoning.decisionIds.length} decisiones
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-800">
                          {reasoning.summary}
                        </p>
                      </li>
                    ),
                  )}
                </ul>
              )}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
