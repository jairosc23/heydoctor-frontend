"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledHumanDecisionTypes,
  type HumanDecisionHttpView,
  type HumanDecisionListItem,
} from "@/lib/human-decision";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface HumanDecisionSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  decided: "Decidido",
};

const DISPOSITION_LABEL: Record<string, string> = {
  accept: "Accept",
  reject: "Reject",
  refine: "Refine",
  independent: "Independent",
};

function citationSummary(view: HumanDecisionHttpView): string | null {
  const governances = view.sourceRefs?.governances?.length
    ? view.sourceRefs.governances
    : Array.isArray(view.payload.governances)
      ? view.payload.governances
      : [];
  const ids = governances
    .map((ref) => ref.governanceId)
    .filter((id) => typeof id === "string" && id.trim());
  if (!ids.length) return null;
  return ids.join(" · ");
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

function dispositionLabel(disposition: string): string | null {
  const normalized = disposition.trim();
  if (!normalized) return null;
  return DISPOSITION_LABEL[normalized] ?? normalized;
}

export function HumanDecisionSection({
  consultationId,
}: HumanDecisionSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<HumanDecisionListItem[]>([]);
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
      const next = await listEnabledHumanDecisionTypes(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(err, "No se pudo cargar la decisión humana."),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ClinicalEncounterSection
      sectionNumber={34}
      title="Human Decision"
      id="encounter-section-34"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Human Decision. Representa HumanDecisionView, Gate y
        Capability. No persiste, no gobierna, no autoriza y no ejecuta.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="human-decision-skeleton"
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
          data-testid="human-decision-error"
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
          data-testid="human-decision-empty"
        >
          No hay decisiones humanas habilitadas para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="human-decision-list">
          {items.map((item) => {
            const projection = item.preview.data.view;
            const view = projection.ok ? projection.view : null;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = view ? citationSummary(view) : null;
            const disposition = view ? dispositionLabel(view.disposition) : null;
            return (
              <li
                key={item.decisionType}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`human-decision-card-${item.decisionType}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`human-decision-view-${item.decisionType}`}
                      >
                        {view.patient.name} · {view.clinic.name} ·{" "}
                        {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`human-decision-view-${item.decisionType}`}
                      >
                        HumanDecisionView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`human-decision-status-${item.decisionType}`}
                      >
                        {statusLabel(view.status)}
                        {disposition ? ` · ${disposition}` : ""}
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
                        data-testid={`human-decision-immutable-${item.decisionType}`}
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
                    data-testid={`human-decision-gate-${item.decisionType}`}
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
                  data-testid={`human-decision-capability-${item.decisionType}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Decisión {item.capability.supportsDecision ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Gobernanza {item.capability.supportsGovernance ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Autorización{" "}
                    {item.capability.supportsAuthorization ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Ejecución {item.capability.supportsExecution ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Emisión {item.capability.supportsEmission ? "on" : "off"}
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
