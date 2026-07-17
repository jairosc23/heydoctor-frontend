"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { usePhysicianDecisionWorkspace } from "@/lib/medical-copilot/clinical-intelligence/physician-decision-workspace";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function PhysicianDecisionWorkspacePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = usePhysicianDecisionWorkspace({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.workspace;
  return (
    <div data-testid="physician-decision-workspace-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Physician Decision Workspace (AI-25)">
          <p className="mb-3 text-xs text-slate-500">Espacio integrado de visualización para decisión médica. Solo lectura · sin aprobación automática · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="physician-decision-workspace">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>workspaceId: {model.workspaceId}</span>
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
