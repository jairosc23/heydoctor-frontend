"use client";

/**
 * CP-32/34 — ClinicalVoiceSuggestionsPanel
 * CB-1 — uses ClinicalWorkflow for locked sessionId + governed analysis HITL.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { ClinicalStatusBadge } from "@/components/clinical/design";
import { useClinicalVoiceIntelligence } from "@/context/ClinicalVoiceIntelligenceContext";
import { useClinicalWorkflow } from "@/context/ClinicalWorkflowContext";
import type {
  ClinicalSuggestion,
  ClinicalSuggestionSeverity,
  ClinicalSuggestionType,
} from "@/lib/medical-copilot/voice-intelligence/types";

function typeLabel(type: ClinicalSuggestionType): string {
  switch (type) {
    case "incomplete_text":
      return "Texto incompleto";
    case "pending_clinical_section":
      return "Sección pendiente";
    case "structural_inconsistency":
      return "Inconsistencia estructural";
    case "manual_review":
      return "Revisión manual";
    case "configurable_reminder":
      return "Recordatorio";
    default:
      return type;
  }
}

function severityBadge(
  severity: ClinicalSuggestionSeverity,
): "draft" | "pending" | "critical" {
  switch (severity) {
    case "review":
      return "critical";
    case "attention":
      return "pending";
    default:
      return "draft";
  }
}

function SuggestionCard({
  suggestion,
  source,
}: {
  suggestion: ClinicalSuggestion;
  source: "heuristic" | "governed";
}) {
  return (
    <li className="rounded-lg border border-amber-200/80 bg-amber-50/40 px-3 py-2">
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <ClinicalStatusBadge
          status={severityBadge(suggestion.severity)}
          label={typeLabel(suggestion.type)}
        />
        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
          requiresPhysicianReview
        </span>
        <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
          {source === "governed" ? "gobernado" : "heurístico"}
        </span>
      </div>
      <p className="text-sm font-medium text-slate-800">{suggestion.title}</p>
      <p className="mt-1 text-sm text-slate-600">{suggestion.detail}</p>
      <p className="mt-2 text-[11px] text-slate-500">
        No vinculante · no modifica el dictado · no escribe en EMR · no ejecuta
        Skills
      </p>
    </li>
  );
}

/** Props kept for route clarity; workflow owns consultation/patient/session. */
export type ClinicalVoiceSuggestionsPanelProps = {
  consultationId?: string;
  patientId?: string;
};

export function ClinicalVoiceSuggestionsPanel(
  _props: ClinicalVoiceSuggestionsPanelProps = {},
) {
  const { analysis, suggestions } = useClinicalVoiceIntelligence();
  const {
    sessionId,
    requestGovernedAnalysis,
    clearGovernedAnalysis,
    governedLoading,
    governedError,
    governedData,
    governedSuggestions,
    governedHookStatus,
    phase,
  } = useClinicalWorkflow();

  return (
    <ClinicalPanel depth={2} className="min-h-[10rem]">
      <ClinicalSection title="Sugerencias clínicas (HITL)">
        <p className="mb-3 text-sm text-slate-500">
          Panel único: heurística local del dictado + análisis gobernado vía
          Workflow → Adapter → Facade. Sin SOAP, sin EMR y sin Skills
          automáticas.
        </p>

        <div className="mb-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void requestGovernedAnalysis()}
            disabled={governedLoading || !sessionId}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {governedLoading
              ? "Analizando (gobernado)…"
              : "Solicitar análisis gobernado"}
          </button>
          {governedHookStatus !== "idle" && governedHookStatus !== "loading" ? (
            <button
              type="button"
              onClick={clearGovernedAnalysis}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              Limpiar gobernado
            </button>
          ) : null}
          <span className="text-[11px] text-slate-500">
            phase · {phase}
            {sessionId
              ? ` · session · ${sessionId.slice(0, 8)}…`
              : " · session · pendiente"}
          </span>
        </div>

        {governedError ? (
          <p className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {governedError}
          </p>
        ) : null}

        {governedData ? (
          <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span>análisis · {governedData.analysisId}</span>
            <span>facade · {governedData.status}</span>
            <span>acciones · {governedData.actions.length}</span>
            <span>findings · {governedData.findings.length}</span>
            <span>
              governance · requiresPhysicianReview=
              {String(governedData.governance.requiresPhysicianReview)}
            </span>
          </div>
        ) : null}

        <div className="mb-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span>chars · {analysis.sourceTextLength}</span>
          <span>hash · {analysis.sourceTextHash}</span>
          <span>heurísticas · {suggestions.length}</span>
          <span>gobernadas · {governedSuggestions.length}</span>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Heurísticas (dictado)
            </h4>
            {suggestions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Sin sugerencias heurísticas para el texto actual.
              </p>
            ) : (
              <ul className="space-y-2">
                {suggestions.map((item) => (
                  <SuggestionCard
                    key={item.suggestionId}
                    suggestion={item}
                    source="heuristic"
                  />
                ))}
              </ul>
            )}
          </div>

          <div>
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Gobernadas (Facade / AI Governance)
            </h4>
            {governedHookStatus === "idle" &&
            governedSuggestions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Solicite un análisis gobernado para ver el snapshot clínico de la
                sesión bloqueada del workflow.
              </p>
            ) : null}
            {governedLoading ? (
              <p className="text-sm text-slate-500">
                Consultando HeyDoctor Copilot…
              </p>
            ) : null}
            {governedSuggestions.length > 0 ? (
              <ul className="space-y-2">
                {governedSuggestions.map((item) => (
                  <SuggestionCard
                    key={item.suggestionId}
                    suggestion={item}
                    source="governed"
                  />
                ))}
              </ul>
            ) : null}
            {governedHookStatus === "success" &&
            governedSuggestions.length === 0 ? (
              <p className="text-sm text-slate-500">
                Análisis gobernado vacío — sin acciones ni findings para
                revisar.
              </p>
            ) : null}
          </div>
        </div>
      </ClinicalSection>
    </ClinicalPanel>
  );
}
