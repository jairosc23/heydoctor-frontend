"use client";

/**
 * AI-2 — AI Provider panel (logical routing only).
 * Never calls LLM, SDKs, or external APIs.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useAIProviderRoute } from "@/lib/medical-copilot/clinical-intelligence/ai-provider-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function AIProviderPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useAIProviderRoute({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const response = result?.response;

  return (
    <div data-testid="ai-provider-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="AI Provider Route (AI-2)">
          <p className="mb-3 text-xs text-slate-500">
            Abstracción lógica de proveedores sobre GovernedAIRequest. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR · sin
            LLM · sin SDKs · sin APIs externas.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">
              Cargando ruta de proveedor…
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {response ? (
            <div className="space-y-3" data-testid="ai-provider-response">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Provider: {response.providerId}</span>
                <span>·</span>
                <span>accepted: {String(response.accepted)}</span>
                <span>·</span>
                <span>Estado: {response.metadata.status}</span>
                <span>·</span>
                <span>router {response.metadata.routerVersion}</span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>

              <ul className="space-y-1 text-sm text-slate-800">
                <li>supportsChat: {String(response.capabilities.supportsChat)}</li>
                <li>
                  supportsStreaming:{" "}
                  {String(response.capabilities.supportsStreaming)}
                </li>
                <li>
                  supportsTools: {String(response.capabilities.supportsTools)}
                </li>
                <li>
                  supportsEmbeddings:{" "}
                  {String(response.capabilities.supportsEmbeddings)}
                </li>
                <li>
                  supportsCompletions:{" "}
                  {String(response.capabilities.supportsCompletions)}
                </li>
              </ul>

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
