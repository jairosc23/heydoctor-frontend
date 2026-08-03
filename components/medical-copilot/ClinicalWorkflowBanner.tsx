"use client";

/**
 * CB-1 — ClinicalWorkflowBanner
 * Single-experience progress + session lock + HITL governance markers.
 */

import { ClinicalPanel } from "@/components/clinical/design";
import { useClinicalWorkflow } from "@/context/ClinicalWorkflowContext";
import { toAiClinicalUserMessage } from "@/lib/ai-clinical-errors";
import { ClinicalWorkflowStatus } from "./ClinicalWorkflowStatus";

const PHASE_LABELS: Record<string, string> = {
  idle: "Inactivo",
  entering_consultation: "Ingreso a consulta",
  bootstrapping: "Bootstrap Medical Copilot",
  workspace_ready: "Workspace listo",
  dictation_ready: "Dictado clínico",
  voice_intelligence_active: "Voice Intelligence",
  governed_analysis: "Análisis gobernado",
  hitl_review: "Revisión médica (HITL)",
  consultation_complete: "Consulta finalizada",
  recoverable_error: "Error recuperable",
};

export function ClinicalWorkflowBanner() {
  const {
    phase,
    status,
    progress,
    sessionId,
    error,
    governance,
    restart,
    endConsultation,
    clearError,
  } = useClinicalWorkflow();

  return (
    <ClinicalPanel depth={1} className="border-slate-200">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Medical Copilot · Flujo clínico
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {PHASE_LABELS[phase] ?? phase}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Experiencia integrada · una sola sessionId · sin escritura EMR
            </p>
          </div>
          <ClinicalWorkflowStatus />
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-all"
            style={{ width: `${progress.percent}%` }}
            aria-valuenow={progress.percent}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>

        <ol className="flex flex-wrap gap-2">
          {progress.steps.map((step) => (
            <li
              key={step.id}
              className={`rounded-full border px-2.5 py-1 text-[11px] ${
                step.state === "done"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : step.state === "current"
                    ? "border-slate-800 bg-slate-800 text-white"
                    : step.state === "error"
                      ? "border-red-300 bg-red-50 text-red-700"
                      : "border-slate-200 bg-white text-slate-500"
              }`}
            >
              {step.label}
            </li>
          ))}
        </ol>

        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
          <span>status · {status}</span>
          <span>
            session · {sessionId ? `${sessionId.slice(0, 10)}…` : "pendiente"}
          </span>
          <span>
            requiresPhysicianReview=
            {String(governance.requiresPhysicianReview)}
          </span>
          <span>executesAction={String(governance.executesAction)}</span>
          <span>
            autoPersistedToEmr={String(governance.autoPersistedToEmr)}
          </span>
        </div>

        {error ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            <p className="font-medium">
              Error recuperable · {error.code}
            </p>
            <p className="mt-1">{toAiClinicalUserMessage(error.message)}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void restart({ preserveSession: true })}
                className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
              >
                Reiniciar (conservar sesión)
              </button>
              <button
                type="button"
                onClick={clearError}
                className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
              >
                Limpiar error
              </button>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void restart({ preserveSession: true })}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Reiniciar flujo
          </button>
          {phase !== "consultation_complete" ? (
            <button
              type="button"
              onClick={endConsultation}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              Finalizar consulta (HITL)
            </button>
          ) : null}
        </div>
      </div>
    </ClinicalPanel>
  );
}
