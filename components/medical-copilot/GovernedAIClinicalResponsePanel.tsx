"use client";

/**
 * AI-6 — Governed AI Clinical Response panel (diagnostic only).
 * Output contract · HITL required · no EMR · no Skills · no actions.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedAIClinicalResponse } from "@/lib/medical-copilot/clinical-intelligence/governed-ai-clinical-response-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedAIClinicalResponsePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedAIClinicalResponse({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const response = result?.response;

  return (
    <div data-testid="governed-ai-clinical-response-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed AI Clinical Response (AI-6)">
          <p className="mb-3 text-xs text-slate-500">
            Contrato de salida gobernada sobre Execution Result. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR ·
            reutilizable por cualquier proveedor.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando respuesta…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {response ? (
            <div
              className="space-y-3"
              data-testid="governed-ai-clinical-response"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>responseId: {response.responseId}</span>
                <span>·</span>
                <span>Provider: {response.providerId}</span>
                <span>·</span>
                <span>Items: {response.metadata.itemCount}</span>
                <span>·</span>
                <span>Estado: {response.metadata.status}</span>
                <span>·</span>
                <span>builder {response.metadata.builderVersion}</span>
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
