"use client";

/**
 * CI-7 — Governed Clinical Review panel (read-only reorganization of Snapshot).
 * Never executes clinical actions or writes to EMR.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalReview } from "@/lib/medical-copilot/clinical-intelligence/review-hooks";
import type { ClinicalReviewItem } from "@/lib/medical-copilot/clinical-intelligence/review";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

const LAYER_LABEL: Record<ClinicalReviewItem["layer"], string> = {
  findings: "Findings",
  insights: "Insights",
  recommendations: "Recommendations",
  decisions: "Decisions",
  reasoning: "Reasoning",
};

export function ClinicalReviewPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalReview({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const review = result?.review;

  return (
    <div data-testid="clinical-review-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Clinical Review (CI-7)">
          <p className="mb-3 text-xs text-slate-500">
            Revisión estructurada del snapshot HeyDoctor Copilot. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR · sin
            LLM.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando revisión…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {review ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {review.metadata.status}</span>
                <span>·</span>
                <span>{review.metadata.itemCount} ítems</span>
                <span>·</span>
                <span>engine {review.metadata.engineVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {review.reviewItems.length === 0 ? (
                <p className="text-sm text-slate-500">
                  Sin ítems de revisión por ahora.
                </p>
              ) : (
                <ul className="space-y-2" data-testid="clinical-review-list">
                  {review.reviewItems.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-md border border-slate-200 bg-white px-3 py-2"
                      data-testid="clinical-review-item"
                    >
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold uppercase tracking-wide text-slate-700">
                          {LAYER_LABEL[item.layer]}
                        </span>
                        <span>· {item.category}</span>
                      </div>
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
