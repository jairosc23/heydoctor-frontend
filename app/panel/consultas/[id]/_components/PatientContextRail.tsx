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
      className="sticky top-28 z-20 space-y-3"
    >
      <div className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
              Paciente
            </p>
            <h2 className="mt-0.5 font-[Montserrat] text-base font-bold text-slate-900">
              {displayName}
            </h2>
          </div>
          <Link
            href={`/panel/pacientes/${patientId}`}
            className="shrink-0 rounded-md border border-primary px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primaryLight"
          >
            Ficha
          </Link>
        </div>

        {error ? (
          <p
            className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1.5 text-xs text-amber-900"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <dl className="mt-2 grid grid-cols-3 gap-1 text-xs">
          <div>
            <dt className="text-slate-500">Edad</dt>
            <dd className="font-medium text-slate-800">{ageLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Sexo</dt>
            <dd className="font-medium text-slate-800">{sexLabel}</dd>
          </div>
          <div>
            <dt className="text-slate-500">Doc.</dt>
            <dd className="font-medium text-slate-800 break-words">{documentLabel}</dd>
          </div>
        </dl>
      </div>

      <PatientMemoryCard patientId={patientId} />
    </aside>
  );
}
