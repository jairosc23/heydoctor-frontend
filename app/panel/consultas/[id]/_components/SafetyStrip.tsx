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
  className?: string;
}

export function SafetyStrip({
  profile,
  loading = false,
  className,
}: SafetyStripProps) {
  const allergyLines = jsonLinesToList(profile?.allergies);
  const alertLines = collectProfileAlerts(profile);
  const hasContent = allergyLines.length > 0 || alertLines.length > 0;

  if (loading) {
    return (
      <div
        className={cn(
          "sticky top-[4.5rem] z-20 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500",
          className,
        )}
        aria-busy="true"
      >
        Cargando alertas de seguridad…
      </div>
    );
  }

  if (!hasContent) {
    return (
      <div
        className={cn(
          "sticky top-[4.5rem] z-20 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800",
          className,
        )}
        role="status"
      >
        Sin alergias ni alertas críticas registradas
      </div>
    );
  }

  return (
    <div
      className={cn(
        "sticky top-[4.5rem] z-20 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 shadow-sm",
        className,
      )}
      role="region"
      aria-label="Alertas de seguridad del paciente"
    >
      <div className="flex flex-wrap items-start gap-x-4 gap-y-1 text-sm">
        {allergyLines.length > 0 ? (
          <p className="min-w-0 flex-1">
            <span className="font-semibold text-red-800">Alergias: </span>
            <span className="text-red-900">{allergyLines.join(" · ")}</span>
          </p>
        ) : null}
        {alertLines.length > 0 ? (
          <p className="min-w-0 flex-1">
            <span className="font-semibold text-amber-900">Alertas: </span>
            <span className="text-amber-950">{alertLines.join(" · ")}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
}
