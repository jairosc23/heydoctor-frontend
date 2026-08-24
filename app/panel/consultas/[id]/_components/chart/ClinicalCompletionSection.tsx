"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchConsultation } from "@/lib/services/consultations";
import { downloadPrescriptionPdf } from "@/lib/services/prescriptions";
import { fetchClinicalDocumentPdf } from "@/lib/clinical-documents";
import {
  loadPatientPhone,
  markClinicalCompletionDelivered,
  runClinicalCompletion,
  whatsAppHandoffUrl,
} from "@/lib/clinical-completion/workflow";
import {
  CLINICAL_COMPLETION_STATE_LABELS,
  type ClinicalCompletionSnapshot,
} from "@/lib/clinical-completion/types";
import { cn } from "@/lib/utils";

export function ClinicalCompletionSection({
  consultationId,
  encounterStatus,
  patientId,
  enabled,
}: {
  consultationId?: string | null;
  encounterStatus: string;
  patientId?: string | null;
  enabled: boolean;
}) {
  const params = useParams();
  const resolvedId =
    consultationId ||
    (typeof params?.id === "string" ? params.id : "") ||
    "";
  const [snapshot, setSnapshot] = useState<ClinicalCompletionSnapshot | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    if (!enabled || !resolvedId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await runClinicalCompletion({
        consultationId: resolvedId,
        encounterStatus,
        patientId,
      });
      setSnapshot(next);
      const pid =
        patientId ?? (await fetchConsultation(resolvedId)).patientId ?? null;
      setPhone(await loadPatientPhone(pid));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo completar el acto clínico.",
      );
    } finally {
      setBusy(false);
    }
  }, [resolvedId, encounterStatus, enabled, patientId]);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const handoff = useCallback(
    async (via: "download" | "whatsapp") => {
      if (!snapshot) return;
      setBusy(true);
      setError(null);
      try {
        if (snapshot.prescriptionId) {
          await downloadPrescriptionPdf(snapshot.prescriptionId);
        } else {
          const pdf = await fetchClinicalDocumentPdf(
            "visit_summary",
            resolvedId,
            "attachment",
          );
          const anchor = document.createElement("a");
          anchor.href = pdf.objectUrl;
          anchor.download = pdf.fileName;
          anchor.click();
          URL.revokeObjectURL(pdf.objectUrl);
        }
        if (via === "whatsapp") {
          const url = whatsAppHandoffUrl({
            phone,
            validationCode: snapshot.validationCode,
          });
          if (url) window.open(url, "_blank", "noopener,noreferrer");
        }
        const delivered = await markClinicalCompletionDelivered(resolvedId);
        if (delivered) setSnapshot(delivered);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "No se pudo entregar el documento.",
        );
      } finally {
        setBusy(false);
      }
    },
    [resolvedId, phone, snapshot],
  );

  if (!enabled) return null;

  const state = snapshot?.state ?? "pending";
  const wa = whatsAppHandoffUrl({
    phone,
    validationCode: snapshot?.validationCode,
  });

  return (
    <div
      className="mt-hd-3 space-y-hd-2 rounded-hd-md border border-primary/20 bg-primaryLight/40 p-hd-3"
      data-testid="clinical-completion-section"
      data-completion-state={state}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800">
          Cierre del acto clínico
        </h4>
        <span
          className="rounded-full border border-primary/20 bg-white px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
          data-testid="clinical-completion-state"
        >
          {CLINICAL_COMPLETION_STATE_LABELS[state]}
        </span>
      </div>
      <p className="text-xs text-slate-600">
        Independiente del Encounter ({encounterStatus}). No modifica firma ni
        bloqueo legal.
      </p>
      {snapshot?.clinicalActId ? (
        <p
          className="break-all font-mono text-[10px] text-slate-500"
          data-testid="clinical-act-id"
        >
          ClinicalActId {snapshot.clinicalActId}
        </p>
      ) : null}
      {snapshot?.prescriptionId ? (
        <p className="text-xs text-slate-700" data-testid="clinical-completion-rx">
          Receta {snapshot.prescriptionId.slice(0, 8)}
          {snapshot.validationCode ? ` · ${snapshot.validationCode}` : ""}
        </p>
      ) : state === "no_medication" ||
        snapshot?.documentKind === "visit_summary" ? (
        <p className="text-xs text-slate-700">
          Sin medicación nueva. Se entrega el resumen de la visita.
        </p>
      ) : null}
      {busy ? <p className="text-xs text-slate-500">Procesando…</p> : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="clinical-completion-download"
          disabled={busy || !snapshot}
          onClick={() => void handoff("download")}
          className={cn(
            "inline-flex h-8 items-center rounded-hd-md border border-primary/20 bg-white px-3 text-xs font-semibold text-primary shadow-sm hover:bg-white",
            (busy || !snapshot) && "cursor-not-allowed opacity-55",
          )}
        >
          Descargar documento
        </button>
        <button
          type="button"
          data-testid="clinical-completion-whatsapp"
          disabled={busy || !snapshot || !wa}
          onClick={() => void handoff("whatsapp")}
          className={cn(
            "inline-flex h-8 items-center rounded-hd-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50",
            (busy || !snapshot || !wa) && "cursor-not-allowed opacity-55",
          )}
        >
          Entregar por WhatsApp
        </button>
      </div>
    </div>
  );
}
