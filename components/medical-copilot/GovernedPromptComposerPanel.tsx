"use client";

/**
 * AI-9 — GovernedPrompt panel (diagnostic only).
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedPromptComposer } from "@/lib/medical-copilot/clinical-intelligence/governed-prompt-composer";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedPromptComposerPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedPromptComposer({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const model = result?.composedPrompt;

  return (
    <div data-testid="governed-prompt-composer-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Prompt Composer (AI-9)">
          <p className="mb-3 text-xs text-slate-500">
            Composición estructural del Prompt sobre Prompt Template. Sin texto clínico · sin LLM · HITL obligatorio.
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
            <div className="space-y-3" data-testid="governed-prompt-composer">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>composedPromptId: {model.composedPromptId}</span>
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
