"use client";

import type { ReactNode } from "react";
import { EMPTY_PATIENT_CLINICAL_MEMORY } from "@/hooks/usePatientClinicalMemory";
import {
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import type { PatientProfile, PatientRow } from "@/lib/services/patients";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "./consultation-status";

const STATUS_SNAPSHOT: Record<
  string,
  { emoji: string; label: string }
> = {
  draft: { emoji: "🟡", label: "Borrador" },
  in_progress: { emoji: "🟢", label: "Consulta activa" },
  completed: { emoji: "🔵", label: "Completada" },
  signed: { emoji: "🟣", label: "Firmada" },
  locked: { emoji: "🔴", label: "Bloqueada" },
};

function DiscreteBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600",
        className,
      )}
    >
      {children}
    </span>
  );
}

export interface PatientSnapshotProps {
  patientId?: string | null;
  patientName: string;
  patient: PatientRow | null;
  profile: PatientProfile | null;
  status: string;
  clinicalMemory?: PatientClinicalMemory;
  clinicalMemoryLoading?: boolean;
  /** Phase 4.2.3a — fila única en desktop xl+ (Context Rail cubre detalle). */
  compact?: boolean;
  className?: string;
}

export function PatientSnapshot({
  patientName,
  patient,
  profile,
  status,
  clinicalMemory,
  clinicalMemoryLoading = false,
  compact = false,
  className,
}: PatientSnapshotProps) {
  const memory = clinicalMemory ?? EMPTY_PATIENT_CLINICAL_MEMORY;
  const memoryLoading = clinicalMemoryLoading;

  const ageLabel = patient ? resolvePatientAge(patient) : "—";
  const sexLabel = patient ? formatPatientSex(patient.sex) : "—";
  const documentLabel = patient ? formatPatientDocument(patient) : "—";

  const statusMeta = STATUS_SNAPSHOT[status] ?? {
    emoji: "⚪",
    label: STATUS_LABELS[status] ?? status,
  };

  const conditions = memory.activeConditions.slice(0, 3);
  const extraConditions = Math.max(0, memory.activeConditions.length - 3);

  const allergyLines = jsonLinesToList(profile?.allergies);
  const allergySummary =
    allergyLines.length === 0
      ? "Sin alergias"
      : allergyLines.length === 1
        ? allergyLines[0]!
        : `${allergyLines.length} alergias`;

  const alertCount = memory.alerts.length;
  const pendingLabCount = memory.pendingLabs.length;

  const compactRow = compact ? (
    <section
      className={cn(
        "border-b border-slate-100 py-1",
        "hidden xl:flex xl:min-h-0 xl:max-h-none xl:items-center xl:gap-3 xl:overflow-hidden",
        className,
      )}
      aria-label="Patient Snapshot"
      data-variant="compact"
    >
      <p className="min-w-0 shrink-0 truncate font-[Montserrat] text-xs font-bold uppercase tracking-wide text-slate-900">
        {patientName}
      </p>
      <span className="shrink-0 text-[11px] text-slate-500" aria-hidden>
        ·
      </span>
      <p className="shrink-0 text-[11px] text-slate-600">
        {ageLabel} · {sexLabel}
      </p>
      <span className="shrink-0 text-[11px] text-slate-300" aria-hidden>
        ·
      </span>
      <div className="min-w-0 flex-1 truncate">
        {memoryLoading ? (
          <span className="text-[11px] text-slate-400">…</span>
        ) : conditions.length === 0 ? (
          <span className="text-[11px] text-slate-400">Sin condiciones activas</span>
        ) : (
          <span className="truncate text-[11px] font-medium text-slate-800">
            {conditions.map((c) => c.label).join(" · ")}
            {extraConditions > 0 ? ` · +${extraConditions}` : ""}
          </span>
        )}
      </div>
      <p className="inline-flex shrink-0 items-center gap-1 text-[11px] font-semibold text-slate-700">
        <span aria-hidden>{statusMeta.emoji}</span>
        {statusMeta.label}
      </p>
    </section>
  ) : null;

  return (
    <>
      {compactRow}
      <section
        className={cn(
          "max-h-20 border-b border-slate-100 py-2",
          "flex flex-col gap-2",
          "md:grid md:max-h-none md:grid-cols-2 md:gap-x-4 md:gap-y-1.5",
          "lg:flex lg:max-h-20 lg:flex-row lg:items-center lg:gap-4",
          compact && "xl:hidden",
          !compact ? className : undefined,
        )}
        aria-label={compact ? undefined : "Patient Snapshot"}
        data-variant="default"
      >
      {/* Bloque A — Identidad */}
      <div className="min-w-0 shrink-0 lg:max-w-[14rem]">
        <p className="truncate font-[Montserrat] text-sm font-bold uppercase tracking-wide text-slate-900">
          {patientName}
        </p>
        <p className="truncate text-[11px] text-slate-600">
          {ageLabel} · {sexLabel}
        </p>
        <p className="truncate text-[11px] text-slate-500">{documentLabel}</p>
      </div>

      {/* Bloque B — Resumen clínico */}
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Condiciones
        </p>
        {memoryLoading ? (
          <p className="text-[11px] text-slate-400">…</p>
        ) : conditions.length === 0 ? (
          <p className="text-[11px] text-slate-400">Sin condiciones activas</p>
        ) : (
          <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
            {conditions.map((c, index) => (
              <span
                key={`${c.code ?? ""}-${c.label}-${c.source}`}
                className="inline-flex items-center gap-1.5"
              >
                {index > 0 ? (
                  <span className="text-slate-300" aria-hidden>
                    ·
                  </span>
                ) : null}
                <span className="truncate text-xs font-medium text-slate-800">
                  {c.label}
                </span>
              </span>
            ))}
            {extraConditions > 0 ? (
              <DiscreteBadge>+{extraConditions}</DiscreteBadge>
            ) : null}
          </div>
        )}
      </div>

      {/* Bloque C — Estado clínico */}
      <div className="shrink-0 lg:text-right">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400 lg:hidden">
          Estado
        </p>
        <p className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800">
          <span aria-hidden>{statusMeta.emoji}</span>
          {statusMeta.label}
        </p>
      </div>

      {/* Bloque D — Quick Risk Summary */}
      <div className="min-w-0 lg:max-w-[15rem]">
        <p className="mb-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
          Riesgo
        </p>
        <div className="flex flex-wrap gap-1">
          <DiscreteBadge>{allergySummary}</DiscreteBadge>
          <DiscreteBadge>
            {alertCount === 0
              ? "0 alertas"
              : alertCount === 1
                ? "1 alerta"
                : `${alertCount} alertas`}
          </DiscreteBadge>
          <DiscreteBadge>
            {pendingLabCount === 0
              ? "0 labs pendientes"
              : pendingLabCount === 1
                ? "1 lab pendiente"
                : `${pendingLabCount} labs pendientes`}
          </DiscreteBadge>
        </div>
      </div>
    </section>
    </>
  );
}
