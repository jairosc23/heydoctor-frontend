"use client";

import { useMemo } from "react";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { buildClinicalMemoryView } from "@/lib/clinical-memory";
import {
  buildClinicalCopilotIntelligence,
  getQualityLabelStyles,
} from "@/lib/clinical-copilot-intelligence";
import {
  buildClinicalCloseFlowView,
  closeFlowStatusIcon,
  type CloseFlowItem,
  type CloseFlowPhase,
} from "@/lib/clinical-close-flow";
import { CLINICAL_SECTION_TITLE } from "@/lib/clinical-design-tokens";
import type { AutosaveStatus } from "@/lib/hooks/useConsultationAutosave";
import { cn } from "@/lib/utils";

export type ClinicalCloseFlowProps = {
  consultationId: string;
  patientId?: string | null;
  consultationStatus: string;
  chiefComplaint?: string | null;
  notes?: string | null;
  diagnosis?: string | null;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  treatment?: string | null;
  autosaveStatus?: AutosaveStatus;
  isSigned: boolean;
  isLocked: boolean;
  canPay: boolean;
  onOpenCopilot?: () => void;
  className?: string;
};

function statusTone(status: CloseFlowItem["status"]): string {
  switch (status) {
    case "complete":
      return "text-emerald-700";
    case "attention":
      return "text-amber-700";
    case "pending":
      return "text-slate-500";
    default:
      return "text-slate-400";
  }
}

function CloseFlowItemRow({ item }: { item: CloseFlowItem }) {
  if (item.status === "na") return null;
  return (
    <li className="flex items-start gap-2 text-[11px] leading-snug">
      <span
        className={cn("mt-0.5 w-3 shrink-0 font-semibold", statusTone(item.status))}
        aria-hidden
      >
        {closeFlowStatusIcon(item.status)}
      </span>
      <span className="min-w-0">
        <span className="font-medium text-slate-800">{item.label}</span>
        {item.detail ? (
          <span className="mt-0.5 block text-slate-500">{item.detail}</span>
        ) : null}
      </span>
    </li>
  );
}

function CloseFlowPhaseBlock({
  phase,
  onOpenCopilot,
}: {
  phase: CloseFlowPhase;
  onOpenCopilot?: () => void;
}) {
  if (phase.status === "na") return null;
  return (
    <div className="min-w-0 flex-1">
      <div className="mb-1 flex items-center gap-2">
        <span
          className={cn("text-xs font-semibold", statusTone(phase.status))}
          aria-hidden
        >
          {closeFlowStatusIcon(phase.status)}
        </span>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-700">
          {phase.label}
        </p>
      </div>
      <ul className="space-y-1.5 pl-5">
        {phase.items.map((item) => (
          <CloseFlowItemRow key={item.id} item={item} />
        ))}
      </ul>
      {phase.id === "review" &&
      phase.status === "attention" &&
      onOpenCopilot ? (
        <button
          type="button"
          onClick={onOpenCopilot}
          className="clinical-interactive mt-2 pl-5 text-[11px] font-semibold text-primary hover:underline"
        >
          Abrir Clinical Copilot™
        </button>
      ) : null}
    </div>
  );
}

export function ClinicalCloseFlow({
  consultationId,
  patientId,
  consultationStatus,
  chiefComplaint,
  notes,
  diagnosis,
  diagnosisCode,
  diagnosisDescription,
  treatment,
  autosaveStatus,
  isSigned,
  isLocked,
  canPay,
  onOpenCopilot,
  className,
}: ClinicalCloseFlowProps) {
  const { data: clinicalMemoryData } = usePatientClinicalMemory(patientId ?? null);

  const intelligence = useMemo(
    () =>
      buildClinicalCopilotIntelligence({
        consultationId,
        diagnosis,
        diagnosisCode,
        diagnosisDescription,
        chiefComplaint,
        treatment,
        notes,
        clinicalMemory: patientId
          ? buildClinicalMemoryView({
              memory: clinicalMemoryData,
              encounterDiagnosis:
                diagnosisDescription?.trim() || diagnosis?.trim() || null,
            })
          : null,
        clinicalMemoryRaw: clinicalMemoryData.patientId
          ? clinicalMemoryData
          : null,
      }),
    [
      consultationId,
      diagnosis,
      diagnosisCode,
      diagnosisDescription,
      chiefComplaint,
      treatment,
      notes,
      patientId,
      clinicalMemoryData,
    ],
  );

  const view = useMemo(
    () =>
      buildClinicalCloseFlowView({
        consultationStatus,
        chiefComplaint,
        notes,
        diagnosis: diagnosisDescription || diagnosis,
        treatment,
        autosaveStatus,
        documentationGaps: intelligence.documentationGaps,
        documentationQuality: intelligence.documentationQuality,
        isSigned,
        isLocked,
        canPay,
        hasPatient: Boolean(patientId),
        pendingLabsCount: intelligence.context.pendingLabs.length,
      }),
    [
      consultationStatus,
      chiefComplaint,
      notes,
      diagnosis,
      diagnosisDescription,
      treatment,
      autosaveStatus,
      intelligence,
      isSigned,
      isLocked,
      canPay,
      patientId,
    ],
  );

  return (
    <section
      aria-label="Clinical Close Flow"
      className={cn(
        "rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised px-hd-3 py-hd-3 shadow-hd-1",
        className,
      )}
    >
      <div className="mb-hd-3 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className={CLINICAL_SECTION_TITLE}>Clinical Close Flow™</h2>
          <p className="text-[11px] text-slate-500">
            Guía visual — no bloquea firma ni cierre
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
            {view.consultationStatusLabel}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase",
              getQualityLabelStyles(view.qualityLabel),
            )}
          >
            Quality {view.qualityScore}
          </span>
        </div>
      </div>

      <div className="grid gap-hd-4 md:grid-cols-2 xl:grid-cols-4">
        {view.phases.map((phase) => (
          <CloseFlowPhaseBlock
            key={phase.id}
            phase={phase}
            onOpenCopilot={onOpenCopilot}
          />
        ))}
      </div>
    </section>
  );
}
