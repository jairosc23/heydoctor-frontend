"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useGovernedClinicalAssistance } from "@/lib/medical-copilot/clinical-intelligence/governed-clinical-assistance";
import { useMedicalCopilot } from "@/context/MedicalCopilotContext";

function packageLabel(value: unknown, nestedKey?: string): string {
  if (!value || typeof value !== "object") return "—";
  const rec = value as Record<string, unknown>;
  if (typeof rec.source === "string") return rec.source;
  if (nestedKey) {
    const nested = rec[nestedKey];
    if (nested && typeof nested === "object") {
      const inner = nested as Record<string, unknown>;
      if (typeof inner.source === "string") return inner.source;
    }
  }
  return "presente";
}

export function GovernedClinicalAssistancePanel() {
  const { session } = useMedicalCopilot();
  const sessionId = session?.sessionId ?? null;
  const { loading, error, result, refresh } = useGovernedClinicalAssistance({
    sessionId,
    enabled: Boolean(sessionId),
  });

  return (
    <div data-testid="governed-clinical-assistance-panel">
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Asistencia Clínica Gobernada (Fase 3)">
          <p className="mb-3 text-xs text-slate-500">
            Sesión de visualización · HITL obligatorio · Sin persistencia EMR ·
            Sin acciones automáticas.
          </p>
          {!sessionId ? (
            <p className="text-sm text-slate-500">
              Esperando sesión Medical Copilot…
            </p>
          ) : null}
          {loading ? <p className="text-sm text-slate-500">Cargando…</p> : null}
          {error ? (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
          {result ? (
            <div
              className="space-y-3"
              data-testid="governed-clinical-assistance"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>HITL: {result.hitl.status}</span>
                <span>·</span>
                <span>
                  Revisión médica:{" "}
                  {result.governance.requiresPhysicianReview ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  Acciones: {result.governance.executesAction ? "sí" : "no"}
                </span>
                <span>·</span>
                <span>
                  EMR auto:{" "}
                  {result.governance.autoPersistedToEmr ? "sí" : "no"}
                </span>
                <button
                  type="button"
                  onClick={refresh}
                  className="ml-auto rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                >
                  Actualizar
                </button>
              </div>
              {result.reason ? (
                <p className="text-xs text-slate-500">reason: {result.reason}</p>
              ) : null}
              <ul className="space-y-1 text-sm text-slate-700">
                <li>Runtime: {packageLabel(result.runtime)}</li>
                <li>
                  Contexto clínico:{" "}
                  {packageLabel(result.clinicalContext, "context")}
                </li>
                <li>
                  Planificación: {packageLabel(result.clinicalPlan, "plan")}
                </li>
                <li>
                  Salida IA: {packageLabel(result.clinicalOutput, "output")}
                </li>
                <li>
                  Workspace decisión (evidencia / diferenciales / gaps):{" "}
                  {packageLabel(result.decisionWorkspace, "workspace")}
                </li>
                <li>
                  Sesión de revisión:{" "}
                  {packageLabel(result.reviewSession, "reviewSession")}
                </li>
              </ul>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </div>
  );
}
