"use client";

import type { ReactNode } from "react";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import {
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import type { PatientProfile, PatientRow } from "@/lib/services/patients";
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
  className?: string;
}

export function PatientSnapshot({
  patientId,
  patientName,
  patient,
  profile,
  status,
  className,
}: PatientSnapshotProps) {
  const { data: memory, loading: memoryLoading } =
    usePatientClinicalMemory(patientId);

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

  return (
    <section
      className={cn(
        "max-h-20 border-b border-slate-100 py-2",
        "flex flex-col gap-2",
        "md:grid md:max-h-none md:grid-cols-2 md:gap-x-4 md:gap-y-1.5",
        "lg:flex lg:max-h-20 lg:flex-row lg:items-center lg:gap-4",
        className,
      )}
      aria-label="Patient Snapshot"
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
  );
}
