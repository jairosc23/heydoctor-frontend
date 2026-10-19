"use client";

/**
 * AI-3 — Governed AI Gateway panel (empty governed response).
 * Never calls LLM, SDKs, or external APIs.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedAIGateway } from "@/lib/medical-copilot/clinical-intelligence/governed-ai-gateway-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedAIGatewayPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedAIGateway({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const response = result?.response;

  return (
    <div data-testid="governed-ai-gateway-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed AI Gateway (AI-3)">
          <p className="mb-3 text-xs text-slate-500">
            Gateway gobernada sobre el Provider Router. Requiere revisión médica
            · no ejecuta acciones · no persiste en EMR · sin LLM · sin SDKs ·
            sin APIs externas.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">Cargando gateway…</p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {response ? (
            <div className="space-y-3" data-testid="governed-ai-gateway-response">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Provider: {response.providerId}</span>
                <span>·</span>
                <span>accepted: {String(response.accepted)}</span>
                <span>·</span>
                <span>Estado: {response.metadata.status}</span>
                <span>·</span>
                <span>gateway {response.metadata.gatewayVersion}</span>
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
