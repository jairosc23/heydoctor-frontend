"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledClinicalUnderstandingTypes,
  type ClinicalUnderstandingHttpView,
  type ClinicalUnderstandingListItem,
} from "@/lib/clinical-understanding";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalUnderstandingSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  assembled: "Ensamblado",
};

function citationSummary(
  view: ClinicalUnderstandingHttpView,
): string | null {
  const facts = view.sourceRefs?.facts?.length
    ? view.sourceRefs.facts
    : Array.isArray(view.payload.facts)
      ? view.payload.facts
      : [];
  const recordRefs = view.sourceRefs?.recordRefs?.length
    ? view.sourceRefs.recordRefs
    : Array.isArray(view.payload.recordRefs)
      ? view.payload.recordRefs
      : [];
  const ids = [
    ...facts.map((ref) => ref.artifactId),
    ...recordRefs.map((ref) => ref.recordId),
  ].filter((id) => typeof id === "string" && id.trim());
  if (!ids.length) return null;
  return ids.join(" · ");
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function ClinicalUnderstandingSection({
  consultationId,
}: ClinicalUnderstandingSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalUnderstandingListItem[]>([]);
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
      const next = await listEnabledClinicalUnderstandingTypes(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(
          err,
          "No se pudo cargar la comprensión clínica.",
        ),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ClinicalEncounterSection
      sectionNumber={29}
      title="Clinical Understanding"
      id="encounter-section-29"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Clinical Understanding. Representa
        ClinicalUnderstandingView, Gate y Capability. No persiste, no
        diagnostica y no modifica la comprensión estructural.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-understanding-skeleton"
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
          data-testid="clinical-understanding-error"
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
          data-testid="clinical-understanding-empty"
        >
          No hay comprensiones clínicas habilitadas para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-understanding-list">
          {items.map((item) => {
            const projection = item.preview.data.view;
            const view = projection.ok ? projection.view : null;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = view ? citationSummary(view) : null;
            return (
              <li
                key={item.understandingType}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`clinical-understanding-card-${item.understandingType}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-understanding-view-${item.understandingType}`}
                      >
                        {view.patient.name} · {view.clinic.name} ·{" "}
                        {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-understanding-view-${item.understandingType}`}
                      >
                        ClinicalUnderstandingView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`clinical-understanding-status-${item.understandingType}`}
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
                        data-testid={`clinical-understanding-immutable-${item.understandingType}`}
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
                    data-testid={`clinical-understanding-gate-${item.understandingType}`}
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
                  data-testid={`clinical-understanding-capability-${item.understandingType}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Ensamblado{" "}
                    {item.capability.supportsAssembly ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Diagnóstico{" "}
                    {item.capability.supportsDiagnosis ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Razonamiento{" "}
                    {item.capability.supportsReasoning ? "on" : "off"}
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
