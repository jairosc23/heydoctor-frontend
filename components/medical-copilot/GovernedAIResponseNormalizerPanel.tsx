"use client";

/**
 * AI-12 — GovernedNormalizedAIResponse panel (diagnostic only).
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedAIResponseNormalizer } from "@/lib/medical-copilot/clinical-intelligence/governed-ai-response-normalizer";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedAIResponseNormalizerPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedAIResponseNormalizer({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const model = result?.normalized;

  return (
    <div data-testid="governed-ai-response-normalizer-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed AI Response Normalizer (AI-12)">
          <p className="mb-3 text-xs text-slate-500">
            Normalización estructural de respuestas. Sin interpretación clínica · HITL obligatorio.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {model ? (
            <div className="space-y-3" data-testid="governed-ai-response-normalizer">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>normalizedId: {model.normalizedId}</span>
                <span>·</span>
                <span>Provider: {model.providerId}</span>
                <span>·</span>
                <span>Slots: {model.metadata.slotCount}</span>
                <span>·</span>
                <span>Estado: {model.metadata.status}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              {result?.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
