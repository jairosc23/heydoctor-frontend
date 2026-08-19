"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledClinicalOutcomeTypes,
  type ClinicalOutcomeHttpView,
  type ClinicalOutcomeListItem,
} from "@/lib/clinical-outcomes";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalOutcomeSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  observed: "Observado",
};

function citationSummary(view: ClinicalOutcomeHttpView): string | null {
  const records = view.sourceRefs?.records?.length
    ? view.sourceRefs.records
    : Array.isArray(view.payload.records)
      ? view.payload.records
      : [];
  const ids = records
    .map((ref) => ref.recordId)
    .filter((id) => typeof id === "string" && id.trim());
  if (!ids.length) return null;
  return ids.join(" · ");
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function ClinicalOutcomeSection({
  consultationId,
}: ClinicalOutcomeSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalOutcomeListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!consultationId) {
      setItems([]);
      setError(null);
      setState("ready");
      return;
    }
    setState("loading");
    setError(null);
    try {
      const next = await listEnabledClinicalOutcomeTypes(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(err, "No se pudo cargar el resultado clínico."),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ClinicalEncounterSection
      sectionNumber={32}
      title="Clinical Outcomes"
      id="encounter-section-32"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Clinical Outcomes. Representa ClinicalOutcomeView, Gate
        y Capability. No persiste, no diagnostica, no autoriza y no interpreta
        el resultado observado.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-outcomes-skeleton"
          aria-busy="true"
        >
          {[0, 1, 2].map((slot) => (
            <div
              key={slot}
              className="h-20 animate-pulse rounded-hd-md border border-hd-border-subtle bg-slate-100"
            />
          ))}
        </div>
      ) : null}

      {state === "error" ? (
        <div
          className="rounded-hd-md border border-red-200 bg-red-50 px-hd-3 py-hd-2 text-sm text-red-800"
          data-testid="clinical-outcomes-error"
          role="alert"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => void load()}
            className="mt-2 rounded-hd-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-100"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {state === "ready" && items.length === 0 ? (
        <p
          className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-muted px-hd-3 py-hd-2 text-sm text-slate-600"
          data-testid="clinical-outcomes-empty"
        >
          No hay resultados clínicos habilitados para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-outcomes-list">
          {items.map((item) => {
            const projection = item.preview.data.view;
            const view = projection.ok ? projection.view : null;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = view ? citationSummary(view) : null;
            return (
              <li
                key={item.outcomeType}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`clinical-outcomes-card-${item.outcomeType}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-outcomes-view-${item.outcomeType}`}
                      >
                        {view.patient.name} · {view.clinic.name} ·{" "}
                        {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-outcomes-view-${item.outcomeType}`}
                      >
                        ClinicalOutcomeView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`clinical-outcomes-status-${item.outcomeType}`}
                      >
                        {statusLabel(view.status)}
                      </p>
                    ) : null}
                    {summary ? (
                      <p className="mt-1 text-sm text-slate-700">{summary}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.capability.immutable ? (
                      <span
                        className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
                        data-testid={`clinical-outcomes-immutable-${item.outcomeType}`}
                      >
                        Inmutable
                      </span>
                    ) : null}
                    {item.preview.data.gate.ok ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                        Gate OK
                      </span>
                    ) : (
                      <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-red-800">
                        Gate
                      </span>
                    )}
                  </div>
                </div>

                {issues.length > 0 ? (
                  <ul
                    className="mt-2 space-y-1 rounded-hd-md border border-amber-200 bg-amber-50 px-hd-3 py-hd-2"
                    data-testid={`clinical-outcomes-gate-${item.outcomeType}`}
                  >
                    {issues.map((issue) => (
                      <li
                        key={`${issue.code}:${issue.field}`}
                        className="text-xs text-amber-900"
                      >
                        {issue.message}
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div
                  className="mt-3 flex flex-wrap gap-1.5"
                  data-testid={`clinical-outcomes-capability-${item.outcomeType}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Resultado {item.capability.supportsOutcome ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Diagnóstico{" "}
                    {item.capability.supportsDiagnosis ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Autorización{" "}
                    {item.capability.supportsAuthorization ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Aprendizaje {item.capability.supportsLearning ? "on" : "off"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </ClinicalEncounterSection>
  );
}
