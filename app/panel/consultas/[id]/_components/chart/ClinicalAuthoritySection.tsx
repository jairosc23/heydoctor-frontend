"use client";

import { useCallback, useEffect, useState } from "react";
import { ConfirmationMount } from "@/components/clinical/clinical-authority/ConfirmationMount";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledClinicalAuthorityActs,
  type ClinicalAuthorityHttpView,
  type ClinicalAuthorityListItem,
} from "@/lib/clinical-authority";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalAuthoritySectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  proposed: "Propuesto",
  awaiting_confirm: "Pendiente de confirmación",
  confirmed: "Confirmado",
  rejected: "Rechazado",
  modified: "Modificado",
  aborted: "Abortado",
  authorized: "Autorizado",
  emission_gated: "Emisión bloqueada",
  cancelled: "Cancelado",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function payloadSummary(view: ClinicalAuthorityHttpView): string | null {
  const payload = asRecord(view.payload);
  const kind = payload.kind;
  if (kind === "medication") {
    return typeof payload.summary === "string"
      ? payload.summary.trim() || null
      : null;
  }
  if (kind === "order") {
    return typeof payload.orderType === "string"
      ? payload.orderType.trim() || null
      : null;
  }
  if (kind === "clinical_document") {
    return typeof payload.documentType === "string"
      ? payload.documentType.trim() || null
      : null;
  }
  if (kind === "encounter_close") {
    return typeof payload.note === "string" ? payload.note.trim() || null : null;
  }
  return null;
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

export function ClinicalAuthoritySection({
  consultationId,
}: ClinicalAuthoritySectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalAuthorityListItem[]>([]);
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
      const next = await listEnabledClinicalAuthorityActs(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar los actos de autoridad clínica.",
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
      sectionNumber={25}
      title="Clinical Authority"
      id="encounter-section-25"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Clinical Authority Spine. Representa
        ClinicalAuthorityView, Gate y Capability. No confirma, no autoriza y no
        emite.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-authority-skeleton"
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
          data-testid="clinical-authority-error"
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
          data-testid="clinical-authority-empty"
        >
          No hay actos de autoridad clínica habilitados para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-authority-list">
          {items.map((item) => {
            const projection = item.preview.data.view;
            const view = projection.ok ? projection.view : null;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = view ? payloadSummary(view) : null;
            return (
              <li
                key={item.actClass}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`clinical-authority-card-${item.actClass}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-authority-view-${item.actClass}`}
                      >
                        {view.patient.name} · {view.clinic.name} ·{" "}
                        {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-authority-view-${item.actClass}`}
                      >
                        ClinicalAuthorityView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`clinical-authority-status-${item.actClass}`}
                      >
                        {statusLabel(view.status)}
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
                        data-testid={`clinical-authority-hitl-${item.actClass}`}
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
                    data-testid={`clinical-authority-gate-${item.actClass}`}
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
                  data-testid={`clinical-authority-capability-${item.actClass}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Confirmación no disponible
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Autorización no disponible
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Emisión no disponible
                  </span>
                </div>

                <ConfirmationMount actClass={item.actClass} />
              </li>
            );
          })}
        </ul>
      ) : null}
    </ClinicalEncounterSection>
  );
}
