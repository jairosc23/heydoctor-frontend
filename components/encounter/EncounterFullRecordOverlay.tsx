"use client";

/**
 * Full Clinical Record surface inside the Encounter route.
 * Overlay chrome via Kernel — preserves Encounter Runtime / Memory / providers.
 */

import { useEffect } from "react";
import {
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import { habitLinesFromProfile } from "@/lib/patient-profile-habits";
import {
  formatPatientDisplayName,
  type PatientProfile,
  type PatientRow,
} from "@/lib/services/patients";
import { CLINICAL_OVERLAY_CLASS } from "@/lib/clinical-overlay-contract";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";
import { cn } from "@/lib/utils";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-hd-md border border-slate-100 bg-slate-50/70 px-hd-3 py-hd-2">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-[12px] font-medium text-slate-900">{value}</p>
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <div
      className="rounded-hd-md border border-hd-border-subtle bg-white px-hd-3 py-hd-2"
      data-ui-state={items.length > 0 ? "ready" : "empty"}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      {items.length === 0 ? (
        <p className="mt-1 text-[11px] text-slate-500">
          Sin información registrada en la ficha del encuentro.
        </p>
      ) : (
        <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] text-slate-800">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function EncounterFullRecordOverlay({
  open,
  onClose,
  patient,
  profile,
  fallbackName = "Paciente",
  loading = false,
  error = null,
}: {
  open: boolean;
  onClose: () => void;
  patient: PatientRow | null;
  profile: PatientProfile | null;
  fallbackName?: string;
  loading?: boolean;
  error?: string | null;
}) {
  useEffect(() => {
    if (!open) {
      clinicalWorkspaceKernel.dismiss("full-record");
      return;
    }
    clinicalWorkspaceKernel.present({
      id: "full-record",
      kind: "modal",
      blocking: true,
      onDismiss: onClose,
      backdropAriaLabel: "Volver a la consulta",
      backdropClassName: "bg-slate-900/20",
    });
    return () => {
      clinicalWorkspaceKernel.dismiss("full-record");
    };
  }, [open, onClose]);

  if (!open) return null;

  const viewport = clinicalWorkspaceKernel.getViewport();
  const displayName = patient
    ? formatPatientDisplayName(patient)
    : fallbackName;

  return (
    <div
      className={cn(
        "clinical-overlay-clinical-content flex flex-col bg-hd-surface-chrome",
        CLINICAL_OVERLAY_CLASS.modal,
      )}
      style={{
        paddingTop: viewport.safeTop,
        paddingBottom: viewport.safeBottom,
      }}
      data-testid="encounter-full-record-overlay"
      data-full-record-host="overlayHost"
      data-overlay-layer="modal"
      data-encounter-runtime="preserved"
      role="dialog"
      aria-modal="true"
      aria-label="Ficha clínica completa"
    >
      <header className="shrink-0 border-b border-hd-border-subtle bg-white/95 px-hd-4 py-hd-3 shadow-hd-1">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-primary">
              Encounter · Ficha clínica completa
            </p>
            <p className="text-[13px] font-semibold text-slate-900">
              {displayName}
            </p>
            <p className="text-[11px] text-slate-500">
              Expansión del Encounter Shell — mismo runtime, misma Memory, mismo
              Clinical Snapshot
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="clinical-interactive rounded-hd-md border border-primary/30 bg-primaryLight px-3 py-1.5 text-[11px] font-semibold text-primary"
            data-testid="encounter-full-record-back"
          >
            ← Volver a la consulta
          </button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-hd-4 py-hd-4">
        <div className="mx-auto w-full max-w-3xl space-y-hd-3">
          {loading ? (
            <p className="text-[12px] text-slate-500" role="status">
              Cargando ficha del paciente…
            </p>
          ) : null}
          {error ? (
            <p
              className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-3 py-hd-2 text-[12px] text-amber-900"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <section className="grid gap-2 sm:grid-cols-2">
            <Field
              label="Edad"
              value={patient ? resolvePatientAge(patient) : "—"}
            />
            <Field
              label="Sexo"
              value={patient ? formatPatientSex(patient.sex) : "—"}
            />
            <Field
              label="Documento"
              value={patient ? formatPatientDocument(patient) : "—"}
            />
            <Field
              label="Teléfono"
              value={patient?.mobilePhone || patient?.phone || "—"}
            />
            <Field label="Correo" value={patient?.email ?? "—"} />
            <Field
              label="Dirección"
              value={
                [patient?.addressLine1, patient?.city, patient?.country]
                  .filter(Boolean)
                  .join(", ") || "—"
              }
            />
          </section>

          <ListBlock
            label="Alergias"
            items={jsonLinesToList(profile?.allergies)}
          />
          <ListBlock
            label="Condiciones crónicas"
            items={jsonLinesToList(profile?.chronicConditions)}
          />
          <ListBlock
            label="Medicamentos (ficha)"
            items={jsonLinesToList(profile?.medications)}
          />
          <ListBlock
            label="Cirugías"
            items={jsonLinesToList(profile?.surgeries)}
          />
          <ListBlock
            label="Antecedentes familiares"
            items={jsonLinesToList(profile?.familyHistory)}
          />
          <ListBlock
            label="Hábitos"
            items={habitLinesFromProfile(profile)}
          />
        </div>
      </div>
    </div>
  );
}
