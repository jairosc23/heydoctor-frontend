"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalPriorityWorkspace } from "@/lib/medical-copilot/clinical-intelligence/clinical-priority-workspace";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function ClinicalPriorityWorkspacePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useClinicalPriorityWorkspace({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.priorityWorkspace;
  return (
    <div data-testid="clinical-priority-workspace-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Priority Workspace (AI-28)">
          <p className="mb-3 text-xs text-slate-500">Prioridad documental estructural. Sin urgencia clínica · sin triage · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="clinical-priority-workspace">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>priorityWorkspaceId: {model.priorityWorkspaceId}</span>
                <span>·</span>
                <span>Provider: {model.providerId}</span>
                <span>·</span>
                <span>Estado: {model.metadata.status}</span>
                <span>·</span>
                <span>Slots: {model.metadata.slotCount}</span>
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
