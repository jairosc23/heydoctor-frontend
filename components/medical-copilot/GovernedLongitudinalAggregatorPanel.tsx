"use client";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedLongitudinalAggregator } from "@/lib/medical-copilot/clinical-intelligence/governed-longitudinal-aggregator";
import type { GovernedOrchestratorAggregatorView } from "@/lib/medical-copilot/clinical-intelligence/governed-longitudinal-aggregator";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function AggregatorCard({ agg }: { agg: GovernedOrchestratorAggregatorView }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm" data-testid="clinical-ai-orchestrator-aggregator">
      <p className="text-xs font-medium text-slate-800">{agg.order}. {agg.title}</p>
      <p className="mt-1 text-[11px] text-slate-500">kind: {agg.kind}</p>
      <p className="mt-2 text-xs text-slate-600">{agg.summary || "—"}</p>
      <p className="mt-2 text-[11px] text-slate-500">Fuentes: {agg.sourcePackages.join(", ") || "—"}</p>
      <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
        {agg.surfaceRefs.slice(0, 6).map((ref) => (
          <li key={ref.sourcePackage + ref.surfaceKind}>{ref.surfaceKind} · {ref.metricLabel}={ref.metricValue}</li>
        ))}
      </ul>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-amber-700">HITL · ORCHESTRATOR · COORDINATION ONLY · NO NEW CONTENT · NO EMR</p>
    </div>
  );
}

export function GovernedLongitudinalAggregatorPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedLongitudinalAggregator({ sessionId, enabled: Boolean(sessionId) });
  return (
    <div data-testid="governed-longitudinal-aggregator-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title={"Longitudinal Aggregator"}>
          <p className="mb-3 text-xs text-slate-500">Orquestación clínica · integra contratos certificados · sin contenido nuevo · sin LLM · sin execute · sin persist</p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">READ ONLY · HITL · generatesNewClinicalContent=false · usesLlm=false · executesAction=false · writesEmr=false · repositoryInvoked=false</p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-longitudinal-aggregator">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status ?? "—"}</span><span>·</span>
                <span>Agregadores: {result.aggregatorCount}</span><span>·</span>
                <span>Fuentes certificadas: {result.certifiedSourcesIntegrated.length || "—"}</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result.summary ? <p className="text-xs text-slate-600">{result.summary}</p> : null}
              <div className="grid gap-2 lg:grid-cols-2">
                {result.aggregators.map((agg) => (<AggregatorCard key={agg.kind + agg.order} agg={agg} />))}
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
