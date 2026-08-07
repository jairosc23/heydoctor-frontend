"use client";

import {
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
import { PatientMemoryCard } from "@/components/clinical/PatientMemoryCard";
import { ClinicalCard } from "@/components/clinical/design";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import type { ClinicalFoundationOutputs } from "@/lib/types/clinical-foundation";
import { ClinicalMemoryCard } from "./memory/ClinicalMemoryCard";

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
  encounterDiagnosis?: string | null;
  snapshotConditionLabels?: string[];
  smartWorkspaceEnabled?: boolean;
  clinicalMemory?: PatientClinicalMemory;
  clinicalMemoryLoading?: boolean;
  clinicalMemoryError?: string | null;
  clinicalFoundationOutputs?: ClinicalFoundationOutputs | null;
  clinicalFoundationLoading?: boolean;
  clinicalFoundationError?: string | null;
  /**
   * Open Full Clinical Record inside the Encounter (History API).
   * When set, never navigates away to /panel/pacientes.
   */
  onOpenFullRecord?: () => void;
}

function RailSkeleton() {
  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente"
      aria-busy="true"
      className="rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-hd-4 shadow-hd-1"
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
  profile,
  loading,
  error,
  fallbackName = "Paciente",
  currentConsultationId,
  encounterDiagnosis,
  snapshotConditionLabels,
  smartWorkspaceEnabled = false,
  clinicalMemory,
  clinicalMemoryLoading,
  clinicalMemoryError,
  clinicalFoundationOutputs,
  clinicalFoundationLoading,
  clinicalFoundationError,
  onOpenFullRecord,
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
  const allergyLines = profile ? jsonLinesToList(profile.allergies) : [];

  return (
    <aside
      role="complementary"
      aria-label="Contexto del paciente"
      className="clinical-depth-secondary sticky top-[var(--encounter-chrome-h,5.5rem)] z-10 min-w-0 space-y-hd-3"
    >
      <ClinicalCard className="min-w-0 space-y-hd-3 border-0 bg-transparent p-0 shadow-none">
      <div className="flex items-center justify-between gap-2 border-b border-hd-border-subtle pb-hd-3">
        <p className={CLINICAL_SECTION_TITLE}>
          Contexto
        </p>
        {onOpenFullRecord ? (
          <button
            type="button"
            onClick={onOpenFullRecord}
            className="shrink-0 text-[11px] font-semibold text-primary hover:underline"
            data-testid="encounter-open-full-record"
          >
            Ver ficha
          </button>
        ) : null}
      </div>

      {error ? (
        <p
          className="rounded border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] text-amber-900"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <p className="text-[11px] leading-relaxed text-slate-500">
        {displayName} · {ageLabel} · {sexLabel}
        {documentLabel !== "—" ? ` · ${documentLabel}` : ""}
      </p>

      {clinicalFoundationOutputs?.clinicalSummary ? (
        <div className="rounded-hd-md border border-primary/10 bg-primaryLight/40 px-hd-3 py-hd-2">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
            Clinical Foundation
          </p>
          <ul className="space-y-1 text-[11px] leading-relaxed text-slate-700">
            {clinicalFoundationOutputs.clinicalSummary.lines.slice(0, 3).map((line) => (
              <li key={line.id}>{line.text}</li>
            ))}
          </ul>
        </div>
      ) : clinicalFoundationLoading ? (
        <p className="rounded-hd-md border border-slate-100 bg-slate-50 px-hd-3 py-hd-2 text-[11px] text-slate-500">
          Cargando Clinical Foundation...
        </p>
      ) : clinicalFoundationError ? (
        <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-3 py-hd-2 text-[11px] text-amber-900">
          Foundation no disponible; usando contexto local.
        </p>
      ) : null}

      <ClinicalMemoryCard
        patientId={patientId}
        encounterDiagnosis={encounterDiagnosis}
        snapshotConditionLabels={snapshotConditionLabels}
        allergyLines={allergyLines}
        compact={smartWorkspaceEnabled}
        memory={clinicalMemory}
        memoryLoading={clinicalMemoryLoading}
        memoryError={clinicalMemoryError}
      />

      <div className="clinical-timeline-item rounded-hd-md border-t border-hd-border-subtle pt-hd-3">
        <PatientMemoryCard
          patientId={patientId}
          currentConsultationId={currentConsultationId}
          progressiveDisclosure={smartWorkspaceEnabled}
          memory={clinicalMemory}
          memoryLoading={clinicalMemoryLoading}
          memoryError={clinicalMemoryError}
          className="border-0 p-0 shadow-none"
        />
      </div>
      </ClinicalCard>
    </aside>
  );
}
