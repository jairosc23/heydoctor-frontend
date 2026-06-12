"use client";

import React from "react";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { ClinicalTimeline } from "@/components/clinical/ClinicalTimeline";
import { cn } from "@/lib/utils";

export interface PatientMemoryCardProps {
  patientId: string;
  currentConsultationId?: string;
  className?: string;
}

export function PatientMemoryCard({
  patientId,
  currentConsultationId,
  className = "",
}: PatientMemoryCardProps) {
  const { data, loading, error } = usePatientClinicalMemory(patientId);

  if (loading) {
    return (
      <section
        className={cn(
          "rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500",
          className,
        )}
        aria-label="Memoria clínica"
        aria-busy="true"
      >
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-16 w-full rounded bg-slate-100" />
        </div>
        <p className="mt-2">Cargando línea temporal…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={cn(
          "rounded-lg border border-red-100 bg-red-50 p-3 text-xs text-red-700",
          className,
        )}
        aria-label="Memoria clínica"
      >
        No se pudo cargar la memoria clínica.
      </section>
    );
  }

  return (
    <ClinicalTimeline
      data={data}
      currentConsultationId={currentConsultationId}
      className={className}
    />
  );
}
