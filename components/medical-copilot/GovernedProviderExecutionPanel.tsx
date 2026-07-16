"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedProviderExecution } from "@/lib/medical-copilot/clinical-intelligence/governed-provider-execution";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedProviderExecutionPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedProviderExecution({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.providerExecution;
  return (
    <div data-testid="governed-provider-execution-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Provider Execution (AI-18)">
          <p className="mb-3 text-xs text-slate-500">Ejecución real OpenAI vía Gateway + Execution Engine. HITL · sin EMR · sin Skills.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="governed-provider-execution">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>providerExecutionId: {model.providerExecutionId}</span>
                <span>·</span>
                <span>Provider: {model.providerId}</span>
                <span>·</span>
                <span>Estado: {model.metadata.status}</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result?.reason ? <p className="text-xs text-slate-500">reason: {result.reason}</p> : null}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
