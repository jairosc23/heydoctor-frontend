"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledClinicalDecisions,
  type ClinicalDecisionHttpView,
  type ClinicalDecisionListItem,
} from "@/lib/clinical-decisions";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalDecisionsSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  detected: "Detectada",
  presented: "Presentada",
  acknowledged: "Revisada",
  overridden: "Descartada",
};

const SEVERITY_LABEL: Record<string, string> = {
  info: "Info",
  warning: "Advertencia",
  critical: "Crítica",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function payloadSummary(view: ClinicalDecisionHttpView): string | null {
  const payload = asRecord(view.payload);
  const kind = payload.kind;
  if (kind === "allergy_conflict") {
    const allergen =
      typeof payload.allergen === "string" ? payload.allergen.trim() : "";
    const medication =
      typeof payload.implicatedMedication === "string"
        ? payload.implicatedMedication.trim()
        : "";
    return [allergen, medication].filter(Boolean).join(" · ") || null;
  }
  if (kind === "drug_interaction" || kind === "duplicate_therapy") {
    const medications = Array.isArray(payload.medications)
      ? payload.medications.filter(
          (name): name is string =>
            typeof name === "string" && name.trim().length > 0,
        )
      : [];
    return medications.join(" · ") || null;
  }
  if (kind === "contraindication") {
    const condition =
      typeof payload.condition === "string" ? payload.condition.trim() : "";
    const therapy =
      typeof payload.implicatedTherapy === "string"
        ? payload.implicatedTherapy.trim()
        : "";
    return [condition, therapy].filter(Boolean).join(" · ") || null;
  }
  if (kind === "guideline_reminder") {
    const topic = typeof payload.topic === "string" ? payload.topic.trim() : "";
    const message =
      typeof payload.message === "string" ? payload.message.trim() : "";
    return [topic, message].filter(Boolean).join(" · ") || null;
  }
  return null;
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

function severityLabel(severity: string): string {
  return SEVERITY_LABEL[severity] ?? severity;
}

export function ClinicalDecisionsSection({
  consultationId,
}: ClinicalDecisionsSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalDecisionListItem[]>([]);
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
      const next = await listEnabledClinicalDecisions(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar las precauciones clínicas.",
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
      sectionNumber={24}
      title="Clinical Decisions"
      id="encounter-section-24"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Clinical Decision Support Engine. Representa
        DecisionView, Gate y Capability. No acepta, no descarta y no evalúa
        reglas.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-decisions-skeleton"
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
          data-testid="clinical-decisions-error"
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
          data-testid="clinical-decisions-empty"
        >
          No hay precauciones clínicas habilitadas para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-decisions-list">
          {items.map((item) => {
            const projection = item.preview.data.view;
            const view = projection.ok ? projection.view : null;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = view ? payloadSummary(view) : null;
            return (
              <li
                key={item.type}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`clinical-decision-card-${item.type}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-decision-view-${item.type}`}
                      >
                        {view.patient.name} · {view.clinic.name} ·{" "}
                        {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-decision-view-${item.type}`}
                      >
                        DecisionView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`clinical-decision-status-${item.type}`}
                      >
                        {statusLabel(view.status)} ·{" "}
                        {severityLabel(view.severity)}
                      </p>
                    ) : null}
                    {summary ? (
                      <p className="mt-1 text-sm text-slate-700">{summary}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.capability.requiresHitl ? (
                      <span
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
                        data-testid={`clinical-decision-hitl-${item.type}`}
                      >
                        HITL
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
                    data-testid={`clinical-decision-gate-${item.type}`}
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
                  data-testid={`clinical-decision-capability-${item.type}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Aceptación no disponible
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Descarte no disponible
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Reglas off
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
