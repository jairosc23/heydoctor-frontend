"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalRiskRuleEngine } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-risk-rule-engine";
import type { GovernedClinicalRiskRuleEngineEvaluationView } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-risk-rule-engine";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function RuleEvaluationCard({ evaluation }: { evaluation: GovernedClinicalRiskRuleEngineEvaluationView }) {
  return (
    <div className="rounded border border-slate-200 bg-white p-3 text-sm" data-testid="deterministic-rule-evaluation">
      <p className="text-xs font-medium text-slate-800">{evaluation.ruleName}</p>
      <p className="mt-1 text-[11px] text-slate-500">ruleId: {evaluation.ruleId}</p>
      <p className="mt-2 text-xs text-slate-600"><span className="font-medium">Condición:</span> {evaluation.condition || "—"}</p>
      <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Resultado:</span> {evaluation.result}</p>
      <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Explicación:</span> {evaluation.explanation || "—"}</p>
      <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Evidencia:</span> {evaluation.evidenceUsed.length ? evaluation.evidenceUsed.join(", ") : "—"}</p>
      <p className="mt-1 text-xs text-slate-600"><span className="font-medium">Confianza:</span> {evaluation.confidence} · prioridad {evaluation.priority}</p>
      <p className="mt-2 text-[11px] uppercase tracking-wide text-amber-700">HITL · DETERMINISTIC · NO LLM · NO EMR</p>
    </div>
  );
}

export function GovernedClinicalRiskRuleEnginePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalRiskRuleEngine({ sessionId, enabled: Boolean(sessionId) });

  return (
    <div data-testid="governed-clinical-risk-rule-engine-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title={"Governed Clinical Risk Rule Engine"}>
          <p className="mb-3 text-xs text-slate-500">
            Reglas clínicas determinísticas · explicación y evidencia · revisión médica obligatoria · sin execute · sin persist · sin approve · sin LLM
          </p>
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wide text-amber-800">
            READ ONLY · HITL · usesLlm=false · executesAction=false · writesEmr=false · repositoryInvoked=false · automaticDecision=false
          </p>
          {!sessionId ? <p className="text-sm text-slate-500">Esperando sesión Medical Copilot…</p> : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? <p className="text-sm text-red-600" role="alert">{error}</p> : null}
          {result ? (
            <div className="space-y-3" data-testid="governed-clinical-risk-rule-engine">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status ?? "—"}</span>
                <span>·</span>
                <span>Disparadas: {result.triggeredCount}</span>
                <span>·</span>
                <span>Reglas: {result.evaluations.length}</span>
                <span>·</span>
                <span>EMR: no</span>
                <button type="button" onClick={refresh} className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700">Actualizar</button>
              </div>
              {result.reason ? <p className="text-xs text-slate-500">reason: {result.reason}</p> : null}
              {result.evaluations.length === 0 ? (
                <p className="text-sm text-slate-500">Sin evaluaciones en esta superficie (runtime/paquete puede no listar ítems individuales).</p>
              ) : (
                <div className="grid gap-2 lg:grid-cols-2">
                  {result.evaluations.map((evaluation) => (
                    <RuleEvaluationCard key={evaluation.ruleId + evaluation.result} evaluation={evaluation} />
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
