"use client";

import {
  collectProfileAlerts,
  jsonLinesToList,
} from "@/lib/patient-profile-display";
import type { PatientProfile } from "@/lib/services/patients";
import { cn } from "@/lib/utils";

export interface SafetyStripProps {
  profile: PatientProfile | null;
  loading?: boolean;
  /** Dentro del chrome sticky del encounter (sin sticky propio). */
  embedded?: boolean;
  className?: string;
}

function RiskChip({
  icon,
  label,
  variant,
}: {
  icon: string;
  label: string;
  variant: "critical" | "warning";
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1 rounded px-2 py-0.5 text-xs font-medium",
        variant === "critical"
          ? "bg-red-100 text-red-900"
          : "bg-amber-100 text-amber-950",
      )}
    >
      <span aria-hidden>{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

export function SafetyStrip({
  profile,
  loading = false,
  embedded = false,
  className,
}: SafetyStripProps) {
  const allergyLines = jsonLinesToList(profile?.allergies);
  const alertLines = collectProfileAlerts(profile);
  const hasContent = allergyLines.length > 0 || alertLines.length > 0;

  const shellClass = cn(
    embedded
      ? "border-t border-slate-100 px-0 py-1.5"
      : "sticky top-[var(--encounter-chrome-h,3.5rem)] z-20 border-b border-slate-100 bg-white/95 px-3 py-1.5 backdrop-blur",
    className,
  );

  if (loading) {
    return (
      <div className={cn(shellClass, "text-xs text-slate-500")} aria-busy="true">
        Evaluando riesgos clínicos…
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div
        className={cn(shellClass, "flex items-center gap-1.5 text-xs text-emerald-800")}
        role="status"
      >
        <span aria-hidden>🟢</span>
        <span className="font-medium">Sin riesgos críticos</span>
      </div>
    );
  }

  return (
    <div
      className={shellClass}
      role="region"
      aria-label="Riesgos clínicos del paciente"
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {allergyLines.map((line) => (
          <RiskChip key={`allergy-${line}`} icon="🔴" label={line} variant="critical" />
        ))}
        {alertLines.map((line) => (
          <RiskChip key={`alert-${line}`} icon="⚠️" label={line} variant="warning" />
        ))}
      </div>
    </div>
  );
}
