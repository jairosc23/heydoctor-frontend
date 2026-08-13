"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError, getApiErrorMessage } from "@/lib/heydoctor-api";
import {
  fetchClinicalDocumentPdf,
  listEnabledClinicalDocuments,
  type ClinicalDocumentListItem,
} from "@/lib/clinical-documents";
import { cn } from "@/lib/utils";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface ClinicalDocumentsSectionProps {
  consultationId?: string | null;
}

type LoadState = "idle" | "loading" | "ready" | "error";

function payloadSummary(item: ClinicalDocumentListItem): string | null {
  const payload = item.preview.data.model.payload;
  if (typeof payload.reason === "string" && payload.reason.trim()) {
    return payload.reason.trim();
  }
  if (
    typeof payload.clinicalSummary === "string" &&
    payload.clinicalSummary.trim()
  ) {
    return payload.clinicalSummary.trim();
  }
  return null;
}

export function ClinicalDocumentsSection({
  consultationId,
}: ClinicalDocumentsSectionProps) {
  const [state, setState] = useState<LoadState>("idle");
  const [items, setItems] = useState<ClinicalDocumentListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyType, setBusyType] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [inline, setInline] = useState<{
    type: string;
    title: string;
    url: string;
  } | null>(null);
  const inlineUrlRef = useRef<string | null>(null);

  const revokeInline = useCallback(() => {
    if (inlineUrlRef.current) {
      URL.revokeObjectURL(inlineUrlRef.current);
      inlineUrlRef.current = null;
    }
    setInline(null);
  }, []);

  const load = useCallback(async () => {
    if (!consultationId) {
      setItems([]);
      setError(null);
      setState("ready");
      return;
    }
    setState("loading");
    setError(null);
    setActionError(null);
    try {
      const next = await listEnabledClinicalDocuments(consultationId);
      setItems(next);
      setState("ready");
    } catch (err) {
      setItems([]);
      setError(
        getApiErrorMessage(
          err,
          "No se pudieron cargar los documentos clínicos.",
        ),
      );
      setState("error");
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
    return () => {
      revokeInline();
    };
  }, [load, revokeInline]);

  async function openPdf(
    item: ClinicalDocumentListItem,
    disposition: "inline" | "attachment",
  ) {
    if (!consultationId || !item.capability.supportsPdf) return;
    setBusyType(`${item.type}:${disposition}`);
    setActionError(null);
    try {
      const pdf = await fetchClinicalDocumentPdf(
        item.type,
        consultationId,
        disposition,
      );
      if (disposition === "inline") {
        revokeInline();
        inlineUrlRef.current = pdf.objectUrl;
        setInline({
          type: item.type,
          title: item.capability.title,
          url: pdf.objectUrl,
        });
        return;
      }
      const anchor = document.createElement("a");
      anchor.href = pdf.objectUrl;
      anchor.download = pdf.fileName;
      anchor.click();
      URL.revokeObjectURL(pdf.objectUrl);
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? getApiErrorMessage(err, "No se pudo emitir el PDF.")
          : "No se pudo emitir el PDF.",
      );
    } finally {
      setBusyType(null);
    }
  }

  return (
    <ClinicalEncounterSection
      sectionNumber={21}
      title="Clinical Documents"
      id="encounter-section-21"
    >
      <p className="mb-hd-2 text-sm text-slate-600">
        Preview y PDF del Clinical Documents Engine. No bloquea la consulta ni
        sustituye el cierre legal.
      </p>

      {state === "loading" ? (
        <div
          className="space-y-hd-2"
          data-testid="clinical-documents-skeleton"
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
          data-testid="clinical-documents-error"
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
          data-testid="clinical-documents-empty"
        >
          No hay documentos clínicos habilitados para este país o contexto.
        </p>
      ) : null}

      {state === "ready" && items.length > 0 ? (
        <ul className="space-y-hd-2" data-testid="clinical-documents-list">
          {items.map((item) => {
            const gate = item.preview.data.model;
            const issues = item.preview.data.gate.ok
              ? []
              : item.preview.data.gate.issues;
            const summary = payloadSummary(item);
            const pdfBusy = busyType?.startsWith(`${item.type}:`);
            return (
              <li
                key={item.type}
                className="rounded-hd-md border border-hd-border-subtle bg-hd-surface-raised p-hd-3"
                data-testid={`clinical-document-card-${item.type}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-800">
                      {item.capability.title}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {gate.patient.name} · {gate.clinic.name} ·{" "}
                      {item.capability.countryCode}
                    </p>
                    {summary ? (
                      <p className="mt-1 text-sm text-slate-700">{summary}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.capability.requiresHitl ? (
                      <span
                        className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800"
                        data-testid={`clinical-document-hitl-${item.type}`}
                      >
                        HITL
                      </span>
                    ) : null}
                    {item.preview.data.gate.ok ? (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-800">
                        Listo
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
                    data-testid={`clinical-document-gate-${item.type}`}
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

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void openPdf(item, "inline")}
                    disabled={!item.capability.supportsPdf || Boolean(pdfBusy)}
                    className={cn(
                      "inline-flex h-8 items-center rounded-hd-md border border-primary/20 bg-white px-3 text-xs font-semibold text-primary shadow-sm hover:bg-primaryLight",
                      (!item.capability.supportsPdf || pdfBusy) &&
                        "cursor-not-allowed opacity-55",
                    )}
                    data-testid={`clinical-document-preview-${item.type}`}
                  >
                    {busyType === `${item.type}:inline`
                      ? "Abriendo…"
                      : "Preview"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void openPdf(item, "attachment")}
                    disabled={!item.capability.supportsPdf || Boolean(pdfBusy)}
                    className={cn(
                      "inline-flex h-8 items-center rounded-hd-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50",
                      (!item.capability.supportsPdf || pdfBusy) &&
                        "cursor-not-allowed opacity-55",
                    )}
                    data-testid={`clinical-document-download-${item.type}`}
                  >
                    {busyType === `${item.type}:attachment`
                      ? "Descargando…"
                      : "Descargar"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {actionError ? (
        <p
          className="mt-hd-2 text-sm text-red-700"
          role="alert"
          data-testid="clinical-documents-action-error"
        >
          {actionError}
        </p>
      ) : null}

      {inline ? (
        <div
          className="mt-hd-3 overflow-hidden rounded-hd-md border border-hd-border-subtle"
          data-testid="clinical-documents-inline-pdf"
        >
          <div className="flex items-center justify-between border-b border-hd-border-subtle bg-hd-surface-muted px-hd-3 py-hd-2">
            <p className="text-xs font-semibold text-slate-700">
              Preview PDF · {inline.title}
            </p>
            <button
              type="button"
              onClick={revokeInline}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              Cerrar
            </button>
          </div>
          <iframe
            title={`PDF ${inline.title}`}
            src={inline.url}
            className="h-[480px] w-full bg-white"
          />
        </div>
      ) : null}
    </ClinicalEncounterSection>
  );
}
