"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedEvidenceAggregationStage } from "@/lib/medical-copilot/clinical-intelligence/governed-evidence-aggregation-stage";
import type { GovernedEvidenceAggregationStageStageView } from "@/lib/medical-copilot/clinical-intelligence/governed-evidence-aggregation-stage";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function StageCard({ stage }: { stage: GovernedEvidenceAggregationStageStageView }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm" data-testid="pipeline-stage-card">
      <p className="text-xs font-medium text-slate-800">{stage.order}. {stage.title}</p>
      <p className="mt-1 text-[11px] text-slate-500">kind: {stage.kind}</p>
      <p className="mt-2 text-xs text-slate-600">{stage.summary || "—"}</p>
      <p className="mt-2 text-[11px] text-slate-500">Fuentes: {stage.sourcePackages.join(", ") || "—"}</p>
      <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
        {stage.surfaceRefs.slice(0, 6).map((ref) => (
          <li key={ref.sourcePackage + ref.surfaceKind}>{ref.surfaceKind} · {ref.metricLabel}={ref.metricValue}</li>
        ))}
        {stage.surfaceRefs.length > 6 ? <li>… +{stage.surfaceRefs.length - 6} refs</li> : null}
      </ul>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-amber-700">HITL · PIPELINE INTEGRATION · NO NEW CONTENT · NO EMR</p>
    </div>
  );
}

export function GovernedEvidenceAggregationStagePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedEvidenceAggregationStage({ sessionId, enabled: Boolean(sessionId) });

  return (
    <div data-testid="governed-evidence-aggregation-stage-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title={"Governed Evidence Aggregation Stage"}>
          <p className="mb-3 text-xs text-slate-500">
            Pipeline clínico gobernado · integra superficies certificadas · sin contenido nuevo · sin LLM · sin execute · sin persist
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · HITL · generatesNewClinicalContent=false · usesLlm=false · executesAction=false · writesEmr=false
          </p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión HeyDoctor Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-evidence-aggregation-stage">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status ?? "—"}</span>
                <span>·</span>
                <span>Etapas: {result.stageCount}</span>
                <span>·</span>
                <span>Fuentes certificadas: {result.certifiedSourcesIntegrated.length || "—"}</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result.reason ? <p className="text-xs text-slate-500">reason: {result.reason}</p> : null}
              <div className="grid gap-2 lg:grid-cols-2">
                {result.stages.map((stage) => (
                  <StageCard key={stage.kind + stage.order} stage={stage} />
                ))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
