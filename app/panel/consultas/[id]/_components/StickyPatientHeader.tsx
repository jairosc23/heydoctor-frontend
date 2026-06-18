"use client";

import { useEffect, useState } from "react";
import {
  collectProfileAlerts,
  formatPatientSex,
  jsonLinesToList,
  resolvePatientAge,
} from "@/lib/patient-profile-display";
import type { PatientProfile, PatientRow } from "@/lib/services/patients";
import { cn } from "@/lib/utils";
import { STATUS_LABELS } from "./consultation-status";

export interface StickyPatientHeaderProps {
  patientName: string;
  patient: PatientRow | null;
  profile: PatientProfile | null;
  status: string;
  diagnosis?: string | null;
  loading?: boolean;
  className?: string;
}

function compactAge(ageLabel: string): string {
  const match = ageLabel.match(/(\d+)/);
  return match ? `${match[1]}a` : ageLabel;
}

function summarizeLines(
  lines: string[],
  emptyLabel: string,
  pluralLabel: string,
): string {
  if (lines.length === 0) return emptyLabel;
  if (lines.length === 1) return lines[0] ?? emptyLabel;
  return `${lines.length} ${pluralLabel}`;
}

export function StickyPatientHeader({
  patientName,
  patient,
  profile,
  status,
  diagnosis,
  loading = false,
  className,
}: StickyPatientHeaderProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const update = () => setCompact(window.scrollY > 96);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const ageLabel = patient ? resolvePatientAge(patient) : "—";
  const sexLabel = patient ? formatPatientSex(patient.sex) : "—";
  const diagnosisLabel = diagnosis?.trim() || "Sin diagnóstico";
  const allergyLines = jsonLinesToList(profile?.allergies);
  const alertLines = collectProfileAlerts(profile);
  const allergyLabel = loading
    ? "Evaluando alergias"
    : summarizeLines(allergyLines, "Sin alergias", "alergias");
  const alertLabel = loading
    ? "Evaluando alertas"
    : summarizeLines(alertLines, "Sin alertas", "alertas");
  const statusLabel = STATUS_LABELS[status] ?? status;

  return (
    <section
      aria-label="Encabezado clínico persistente del paciente"
      data-testid="sticky-patient-header"
      data-compact={compact ? "true" : "false"}
      className={cn(
        "sticky top-0 z-30 overflow-hidden border-t border-slate-100 bg-white shadow-md ring-1 ring-slate-900/5 transition-all duration-200",
        compact ? "py-1.5" : "py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-2 text-xs text-slate-600">
        <div className="min-w-0 flex-1">
          <p className="truncate font-[Montserrat] text-sm font-bold uppercase tracking-wide text-slate-950">
            {patientName}
          </p>
          {!compact ? (
            <p className="mt-0.5 text-[11px] text-slate-500">
              {ageLabel} · {sexLabel}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 flex flex-1 flex-wrap items-center gap-1.5">
          <span className="inline-flex max-w-[16rem] items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800">
            <span className="mr-1 text-slate-400">Dx</span>
            <span className="truncate">{diagnosisLabel}</span>
          </span>
          <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-800">
            {allergyLabel}
          </span>
          {!compact ? (
            <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900">
              {alertLabel}
            </span>
          ) : null}
          <span className="inline-flex items-center rounded-full bg-primaryLight px-2.5 py-1 text-[11px] font-semibold text-primary">
            {statusLabel}
          </span>
        </div>

        {compact ? (
          <p className="shrink-0 text-[11px] font-medium text-slate-500">
            {compactAge(ageLabel)}
          </p>
        ) : null}
      </div>

      {!compact ? (
        <p className="mt-1.5 text-[11px] text-slate-500">
          Patient Context Bar · Riesgo: {allergyLabel} · {alertLabel}
        </p>
      ) : null}
    </section>
  );
}
