"use client";

/**
 * AI-4 — OpenAI provider diagnostic panel.
 * Shows Gateway response only — never SDK objects / clinical content.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useOpenAIProvider } from "@/lib/medical-copilot/clinical-intelligence/openai-provider-hooks";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function OpenAIProviderPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useOpenAIProvider({
    sessionId,
    enabled: Boolean(sessionId),
  });

  const response = result?.response;

  return (
    <div data-testid="openai-provider-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="OpenAI Provider Diagnostic (AI-4)">
          <p className="mb-3 text-xs text-slate-500">
            Diagnóstico del provider OpenAI vía Governed AI Gateway. Requiere
            revisión médica · no ejecuta acciones · no persiste en EMR · sin
            Skills · sin exposición de SDK.
          </p>

          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : null}

          {loading ? (
            <p className="text-sm text-slate-500">
              Consultando provider OpenAI…
            </p>
          ) : null}

          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}

          {response ? (
            <div className="space-y-3" data-testid="openai-provider-response">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Provider: {response.providerId}</span>
                <span>·</span>
                <span>accepted: {String(response.accepted)}</span>
                <span>·</span>
                <span>Estado: {response.metadata.status}</span>
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
