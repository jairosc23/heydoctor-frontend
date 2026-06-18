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
        "sticky top-0 z-30 overflow-hidden border-t border-slate-100 bg-white shadow-sm transition-all duration-200",
        compact ? "py-1.5" : "py-2.5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
        <p className="min-w-0 truncate font-[Montserrat] font-bold uppercase tracking-wide text-slate-900">
          {patientName}
        </p>
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <p className="shrink-0">
          {compact ? compactAge(ageLabel) : ageLabel}
          {!compact && sexLabel !== "—" ? ` | ${sexLabel}` : ""}
        </p>
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <p className="min-w-0 truncate font-semibold text-slate-800">
          {diagnosisLabel}
        </p>
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <p className="shrink-0 text-slate-700">{allergyLabel}</p>
        {!compact ? (
          <>
            <span className="text-slate-300" aria-hidden>
              |
            </span>
            <p className="shrink-0 text-slate-700">{alertLabel}</p>
          </>
        ) : null}
        <span className="text-slate-300" aria-hidden>
          |
        </span>
        <p className="shrink-0 font-semibold text-primary">{statusLabel}</p>
      </div>

      {!compact ? (
        <p className="mt-1 text-[11px] text-slate-500">
          Riesgo: {allergyLabel} | {alertLabel}
        </p>
      ) : null}
    </section>
  );
}
