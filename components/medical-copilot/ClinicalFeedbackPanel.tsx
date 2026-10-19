"use client";

/**
 * CB-3 — ClinicalFeedbackPanel
 * Voluntary Beta UX questionnaire — PHI-safe, anonymous, no clinical content.
 */

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { useClinicalValidation } from "@/context/ClinicalValidationContext";
import type {
  ValidationIncidentCategory,
  ValidationLikert,
} from "@/lib/medical-copilot/validation";

const LIKERT_VALUES: ValidationLikert[] = [1, 2, 3, 4, 5];

const INCIDENT_OPTIONS: Array<{
  value: ValidationIncidentCategory;
  label: string;
}> = [
  { value: "none", label: "Ninguna" },
  { value: "ui_bug", label: "Problema de interfaz" },
  { value: "voice_issue", label: "Problema de voz/dictado" },
  { value: "performance", label: "Rendimiento / lentitud" },
  { value: "unclear_suggestions", label: "Sugerencias poco claras" },
  { value: "other", label: "Otro (experiencia de uso)" },
];

export function ClinicalFeedbackPanel() {
  const {
    session,
    questionnaire,
    metrics,
    open,
    dismiss,
    submit,
    setLikert,
    setIncidentCategory,
    setOptionalComment,
    exportMetrics,
  } = useClinicalValidation();

  if (session.status === "submitted") {
    return (
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Validación clínica (Beta)">
          <p className="text-sm text-slate-600">
            Gracias. Su feedback voluntario fue registrado de forma anónima y
            PHI-safe (sin texto clínico ni identificadores clínicos).
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Cuestionario {questionnaire.questionnaireVersion} · finalización{" "}
            {(metrics.questionnaireCompletionRate * 100).toFixed(0)}% ·
            evaluadas {metrics.evaluatedSessions}
            {metrics.netSatisfactionScore != null
              ? ` · NSS ${metrics.netSatisfactionScore}`
              : ""}
          </p>
          <button
            type="button"
            className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
            onClick={() => {
              const payload = exportMetrics();
              if (typeof navigator !== "undefined" && navigator.clipboard) {
                void navigator.clipboard.writeText(JSON.stringify(payload));
              }
            }}
          >
            Copiar métricas agregadas (Beta)
          </button>
        </ClinicalSection>
      </ClinicalPanel>
    );
  }

  if (session.status === "dismissed" || session.status === "idle") {
    return (
      <ClinicalPanel depth={2}>
        <ClinicalSection title="Validación clínica (Beta)">
          <p className="mb-3 text-sm text-slate-500">
            {questionnaire.description}
          </p>
          <p className="mb-3 text-[11px] text-slate-500">
            Instrumento {questionnaire.questionnaireVersion}
          </p>
          <button
            type="button"
            onClick={open}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
          >
            Abrir cuestionario voluntario
          </button>
          {session.status === "dismissed" ? (
            <p className="mt-2 text-xs text-slate-500">
              Cuestionario omitido en esta sesión.
            </p>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    );
  }

  return (
    <ClinicalPanel depth={2}>
      <ClinicalSection title={questionnaire.title}>
        <p className="mb-1 text-sm text-slate-500">
          {questionnaire.description}
        </p>
        <p className="mb-4 text-[11px] text-slate-500">
          Versión {questionnaire.questionnaireVersion} · cohort{" "}
          {session.cohortTag ?? "clinical_beta"} · anónimo
        </p>

        <ul className="space-y-4">
          {questionnaire.questions.map((question) => (
            <li key={question.id}>
              <p className="text-sm font-medium text-slate-800">
                {question.prompt}
              </p>
              <p className="mb-2 text-[11px] text-slate-500">
                {question.helpText}
              </p>
              <div className="flex flex-wrap gap-2">
                {LIKERT_VALUES.map((value) => {
                  const selected = session.answers[question.id] === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setLikert(question.id, value)}
                      className={`h-8 w-8 rounded-md border text-xs font-medium ${
                        selected
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-300 bg-white text-slate-700"
                      }`}
                      aria-label={`${question.id} ${value}`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-slate-800">
            {questionnaire.incidentPrompt}
          </p>
          <select
            className="w-full max-w-md rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            value={session.answers.incidentCategory}
            onChange={(e) =>
              setIncidentCategory(e.target.value as ValidationIncidentCategory)
            }
          >
            {INCIDENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-slate-800">
            {questionnaire.optionalCommentPrompt}
          </label>
          <textarea
            className="min-h-[4rem] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800"
            maxLength={questionnaire.maxCommentLength}
            placeholder="Ej.: la UI fue clara; el dictado respondió lento…"
            value={session.answers.optionalComment ?? ""}
            onChange={(e) => setOptionalComment(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Máx. {questionnaire.maxCommentLength} caracteres · sin PHI ni notas
            clínicas · sin IDs clínicos
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={submit}
            className="rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-white"
          >
            Enviar feedback
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
          >
            Omitir
          </button>
        </div>
      </ClinicalSection>
    </ClinicalPanel>
  );
}
