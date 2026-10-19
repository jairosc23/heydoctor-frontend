"use client";

import type { DemoCopilotPayload } from "@/lib/demo/interactive-demo-scenario";

interface DemoCopilotPanelProps {
  data: DemoCopilotPayload | null;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

export function DemoCopilotPanel({
  data,
  isLoading,
  error,
  className = "",
}: DemoCopilotPanelProps) {
  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 ${className}`}>
        <p className="font-medium">No se pudo actualizar el Copilot</p>
        <p className="mt-1">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`rounded-lg border border-slate-200 bg-white p-4 ${className}`}>
        <div className="mb-3">
          <div className="h-3 w-24 animate-pulse rounded bg-primaryLight" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-100" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const symptoms = data.symptoms_detected ?? [];
  const diagnoses =
    data.possible_diagnoses ??
    data.suggested_diagnoses?.map((d) => d.description || d.code) ??
    [];
  const questions = data.suggested_questions ?? [];
  const tests = data.suggested_tests ?? [];
  const treatments = data.suggested_treatments ?? [];

  const hasContent =
    symptoms.length > 0 ||
    diagnoses.length > 0 ||
    questions.length > 0 ||
    tests.length > 0 ||
    treatments.length > 0;

  if (!hasContent) {
    return (
      <div className={`rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 ${className}`}>
        Sin sugerencias activas. El Copilot se actualiza durante la consulta.
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-lg border border-primary/20 bg-white ${className}`}>
      <div className="border-b border-primary/20 bg-primaryLight px-3 py-2">
        <p className="text-sm font-semibold text-primaryDark">HeyDoctor Copilot</p>
        <p className="mt-0.5 text-xs text-primaryMid">Sugerencias clínicas para revisión médica.</p>
      </div>
      <div className="space-y-3 p-3 text-sm">
        {symptoms.length > 0 && (
          <section className="rounded-md bg-slate-50 p-3">
            <h4 className="mb-1 font-medium text-slate-700">Síntomas detectados</h4>
            <ul className="list-inside list-disc text-slate-600">
              {symptoms.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}
        {diagnoses.length > 0 && (
          <section className="rounded-md border border-primary/20 bg-primaryLight/60 p-3">
            <h4 className="mb-1 font-medium text-primaryDark">Diagnóstico diferencial</h4>
            <ul className="list-inside list-disc space-y-1 text-slate-700">
              {(data.suggested_diagnoses ?? data.possible_diagnoses ?? []).map((d, i) => {
                const desc =
                  typeof d === "string"
                    ? d
                    : (d as { description?: string }).description ||
                      (d as { code?: string }).code ||
                      "";
                const conf =
                  typeof d === "object" && d !== null
                    ? ((d as { confidence?: number; confidence_score?: number }).confidence ??
                      (d as { confidence_score?: number }).confidence_score)
                    : null;
                const expl =
                  typeof d === "object" && d !== null
                    ? (d as { explanation?: string }).explanation
                    : null;
                return (
                  <li key={i} className="pl-1">
                    <span>{desc}</span>
                    {conf != null && (
                      <span className="ml-1 text-primaryMid">({Math.round(conf * 100)}% confianza)</span>
                    )}
                    {expl && (
                      <p className="ml-4 mt-0.5 text-xs text-slate-500">Justificación: {expl}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
        {questions.length > 0 && (
          <section>
            <h4 className="mb-1 font-medium text-slate-700">Preguntas sugeridas</h4>
            <ul className="list-inside list-disc text-slate-600">
              {questions.map((q, i) => (
                <li key={i}>{q}</li>
              ))}
            </ul>
          </section>
        )}
        {tests.length > 0 && (
          <section>
            <h4 className="mb-1 font-medium text-slate-700">Pruebas sugeridas</h4>
            <ul className="list-inside list-disc text-slate-600">
              {tests.map((t, i) => (
                <li key={i}>{t}</li>
              ))}
            </ul>
          </section>
        )}
        {treatments.length > 0 && (
          <section>
            <h4 className="mb-1 font-medium text-slate-700">Tratamientos sugeridos</h4>
            <ul className="list-inside list-disc space-y-1 text-slate-600">
              {(data.suggested_treatments ?? []).map((t, i) => {
                const name =
                  typeof t === "object" && t !== null ? (t as { name?: string }).name : String(t);
                const conf =
                  typeof t === "object" && t !== null
                    ? ((t as { confidence?: number; confidence_score?: number }).confidence ??
                      (t as { confidence_score?: number }).confidence_score)
                    : null;
                const expl =
                  typeof t === "object" && t !== null
                    ? (t as { explanation?: string }).explanation
                    : null;
                return (
                  <li key={i} className="pl-1">
                    <span>{name}</span>
                    {conf != null && (
                      <span className="ml-1 text-primary">({Math.round(conf * 100)}%)</span>
                    )}
                    {expl && (
                      <p className="ml-4 mt-0.5 text-xs text-slate-500">Justificación: {expl}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
