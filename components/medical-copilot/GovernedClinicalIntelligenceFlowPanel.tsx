"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalIntelligenceFlow } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-intelligence-flow";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

export function GovernedClinicalIntelligenceFlowPanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, run, reset } =
    useGovernedClinicalIntelligenceFlow({ sessionId });

  return (
    <div data-testid="governed-clinical-intelligence-flow-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Clinical Intelligence Real (Fase 2)">
          <p className="mb-3 text-xs text-slate-500">
            Flujo gobernado asistivo · HITL obligatorio · No escribe EMR · No
            ejecuta acciones · No emite diagnóstico/tratamiento definitivo.
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión HeyDoctor Copilot…
            </p>
          ) : (
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                data-testid="governed-clinical-intelligence-flow-run"
                onClick={run}
                disabled={loading}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
              >
                {loading
                  ? "Ejecutando flujo…"
                  : "Ejecutar inteligencia clínica gobernada"}
              </button>
              {result ? (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600"
                >
                  Limpiar
                </button>
              ) : null}
            </div>
          )}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div
              className="space-y-3"
              data-testid="governed-clinical-intelligence-flow"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Estado: {result.status}</span>
                <span>·</span>
                <span>
                  Revisión médica:{" "}
                  {result.governance.requiresPhysicianReview ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Acciones:{" "}
                  {result.governance.executesAction ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  EMR auto:{" "}
                  {result.governance.autoPersistedToEmr ? "sí" : "no"}
                </span>
              </div>
              {result.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
              {result.draft ? (
                <div className="space-y-2 rounded border border-amber-200 bg-amber-50/60 p-3 text-sm text-slate-800">
                  <p className="text-xs font-medium text-amber-800">
                    {result.draft.assistiveOnlyNotice ??
                      "Asistencia clínica — requiere revisión médica"}
                  </p>
                  {result.draft.summary ? (
                    <p>{result.draft.summary}</p>
                  ) : null}
                  {result.draft.possibleDiagnoses.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Hipótesis posibles (no definitivas)
                      </p>
                      <ul className="list-disc pl-5 text-sm">
                        {result.draft.possibleDiagnoses.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {result.draft.recommendations.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Recomendaciones asistivas
                      </p>
                      <ul className="list-disc pl-5 text-sm">
                        {result.draft.recommendations.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {result.draft.generalEducation.length > 0 ? (
                    <div>
                      <p className="text-xs font-medium text-slate-600">
                        Educación general
                      </p>
                      <ul className="list-disc pl-5 text-sm">
                        {result.draft.generalEducation.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  <p className="text-xs text-slate-500">
                    provider: {result.draft.provider ?? "—"} · model:{" "}
                    {result.draft.model ?? "—"} · aiRunId:{" "}
                    {result.draft.aiRunId ?? "—"}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Sin borrador asistivo (solo paquetes estructurales o bloqueo
                  de seguridad).
                </p>
              )}
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
