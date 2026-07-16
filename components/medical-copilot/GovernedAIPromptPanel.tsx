"use client";

/**
 * AI-7 — Governed AI Prompt panel (diagnostic only).
 * Structural preparation · HITL required · no LLM · no EMR · no Skills.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedAIPrompt } from "@/lib/medical-copilot/clinical-intelligence/governed-ai-prompt";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedAIPromptPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedAIPrompt({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const prompt = result?.prompt;

  return (
    <div data-testid="governed-ai-prompt-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed AI Prompt (AI-7)">
          <p className="mb-3 text-xs text-slate-500">
            Contrato estructural de preparación de Prompt sobre Clinical
            Response. Requiere revisión médica · no ejecuta acciones · no
            persiste en EMR · sin LLM · sin APIs · sin texto de prompt.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando prompt…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {prompt ? (
            <div className="space-y-3" data-testid="governed-ai-prompt">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>promptId: {prompt.promptId}</span>
                <span>·</span>
                <span>Provider: {prompt.providerId}</span>
                <span>·</span>
                <span>Slots: {prompt.metadata.slotCount}</span>
                <span>·</span>
                <span>Estado: {prompt.metadata.status}</span>
                <span>·</span>
                <span>builder {prompt.metadata.builderVersion}</span>
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
