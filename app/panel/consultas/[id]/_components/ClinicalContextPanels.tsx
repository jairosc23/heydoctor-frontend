"use client";

import Link from "next/link";
import {
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import { formatPatientDisplayName } from "@/lib/services/patients";
import { ClinicalMemoryCard } from "./memory/ClinicalMemoryCard";
import { PatientMemoryCard } from "@/components/clinical/PatientMemoryCard";
import { ClinicalCollapsiblePanel } from "./ClinicalCollapsiblePanel";
import type { PatientContextRailProps } from "./PatientContextRail";

export function ClinicalContextPanels({
  patientId,
  patient,
  profile,
  loading,
  error,
  fallbackName = "Paciente",
  currentConsultationId,
  encounterDiagnosis,
  snapshotConditionLabels,
  smartWorkspaceEnabled = false,
}: PatientContextRailProps) {
  if (!patientId) return null;

  const displayName = patient ? formatPatientDisplayName(patient) : fallbackName;
  const ageLabel = patient ? resolvePatientAge(patient) : "—";
  const sexLabel = patient ? formatPatientSex(patient.sex) : "—";
  const documentLabel = patient ? formatPatientDocument(patient) : "—";
  const allergyLines = profile ? jsonLinesToList(profile.allergies) : [];

  return (
    <section
      aria-label="Contexto clínico longitudinal"
      className="space-y-hd-3"
      data-testid="clinical-context-panels"
    >
      <div className="flex flex-wrap items-center justify-between gap-hd-2 rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised px-hd-4 py-hd-3 text-xs text-slate-600 shadow-hd-1">
        <p>
          <span className="font-semibold text-slate-900">{displayName}</span>
          {" · "}
          {ageLabel} · {sexLabel}
          {documentLabel !== "—" ? ` · ${documentLabel}` : ""}
        </p>
        <Link
          href={`/panel/pacientes/${patientId}`}
          className="font-semibold text-primary hover:underline"
        >
          Ver ficha completa
        </Link>
      </div>

      {error ? (
        <p
          className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-3 py-hd-2 text-xs text-amber-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <div className="grid gap-hd-3">
        <ClinicalCollapsiblePanel
          title="Clinical Memory™"
          eyebrow="Contexto longitudinal"
          storageKey="clinical-encounter-panel-memory"
          defaultExpanded
          contentClassName="min-h-[12rem]"
        >
          {loading ? (
            <p className="text-sm text-slate-500">Cargando memoria clínica…</p>
          ) : (
            <ClinicalMemoryCard
              patientId={patientId}
              encounterDiagnosis={encounterDiagnosis}
              snapshotConditionLabels={snapshotConditionLabels}
              allergyLines={allergyLines}
              compact={smartWorkspaceEnabled}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          )}
        </ClinicalCollapsiblePanel>

        <ClinicalCollapsiblePanel
          title="Clinical Timeline™"
          eyebrow="Continuidad clínica"
          storageKey="clinical-encounter-panel-timeline"
          defaultExpanded={false}
          contentClassName="min-h-[14rem]"
        >
          {loading ? (
            <p className="text-sm text-slate-500">Cargando línea temporal…</p>
          ) : (
            <PatientMemoryCard
              patientId={patientId}
              currentConsultationId={currentConsultationId}
              progressiveDisclosure={smartWorkspaceEnabled}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          )}
        </ClinicalCollapsiblePanel>
      </div>
    </section>
  );
}
