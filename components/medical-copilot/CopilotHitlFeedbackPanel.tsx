"use client";

/**
 * W4 — Lightweight PHI-safe feedback on Medical Copilot workspace.
 * Uses existing POST /medical-copilot/feedback (no new API).
 */

import { useState } from "react";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import {
  postMedicalCopilotFeedback,
  postMedicalCopilotTelemetry,
} from "@/lib/medical-copilot/api";

export function CopilotHitlFeedbackPanel({
  sessionId,
}: {
  sessionId?: string | null;
}) {
  const [likert, setLikert] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (likert == null || busy) return;
    setBusy(true);
    setError(null);
    try {
      await postMedicalCopilotFeedback({
        questionnaireVersion: "w4-hitl-depth-v1",
        incidentCategory: "none",
        cohortTag: "copilot_governed_depth",
        likert: { hitl_clarity: likert },
      });
      void postMedicalCopilotTelemetry({
        event: "clinical_feedback_submitted",
        sessionId: sessionId ?? undefined,
        detail: { surface: "workspace_hitl", likertKeys: 1 },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ClinicalPanel depth={2}>
      <ClinicalSection title="Feedback HITL (W4)">
        <p className="mb-3 text-xs text-slate-500">
          ¿Quedó claro que el Copilot requiere revisión médica y no ejecuta
          acciones? (1–5 · anónimo · sin texto clínico)
        </p>
        {done ? (
          <p className="text-sm text-slate-600" data-testid="copilot-hitl-feedback-done">
            Gracias. Feedback registrado (PHI-safe).
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                data-testid={`copilot-hitl-likert-${n}`}
                onClick={() => setLikert(n)}
                className={
                  likert === n
                    ? "rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-white"
                    : "rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700"
                }
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              data-testid="copilot-hitl-feedback-submit"
              disabled={likert == null || busy}
              onClick={() => void onSubmit()}
              className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
            >
              {busy ? "Enviando…" : "Enviar"}
            </button>
          </div>
        )}
        {error ? (
          <p className="mt-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        ) : null}
      </ClinicalSection>
    </ClinicalPanel>
  );
}
