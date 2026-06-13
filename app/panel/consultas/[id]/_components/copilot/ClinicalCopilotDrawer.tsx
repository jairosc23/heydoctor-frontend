"use client";

import { useEffect, useMemo } from "react";
import { useDoctorDna } from "@/hooks/useDoctorDna";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { buildClinicalMemoryView } from "@/lib/clinical-memory";
import { buildClinicalCopilotIntelligence, COPILOT_SILENCE_MESSAGE } from "@/lib/clinical-copilot-intelligence";
import { buildDoctorDnaIntelligenceView } from "@/lib/doctor-dna-intelligence";
import { cn } from "@/lib/utils";
import {
  CLINICAL_OVERLAY_BACKDROP_CLASS,
  CLINICAL_OVERLAY_PANEL_CLASS,
} from "@/lib/clinical-overlay-contract";
import { CopilotActionSystem } from "./CopilotActionSystem";
import { CopilotContextEngine } from "./CopilotContextEngine";
import { CopilotDocumentationGaps } from "./CopilotDocumentationGaps";
import { CopilotDocumentationQuality } from "./CopilotDocumentationQuality";
import { CopilotGovernanceBoundary } from "./CopilotGovernanceBoundary";
import { CopilotInsightCards } from "./CopilotInsightCards";
import { CopilotRiskSignals } from "./CopilotRiskSignals";

export interface ClinicalCopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  consultationId?: string | null;
  patientId?: string | null;
  diagnosis?: string | null;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  chiefComplaint?: string | null;
  treatment?: string | null;
  notes?: string | null;
  patientName?: string | null;
  patientAge?: string | number | null;
  patientSex?: string | null;
}

export function ClinicalCopilotDrawer({
  open,
  onClose,
  consultationId,
  patientId,
  diagnosis,
  diagnosisCode,
  diagnosisDescription,
  chiefComplaint,
  treatment,
  notes,
  patientName,
  patientAge,
  patientSex,
}: ClinicalCopilotDrawerProps) {
  const { data: clinicalMemoryData } = usePatientClinicalMemory(
    open ? patientId : null,
  );
  const { data: doctorDnaData, loading: dnaLoading, error: dnaError } =
    useDoctorDna();

  const clinicalMemory = useMemo(
    () =>
      patientId
        ? buildClinicalMemoryView({
            memory: clinicalMemoryData,
            encounterDiagnosis:
              diagnosisDescription?.trim() || diagnosis?.trim() || null,
          })
        : null,
    [clinicalMemoryData, diagnosis, diagnosisDescription, patientId],
  );

  const doctorDna = useMemo(
    () =>
      !dnaLoading && !dnaError
        ? buildDoctorDnaIntelligenceView(doctorDnaData)
        : null,
    [doctorDnaData, dnaLoading, dnaError],
  );

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
        patientName,
        patientAge,
        patientSex,
        clinicalMemory,
        clinicalMemoryRaw: clinicalMemoryData.patientId
          ? clinicalMemoryData
          : null,
        doctorDna,
      }),
    [
      consultationId,
      diagnosis,
      diagnosisCode,
      diagnosisDescription,
      chiefComplaint,
      treatment,
      notes,
      patientName,
      patientAge,
      patientSex,
      clinicalMemory,
      clinicalMemoryData,
      doctorDna,
    ],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Cerrar Clinical Copilot"
        className={cn(
          "clinical-drawer-enter fixed inset-0 bg-slate-900/10",
          CLINICAL_OVERLAY_BACKDROP_CLASS.intelligence,
        )}
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Clinical Copilot"
        className={cn(
          "clinical-drawer-enter fixed inset-y-0 left-0 flex w-full max-w-md flex-col",
          "border-r border-hd-border-subtle bg-hd-surface-chrome shadow-hd-3",
          CLINICAL_OVERLAY_PANEL_CLASS.intelligence,
        )}
      >
        <header className="shrink-0 border-b border-hd-border-subtle px-hd-4 py-hd-3">
          <div className="heydoctor-presence">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              Phase 4.7B Noise Reduction
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              Clinical Copilot™
            </h2>
            <p className="text-[10px] text-slate-500">
              Menos ruido — observaciones con valor clínico
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel"
            className="clinical-interactive absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-hd-md text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 space-y-hd-5 overflow-y-auto px-hd-4 py-hd-4">
          <CopilotGovernanceBoundary />
          {intelligence.silenceMode ? (
            <p
              role="status"
              className="rounded-hd-md border border-slate-200/80 bg-slate-50/80 px-hd-3 py-hd-2 text-[11px] text-slate-600"
            >
              {COPILOT_SILENCE_MESSAGE}
            </p>
          ) : null}
          <CopilotDocumentationQuality quality={intelligence.documentationQuality} />
          <CopilotContextEngine context={intelligence.context} />
          <CopilotInsightCards insights={intelligence.insights} />
          <CopilotRiskSignals signals={intelligence.riskSignals} />
          <CopilotDocumentationGaps gaps={intelligence.documentationGaps} />
          <CopilotActionSystem />
        </div>
      </aside>
    </>
  );
}

export function ClinicalCopilotTrigger({
  onClick,
  active = false,
  className,
}: {
  onClick: () => void;
  active?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Abrir Clinical Copilot"
      title="Clinical Copilot"
      className={cn(
        "clinical-interactive inline-flex h-8 items-center gap-1 rounded-hd-md border px-2 text-xs font-medium",
        active
          ? "border-primary bg-primaryLight text-primary"
          : "border-hd-border-subtle bg-hd-surface-raised text-slate-600 hover:bg-hd-surface-muted",
        className,
      )}
    >
      <span aria-hidden>✨</span>
      <span className="hidden md:inline">Copilot</span>
    </button>
  );
}
