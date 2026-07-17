"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalConsultationWorkflow } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-consultation-workflow";
import type { GovernedClinicalWorkflowView } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-consultation-workflow";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function WorkflowCard({ wf }: { wf: GovernedClinicalWorkflowView }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm" data-testid="clinical-workflow-engine-card">
      <p className="text-xs font-medium text-slate-800">{wf.order}. {wf.title}</p>
      <p className="mt-1 text-[11px] text-slate-500">type: {wf.workflowType}</p>
      <p className="mt-1 text-[11px] text-slate-500">id: {wf.workflowId || "—"}</p>
      <p className="mt-2 text-xs text-slate-600">{wf.summary || "—"}</p>
      <p className="mt-2 text-[11px] text-slate-600">Stage: {wf.currentStage || "—"} → next: {wf.nextStage ?? "—"}</p>
      <p className="mt-1 text-[11px] text-slate-500">Completed: {wf.completedStages.join(", ") || "—"}</p>
      <p className="mt-1 text-[11px] text-slate-500">Pending: {wf.pendingStages.join(", ") || "—"}</p>
      <p className="mt-2 text-[11px] text-slate-500">Fuentes: {wf.sourcePackages.join(", ") || "—"}</p>
      <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
        {wf.surfaceRefs.slice(0, 6).map((ref) => (
          <li key={ref.sourcePackage + ref.surfaceKind}>{ref.surfaceKind} · {ref.metricLabel}={ref.metricValue}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-amber-700">HITL · WORKFLOW COORDINATION · NO EXECUTE · NO NEW CONTENT · NO EMR</p>
    </div>
  );
}

export function GovernedClinicalConsultationWorkflowPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalConsultationWorkflow({ sessionId, enabled: Boolean(sessionId) });
  return (
    <div data-testid="governed-clinical-consultation-workflow-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title={"Clinical Consultation Workflow"}>
          <p className="mb-3 text-xs text-slate-500">Enterprise Clinical Workflow Engine · coordina contratos certificados · sin ejecutar · sin LLM · sin persist</p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">READ ONLY · HITL · executesWorkflow=false · generatesNewClinicalContent=false · usesLlm=false · writesEmr=false</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-clinical-consultation-workflow">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status ?? "—"}</span><span>·</span>
                <span>Workflows: {result.workflowCount}</span><span>·</span>
                <span>Stage: {result.currentStage ?? "—"}</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result.summary ? <p className="text-xs text-slate-600">{result.summary}</p> : null}
              <div className="grid gap-2 lg:grid-cols-2">
                {result.workflows.map((wf) => (<WorkflowCard key={wf.workflowId + wf.order} wf={wf} />))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
