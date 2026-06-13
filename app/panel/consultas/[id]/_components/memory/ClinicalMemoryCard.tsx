"use client";

import { useMemo } from "react";
import { ClinicalCard, ClinicalStatusBadge } from "@/components/clinical/design";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import {
  buildClinicalMemoryView,
  clinicalMemoryConfidenceLabel,
} from "@/lib/clinical-memory";
import { partitionMemoryHighlights } from "@/lib/clinical-memory-prioritization";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { cn } from "@/lib/utils";

const COMPACT_VISIBLE_HIGHLIGHTS = 3;

export interface ClinicalMemoryCardProps {
  patientId: string;
  encounterDiagnosis?: string | null;
  snapshotConditionLabels?: string[];
  allergyLines?: string[];
  /** Phase 4.3 — densidad reducida en Context Rail. */
  compact?: boolean;
  className?: string;
}

export function ClinicalMemoryCard({
  patientId,
  encounterDiagnosis,
  snapshotConditionLabels,
  allergyLines = [],
  compact = false,
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
          "rounded-hd-lg border border-hd-border-subtle bg-hd-surface-muted/60",
          compact ? "p-hd-2" : "p-hd-3",
          className,
        )}
      >
        <div className="animate-pulse space-y-2">
          <div className="h-3 w-1/2 rounded bg-slate-200" />
          <div className={cn("w-full rounded bg-slate-100", compact ? "h-8" : "h-12")} />
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
          "rounded-hd-lg border border-amber-200 bg-amber-50 p-hd-2 text-[11px] text-amber-900",
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

  const primaryHighlights = compact
    ? partitionMemoryHighlights({
        highlights: memoryView.highlights,
        allergyLines,
        alerts: data.alerts,
        compactVisibleSlots: COMPACT_VISIBLE_HIGHLIGHTS,
      })
    : {
        visible: memoryView.highlights.map((text) => ({
          id: text,
          text,
          tier: "standard" as const,
        })),
        overflow: [],
      };
  const extraHighlights = compact ? primaryHighlights.overflow : [];
  const visibleHighlights = compact ? primaryHighlights.visible : primaryHighlights.visible;

  return (
    <ClinicalCard
      className={cn(
        "border-l-[3px] border-l-primary/45 bg-gradient-to-br from-hd-surface-raised to-primaryLight/20",
        compact && "p-hd-2",
        className,
      )}
      data-variant={compact ? "compact" : "default"}
    >
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-2 gap-y-1",
          compact ? "mb-hd-2" : "mb-hd-3 space-y-hd-2",
        )}
      >
        <h3
          className={cn(
            CLINICAL_SECTION_TITLE,
            "heydoctor-presence mb-0 text-primary/90",
            compact && "text-[10px]",
          )}
        >
          Clinical Memory™
        </h3>
        <ClinicalStatusBadge
          status={confidenceStatus}
          label={
            compact
              ? clinicalMemoryConfidenceLabel(memoryView.confidence)
              : `Confidence: ${clinicalMemoryConfidenceLabel(memoryView.confidence)}`
          }
          className="w-fit"
        />
        {!compact ? (
          <p className="w-full text-xs font-medium text-slate-800">
            Lo importante de este paciente
          </p>
        ) : null}
      </div>

      <ul className={cn(compact ? "space-y-1" : "space-y-2")}>
        {visibleHighlights.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-1.5 text-[11px] leading-snug",
              item.tier === "allergy" || item.tier === "critical"
                ? "font-medium text-amber-900"
                : item.tier === "high_risk"
                  ? "text-amber-800"
                  : "text-slate-700",
            )}
          >
            <span
              className={cn(
                "mt-0.5 shrink-0",
                item.tier === "allergy" || item.tier === "critical"
                  ? "text-amber-600"
                  : "text-primary",
              )}
              aria-hidden
            >
              •
            </span>
            <span>{item.text}</span>
          </li>
        ))}
      </ul>

      {compact && extraHighlights.length > 0 ? (
        <details className="mt-hd-1">
          <summary className="clinical-interactive cursor-pointer list-none text-[10px] font-medium text-primary hover:underline [&::-webkit-details-marker]:hidden">
            +{extraHighlights.length} más
          </summary>
          <ul className="mt-hd-1 space-y-1 border-t border-hd-border-subtle pt-hd-1">
            {extraHighlights.map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-1.5 text-[11px] leading-snug text-slate-600"
              >
                <span className="mt-0.5 shrink-0 text-slate-400" aria-hidden>
                  •
                </span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </ClinicalCard>
  );
}
