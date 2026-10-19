"use client";

/**
 * AI-5 — Governed AI Execution Engine panel (diagnostic only).
 * Never executes clinical actions · HITL required · no EMR persistence.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedAIExecution } from "@/lib/medical-copilot/clinical-intelligence/governed-ai-execution-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedAIExecutionPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedAIExecution({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const response = result?.response;

  return (
    <div data-testid="governed-ai-execution-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed AI Execution (AI-5)">
          <p className="mb-3 text-xs text-slate-500">
            Motor de ejecución gobernada sobre el Gateway. Requiere revisión
            médica · no ejecuta acciones · no persiste en EMR · reutilizable
            por cualquier proveedor.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando ejecución…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {response ? (
            <div
              className="space-y-3"
              data-testid="governed-ai-execution-response"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>executionId: {response.executionId}</span>
                <span>·</span>
                <span>Provider: {response.providerId}</span>
                <span>·</span>
                <span>Estado: {response.status}</span>
                <span>·</span>
                <span>execution {response.metadata.executionVersion}</span>
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
