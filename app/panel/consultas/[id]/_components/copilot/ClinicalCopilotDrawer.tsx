"use client";

import { useEffect, useMemo } from "react";
import { usePatientClinicalMemory } from "@/hooks/usePatientClinicalMemory";
import { buildClinicalMemoryView } from "@/lib/clinical-memory";
import { buildCopilotContextFromEncounter } from "@/lib/clinical-copilot-mock";
import { cn } from "@/lib/utils";
import { CopilotActionSystem } from "./CopilotActionSystem";
import { CopilotContextEngine } from "./CopilotContextEngine";
import { CopilotGovernanceBoundary } from "./CopilotGovernanceBoundary";
import { CopilotInsightCards } from "./CopilotInsightCards";

export interface ClinicalCopilotDrawerProps {
  open: boolean;
  onClose: () => void;
  patientId?: string | null;
  diagnosis?: string | null;
  diagnosisDescription?: string | null;
  treatment?: string | null;
  notes?: string | null;
  patientName?: string | null;
}

export function ClinicalCopilotDrawer({
  open,
  onClose,
  patientId,
  diagnosis,
  diagnosisDescription,
  treatment,
  notes,
  patientName,
}: ClinicalCopilotDrawerProps) {
  const { data: clinicalMemoryData } = usePatientClinicalMemory(
    open ? patientId : null,
  );

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

  const context = useMemo(
    () =>
      buildCopilotContextFromEncounter({
        diagnosis,
        diagnosisDescription,
        treatment,
        notes,
        patientName,
        clinicalMemory,
      }),
    [
      diagnosis,
      diagnosisDescription,
      treatment,
      notes,
      patientName,
      clinicalMemory,
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
        className="fixed inset-0 z-40 bg-slate-900/10 clinical-drawer-enter"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="false"
        aria-label="Clinical Copilot"
        className={cn(
          "clinical-drawer-enter fixed inset-y-0 left-0 z-50 flex w-full max-w-md flex-col",
          "border-r border-hd-border-subtle bg-hd-surface-chrome shadow-hd-3",
        )}
      >
        <header className="shrink-0 border-b border-hd-border-subtle px-hd-4 py-hd-3">
          <div className="heydoctor-presence">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              Phase 4.0 Foundation
            </p>
            <h2 className="text-sm font-semibold text-slate-900">
              Clinical Copilot™
            </h2>
            <p className="text-[10px] text-slate-500">
              Asistente clínico — shell sin IA conectada
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
          <CopilotContextEngine context={context} />
          <CopilotInsightCards />
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
