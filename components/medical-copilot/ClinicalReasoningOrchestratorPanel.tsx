"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalReasoningOrchestrator } from "@/lib/medical-copilot/clinical-intelligence/clinical-reasoning-orchestrator";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";
export function ClinicalReasoningOrchestratorPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalReasoningOrchestrator({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.clinicalReasoningOrchestrator;
  return (
    <div data-testid="clinical-reasoning-orchestrator-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Reasoning Orchestrator (AI-76)">
          <p className="mb-3 text-xs text-slate-500">Orquestación estructural del pipeline completo. Sin decisiones clínicas · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="clinical-reasoning-orchestrator">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>clinicalReasoningOrchestratorId: {model.clinicalReasoningOrchestratorId}</span><span>·</span><span>Provider: {model.providerId}</span><span>·</span>
                <span>Estado: {model.metadata.status}</span><span>·</span><span>Slots: {model.metadata.slotCount}</span>
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
