"use client";

import Link from "next/link";
import {
  formatPatientDocument,
  formatPatientSex,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import {
  formatPatientDisplayName,
  type PatientProfile,
  type PatientRow,
} from "@/lib/services/patients";
import { PatientMemoryCard } from "@/components/clinical/PatientMemoryCard";

export interface PatientContextRailProps {
  patientId: string | null | undefined;
  patient: PatientRow | null;
  profile: PatientProfile | null;
  loading: boolean;
  error: string | null;
  /** Nombre de respaldo desde la consulta si el fetch del paciente falla. */
  fallbackName?: string;
  /** Consulta en curso — marca «Consulta actual» en el timeline. */
  currentConsultationId?: string;
}

function RailSkeleton() {
  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente"
      aria-busy="true"
      className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="animate-pulse space-y-2">
        <div className="h-4 w-2/3 rounded bg-slate-200" />
        <div className="h-3 w-full rounded bg-slate-100" />
        <div className="h-20 w-full rounded bg-slate-100" />
      </div>
      <p className="mt-2 text-xs text-slate-500">Cargando contexto…</p>
    </aside>
  );
}

export function PatientContextRail({
  patientId,
  patient,
  profile: _profile,
  loading,
  error,
  fallbackName = "Paciente",
  currentConsultationId,
}: PatientContextRailProps) {
  if (!patientId) return null;

  if (loading) {
    return <RailSkeleton />;
  }

  const displayName = patient
    ? formatPatientDisplayName(patient)
    : fallbackName;
  const ageLabel = patient ? resolvePatientAge(patient) : "—";
  const sexLabel = patient ? formatPatientSex(patient.sex) : "—";
  const documentLabel = patient ? formatPatientDocument(patient) : "—";

  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente"
      className="sticky top-[5.5rem] z-10 space-y-2"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Contexto
        </p>
        <Link
          href={`/panel/pacientes/${patientId}`}
          className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
        >
          Ver ficha
        </Link>
      </div>

      {error ? (
        <p
          className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <p className="text-[11px] text-slate-500">
        {displayName} · {ageLabel} · {sexLabel}
        {documentLabel !== "—" ? ` · ${documentLabel}` : ""}
      </p>

      <PatientMemoryCard
        patientId={patientId}
        currentConsultationId={currentConsultationId}
        className="border-0 p-0 shadow-none"
      />
    </aside>
  );
}
