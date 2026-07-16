"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedPromptAssembly } from "@/lib/medical-copilot/clinical-intelligence/governed-prompt-assembly";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedPromptAssemblyPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedPromptAssembly({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.assembledPrompt;
  return (
    <div data-testid="governed-prompt-assembly-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Governed Prompt Assembly (AI-16)">
          <p className="mb-3 text-xs text-slate-500">Ensamblaje estructural final del Prompt. Sin proveedores · sin ejecución IA · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="governed-prompt-assembly">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>assemblyId: {model.assemblyId}</span>
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
