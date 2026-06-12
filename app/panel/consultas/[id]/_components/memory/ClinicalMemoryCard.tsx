"use client";

import { useMemo } from "react";
import { ClinicalCard, ClinicalStatusBadge } from "@/components/clinical/design";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  buildClinicalMemoryView,
  clinicalMemoryConfidenceLabel,
} from "@/lib/clinical-memory";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { cn } from "@/lib/utils";

export interface ClinicalMemoryCardProps {
  patientId: string;
  encounterDiagnosis?: string | null;
  snapshotConditionLabels?: string[];
  className?: string;
}

export function ClinicalMemoryCard({
  patientId,
  encounterDiagnosis,
  snapshotConditionLabels,
  className,
}: ClinicalMemoryCardProps) {
  const { data, loading, error } = usePatientClinicalMemory(patientId);

  const memoryView = useMemo(
    () =>
      buildClinicalMemoryView({
        memory: data,
        encounterDiagnosis,
        snapshotConditionLabels,
      }),
    [data, encounterDiagnosis, snapshotConditionLabels],
  );

  if (loading) {
    return (
      <section
        aria-label="Clinical Memory"
        aria-busy="true"
        className={cn(
          "rounded-hd-lg border border-hd-border-subtle bg-hd-surface-muted/60 p-hd-3",
          className,
        )}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className="h-12 w-full rounded bg-slate-100" />
        </div>
        <p className="mt-2 text-[11px] text-slate-500">Construyendo memoria clínica…</p>
      </section>
    );
  }

  if (error) {
    return (
      <section
        aria-label="Clinical Memory"
        className={cn(
          "rounded-hd-lg border border-amber-200 bg-amber-50 p-hd-3 text-[11px] text-amber-900",
          className,
        )}
      >
        Memoria clínica no disponible en este momento.
      </section>
    );
  }

  const confidenceStatus =
    memoryView.confidence === "alta"
      ? "completed"
      : memoryView.confidence === "media"
        ? "pending"
        : "draft";

  return (
    <ClinicalCard
      className={cn(
        "border-l-[3px] border-l-primary/45 bg-gradient-to-br from-hd-surface-raised to-primaryLight/20",
        className,
      )}
    >
      <div className="mb-hd-3 space-y-hd-2">
        <h3
          className={cn(
            CLINICAL_SECTION_TITLE,
            "heydoctor-presence text-primary/90",
          )}
        >
          Clinical Memory™
        </h3>
        <ClinicalStatusBadge
          status={confidenceStatus}
          label={`Confidence: ${clinicalMemoryConfidenceLabel(memoryView.confidence)}`}
          className="w-fit"
        />
        <p className="text-xs font-medium text-slate-800">
          Lo importante de este paciente
        </p>
      </div>

      <ul className="space-y-2">
        {memoryView.highlights.map((line) => (
          <li
            key={line}
            className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-700"
          >
            <span className="mt-0.5 shrink-0 text-primary" aria-hidden>
              •
            </span>
            <span>{line}</span>
          </li>
        ))}
      </ul>
    </ClinicalCard>
  );
}
