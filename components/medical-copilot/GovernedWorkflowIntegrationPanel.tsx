"use client";

/**
 * AI-15 — GovernedWorkflowIntegration panel (diagnostic only).
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedWorkflowIntegration } from "@/lib/medical-copilot/clinical-intelligence/governed-workflow-integration";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedWorkflowIntegrationPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedWorkflowIntegration({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const model = result?.integration;

  return (
    <div data-testid="governed-workflow-integration-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Workflow Integration (AI-15)">
          <p className="mb-3 text-xs text-slate-500">
            Puente desacoplado hacia Workflow. Sin modificar estados · sin HITL changes · sin ejecución.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
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
            <div className="space-y-3" data-testid="governed-workflow-integration">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>integrationId: {model.integrationId}</span>
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
