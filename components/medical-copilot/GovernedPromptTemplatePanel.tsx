"use client";

/**
 * AI-8 — Governed Prompt Template panel (diagnostic only).
 * Structural templates · HITL required · no LLM · no EMR · no Skills.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedPromptTemplate } from "@/lib/medical-copilot/clinical-intelligence/governed-prompt-template";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedPromptTemplatePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedPromptTemplate({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const template = result?.template;

  return (
    <div data-testid="governed-prompt-template-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Prompt Template (AI-8)">
          <p className="mb-3 text-xs text-slate-500">
            Contrato estructural de plantillas de Prompt sobre GovernedAIPrompt.
            Requiere revisión médica · no ejecuta acciones · no persiste en EMR
            · sin LLM · sin APIs · sin texto de prompt.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando plantilla…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {template ? (
            <div className="space-y-3" data-testid="governed-prompt-template">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>templateId: {template.templateId}</span>
                <span>·</span>
                <span>Provider: {template.providerId}</span>
                <span>·</span>
                <span>Slots: {template.metadata.slotCount}</span>
                <span>·</span>
                <span>Estado: {template.metadata.status}</span>
                <span>·</span>
                <span>builder {template.metadata.builderVersion}</span>
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
