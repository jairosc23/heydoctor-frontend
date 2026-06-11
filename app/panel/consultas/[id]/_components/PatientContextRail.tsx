"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  collectProfileAlerts,
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import {
  formatPatientDisplayName,
  type PatientProfile,
  type PatientRow,
} from "@/lib/services/patients";
import { cn } from "@/lib/utils";
import { PatientMemoryCard } from "@/components/clinical/PatientMemoryCard";
import { DoctorDnaCard } from "@/components/clinical/DoctorDnaCard";

export interface PatientContextRailProps {
  patientId: string | null | undefined;
  patient: PatientRow | null;
  profile: PatientProfile | null;
  loading: boolean;
  error: string | null;
  /** Nombre de respaldo desde la consulta si el fetch del paciente falla. */
  fallbackName?: string;
}

function RailSection({
  title,
  children,
  variant = "default",
}: {
  title: string;
  children: ReactNode;
  variant?: "default" | "alert";
}) {
  return (
    <div>
      <h3
        className={cn(
          "text-xs font-bold uppercase tracking-wide",
          variant === "alert" ? "text-amber-800" : "text-slate-500",
        )}
      >
        {title}
      </h3>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function RailSkeleton() {
  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente"
      aria-busy="true"
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="animate-pulse space-y-3">
        <div className="h-5 w-2/3 rounded bg-slate-200" />
        <div className="h-4 w-full rounded bg-slate-100" />
        <div className="h-4 w-4/5 rounded bg-slate-100" />
        <div className="h-16 w-full rounded bg-slate-100" />
      </div>
      <p className="mt-3 text-xs text-slate-500">Cargando contexto del paciente…</p>
    </aside>
  );
}

function ProfileList({
  lines,
  emptyLabel,
}: {
  lines: string[];
  emptyLabel: string;
}) {
  if (!lines.length) {
    return <p className="text-sm text-slate-500">{emptyLabel}</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-1 text-sm text-slate-800">
      {lines.map((line, index) => (
        <li key={`${index}-${line}`}>{line}</li>
      ))}
    </ul>
  );
}

export function PatientContextRail({
  patientId,
  patient,
  profile,
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
  const documentLabel = patient
    ? formatPatientDocument(patient)
    : "—";
  const allergyLines = jsonLinesToList(profile?.allergies);
  const alertLines = collectProfileAlerts(profile);

  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente"
      className="sticky top-20 z-20 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Contexto del paciente
          </p>
          <h2 className="mt-1 font-[Montserrat] text-lg font-bold text-slate-900">
            {displayName}
          </h2>
        </div>
        <Link
          href={`/panel/pacientes/${patientId}`}
          className="shrink-0 rounded-lg border border-primary px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primaryLight"
        >
          Ver ficha
        </Link>
      </div>

      {error ? (
        <p
          className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold text-slate-500">Edad</dt>
          <dd className="font-medium text-slate-800">{ageLabel}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-slate-500">Sexo</dt>
          <dd className="font-medium text-slate-800">{sexLabel}</dd>
        </div>
        <div className="sm:col-span-1">
          <dt className="text-xs font-semibold text-slate-500">Documento</dt>
          <dd className="font-medium text-slate-800 break-words">{documentLabel}</dd>
        </div>
      </dl>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        <RailSection title="Alergias">
          <ProfileList
            lines={allergyLines}
            emptyLabel="Sin alergias registradas"
          />
        </RailSection>
        <RailSection title="Alertas" variant="alert">
          {alertLines.length > 0 ? (
            <ul className="space-y-1.5">
              {alertLines.map((line, index) => (
                <li
                  key={`${index}-${line}`}
                  className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950"
                >
                  {line}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Sin alertas clínicas</p>
          )}
        </RailSection>
      </div>

      <div className="mt-4 space-y-4 border-t border-slate-100 pt-4">
        <PatientMemoryCard patientId={patientId} />
        <DoctorDnaCard />
      </div>
    </aside>
  );
}
