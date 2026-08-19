"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledClinicalKnowledgeJurisdictionTypes,
  type ClinicalKnowledgeJurisdictionHttpView,
  type ClinicalKnowledgeJurisdictionListItem,
} from "@/lib/clinical-knowledge-jurisdiction";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalKnowledgeJurisdictionSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  constituted: "Constituido",
};

const STANCE_LABEL: Record<string, string> = {
  in_force: "Vigente",
  withhold: "Withhold",
  restrict: "Restrict",
};

function citationSummary(view: ClinicalKnowledgeJurisdictionHttpView): string | null {
  const citations = view.sourceRefs?.citations?.length
    ? view.sourceRefs.citations
    : Array.isArray(view.payload.citations)
      ? view.payload.citations
      : [];
  const ids = citations.flatMap((ref) =>
    [ref.federationId].filter(
      (id): id is string => typeof id === "string" && Boolean(id.trim()),
    ),
  );
  if (!ids.length) return null;
  return ids.join(" · ");
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

function stanceLabel(jurisdictionStance: string): string | null {
  const normalized = jurisdictionStance.trim();
  if (!normalized) return null;
  return STANCE_LABEL[normalized] ?? normalized;
}

export function ClinicalKnowledgeJurisdictionSection({
  consultationId,
}: ClinicalKnowledgeJurisdictionSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalKnowledgeJurisdictionListItem[]>([]);
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
      const next = await listEnabledClinicalKnowledgeJurisdictionTypes(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(err, "No se pudo cargar la jurisdicción de conocimiento."),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ClinicalEncounterSection
      sectionNumber={42}
      title="Clinical Knowledge Jurisdiction"
      id="encounter-section-42"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Clinical Knowledge Jurisdiction. Representa
        ClinicalKnowledgeJurisdictionView, Gate y Capability. No persiste, no
        decide y no ejecuta.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-knowledge-jurisdiction-skeleton"
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
          data-testid="clinical-knowledge-jurisdiction-error"
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
          data-testid="clinical-knowledge-jurisdiction-empty"
        >
          No hay jurisdicción de conocimiento habilitada para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-knowledge-jurisdiction-list">
          {items.map((item) => {
            const projection = item.preview.data.view;
            const view = projection.ok ? projection.view : null;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = view ? citationSummary(view) : null;
            const stance = view ? stanceLabel(view.jurisdictionStance) : null;
            return (
              <li
                key={item.jurisdictionType}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`clinical-knowledge-jurisdiction-card-${item.jurisdictionType}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-knowledge-jurisdiction-view-${item.jurisdictionType}`}
                      >
                        {view.clinic.name} · {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-knowledge-jurisdiction-view-${item.jurisdictionType}`}
                      >
                        ClinicalKnowledgeJurisdictionView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`clinical-knowledge-jurisdiction-status-${item.jurisdictionType}`}
                      >
                        {statusLabel(view.status)}
                        {stance ? ` · ${stance}` : ""}
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
                        data-testid={`clinical-knowledge-jurisdiction-immutable-${item.jurisdictionType}`}
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
                    data-testid={`clinical-knowledge-jurisdiction-gate-${item.jurisdictionType}`}
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
                  data-testid={`clinical-knowledge-jurisdiction-capability-${item.jurisdictionType}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Conocimiento {item.capability.supportsKnowledge ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Evidencia {item.capability.supportsEvidence ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Gobernanza científica{" "}
                    {item.capability.supportsScientificGovernance ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Federación {item.capability.supportsFederation ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Jurisdicción {item.capability.supportsJurisdiction ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Gobernanza {item.capability.supportsGovernance ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Aprendizaje {item.capability.supportsLearning ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Reingreso {item.capability.supportsReentry ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Decisión {item.capability.supportsDecision ? "on" : "off"}
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
