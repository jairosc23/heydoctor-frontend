"use client";

import Link from "next/link";
import {
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import { formatPatientDisplayName } from "@/lib/services/patients";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { ClinicalMemoryCard } from "./memory/ClinicalMemoryCard";
import { PatientMemoryCard } from "@/components/clinical/PatientMemoryCard";
import { ClinicalCollapsiblePanel } from "./ClinicalCollapsiblePanel";
import type { PatientContextRailProps } from "./PatientContextRail";

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-hd-md border border-slate-100 bg-slate-50/70 px-hd-3 py-hd-2">
      <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="line-clamp-2 text-xs font-medium leading-snug text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatLastConsultation(value?: string): string {
  if (!value) return "Consulta previa";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Consulta previa";
  return date.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

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
  const { data: memory, loading: memoryLoading } =
    usePatientClinicalMemory(patientId);

  if (!patientId) return null;

  const displayName = patient ? formatPatientDisplayName(patient) : fallbackName;
  const ageLabel = patient ? resolvePatientAge(patient) : "—";
  const sexLabel = patient ? formatPatientSex(patient.sex) : "—";
  const documentLabel = patient ? formatPatientDocument(patient) : "—";
  const allergyLines = profile ? jsonLinesToList(profile.allergies) : [];
  const activeProblems = memory.activeConditions.slice(0, 3);
  const activeMedications = memory.currentMedications.slice(0, 3);
  const lastConsultation = memory.recentConsultations[0];

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

      <section className="rounded-hd-lg border border-hd-border-subtle bg-white px-hd-4 py-hd-3 shadow-hd-1">
        <p className="mb-hd-2 text-[10px] font-semibold uppercase tracking-wide text-primary/80">
          Resumen clínico
        </p>
        <div className="grid gap-hd-2 text-xs md:grid-cols-2 xl:grid-cols-5">
          <SummaryCell label="Diagnóstico principal" value={encounterDiagnosis || "Sin diagnóstico"} />
          <SummaryCell
            label="Problemas activos"
            value={
              memoryLoading
                ? "Cargando..."
                : activeProblems.length > 0
                  ? activeProblems.map((item) => item.label).join(" · ")
                  : "Sin problemas activos"
            }
          />
          <SummaryCell
            label="Medicamentos activos"
            value={
              memoryLoading
                ? "Cargando..."
                : activeMedications.length > 0
                  ? activeMedications.map((item) => item.name).join(" · ")
                  : "Sin medicamentos activos"
            }
          />
          <SummaryCell
            label="Alergias"
            value={allergyLines.length > 0 ? allergyLines.join(" · ") : "Sin alergias"}
          />
          <SummaryCell
            label="Última consulta"
            value={
              memoryLoading
                ? "Cargando..."
                : lastConsultation
                  ? `${formatLastConsultation(lastConsultation.createdAt)} · ${
                      lastConsultation.diagnosisLabel ||
                      lastConsultation.diagnosisCode ||
                      "Consulta médica"
                    }`
                  : "Sin consultas previas"
            }
          />
        </div>
      </section>

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
              progressiveDisclosure={false}
              initialEventLimit={5}
              className="border-0 bg-transparent p-0 shadow-none"
            />
          )}
        </ClinicalCollapsiblePanel>
      </div>
    </section>
  );
}
