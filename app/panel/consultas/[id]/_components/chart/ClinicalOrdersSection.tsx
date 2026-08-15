"use client";

import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  listEnabledClinicalOrders,
  type ClinicalOrderHttpView,
  type ClinicalOrderListItem,
} from "@/lib/clinical-orders";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalOrdersSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

const STATUS_LABEL: Record<string, string> = {
  draft: "Borrador",
  ready: "Lista",
  issued: "Emitida",
  expired: "Vencida",
  cancelled: "Cancelada",
};

const PRIORITY_LABEL: Record<string, string> = {
  routine: "Rutina",
  urgent: "Urgente",
  stat: "STAT",
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function payloadSummary(view: ClinicalOrderHttpView): string | null {
  const payload = asRecord(view.payload);
  const kind = payload.kind;
  if (kind === "prescription") {
    const medications = Array.isArray(payload.medications)
      ? payload.medications
      : [];
    const first = asRecord(medications[0]);
    const name = typeof first.name === "string" ? first.name.trim() : "";
    const dosage = typeof first.dosage === "string" ? first.dosage.trim() : "";
    if (name) return [name, dosage].filter(Boolean).join(" · ");
    return typeof payload.diagnosis === "string"
      ? payload.diagnosis.trim() || null
      : null;
  }
  if (kind === "laboratory") {
    const exams = Array.isArray(payload.exams) ? payload.exams : [];
    const first = asRecord(exams[0]);
    return typeof first.exam === "string" ? first.exam.trim() || null : null;
  }
  if (kind === "imaging") {
    const study = typeof payload.study === "string" ? payload.study.trim() : "";
    const region =
      typeof payload.region === "string" ? payload.region.trim() : "";
    return [study, region].filter(Boolean).join(" · ") || null;
  }
  if (kind === "procedure") {
    return typeof payload.procedure === "string"
      ? payload.procedure.trim() || null
      : null;
  }
  if (kind === "referral") {
    const specialty =
      typeof payload.specialty === "string" ? payload.specialty.trim() : "";
    const reason =
      typeof payload.reason === "string" ? payload.reason.trim() : "";
    return [specialty, reason].filter(Boolean).join(" · ") || null;
  }
  return null;
}

function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}

function priorityLabel(priority: string): string {
  return PRIORITY_LABEL[priority] ?? priority;
}

export function ClinicalOrdersSection({
  consultationId,
}: ClinicalOrdersSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalOrderListItem[]>([]);
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
      const next = await listEnabledClinicalOrders(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(err, "No se pudieron cargar las órdenes clínicas."),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <ClinicalEncounterSection
      sectionNumber={23}
      title="Clinical Orders"
      id="encounter-section-23"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview HTTP del Clinical Orders Engine. Representa OrderView, Gate y
        Capability. No emite, no despacha y no genera PDF.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-orders-skeleton"
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
          data-testid="clinical-orders-error"
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
          data-testid="clinical-orders-empty"
        >
          No hay órdenes clínicas habilitadas para este contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-orders-list">
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
                data-testid={`clinical-order-card-${item.type}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    {view ? (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-order-view-${item.type}`}
                      >
                        {view.patient.name} · {view.clinic.name} ·{" "}
                        {view.countryCode}
                      </p>
                    ) : (
                      <p
                        className="text-xs text-slate-500"
                        data-testid={`clinical-order-view-${item.type}`}
                      >
                        OrderView no disponible
                        {"reason" in projection ? ` · ${projection.reason}` : ""}
                      </p>
                    )}
                    {view ? (
                      <p
                        className="mt-1 text-xs text-slate-600"
                        data-testid={`clinical-order-status-${item.type}`}
                      >
                        {statusLabel(view.status)} ·{" "}
                        {priorityLabel(view.priority)}
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
                        data-testid={`clinical-order-hitl-${item.type}`}
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
                    data-testid={`clinical-order-gate-${item.type}`}
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
                  data-testid={`clinical-order-capability-${item.type}`}
                >
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">
                    Preview {item.capability.supportsPreview ? "on" : "off"}
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Emisión no disponible
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    Dispatch off
                  </span>
                  {item.capability.rxForbiddenInE08 ? (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                      RX fuera de E08
                    </span>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
    </ClinicalEncounterSection>
  );
}
