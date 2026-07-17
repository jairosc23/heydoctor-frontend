"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useEvidenceCorrelationWorkspace } from "@/lib/medical-copilot/clinical-intelligence/evidence-correlation-workspace";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function EvidenceCorrelationWorkspacePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useEvidenceCorrelationWorkspace({ sessionId, enabled: Boolean(sessionId) });
  const model = result?.evidenceCorrelationWorkspace;
  return (
    <div data-testid="evidence-correlation-workspace-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Evidence Correlation Workspace (AI-52)">
          <p className="mb-3 text-xs text-slate-500">Correlaciones estructurales de evidencia. Sin inferencias · HITL obligatorio.</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {model ? (
            <div className="space-y-3" data-testid="evidence-correlation-workspace">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>evidenceCorrelationWorkspaceId: {model.evidenceCorrelationWorkspaceId}</span>
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
