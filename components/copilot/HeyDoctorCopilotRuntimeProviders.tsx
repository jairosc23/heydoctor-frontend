"use client";

/**
 * P0 — Encounter-scoped HeyDoctor Copilot runtime tree.
 * One session · one runtime · mounts existing providers (no renames).
 * When patientId is missing, children render without the runtime tree.
 */

import { useEffect, type ReactNode } from "react";
import { ClinicalDictationProvider } from "@/context/ClinicalDictationContext";
import { ClinicalValidationProvider } from "@/context/ClinicalValidationContext";
import { ClinicalVoiceIntelligenceProvider } from "@/context/ClinicalVoiceIntelligenceContext";
import { ClinicalWorkflowProvider } from "@/context/ClinicalWorkflowContext";
import {
  MedicalCopilotProvider,
  useMedicalCopilot,
} from "@/context/MedicalCopilotContext";

export type HeyDoctorCopilotRuntimeProvidersProps = {
  children: ReactNode;
  consultationId: string;
  patientId?: string | null;
  appointmentId?: string | null;
};

function HeyDoctorCopilotSessionBootstrap({
  consultationId,
  patientId,
  appointmentId,
}: {
  consultationId: string;
  patientId: string;
  appointmentId?: string | null;
}) {
  const { bootstrap } = useMedicalCopilot();

  useEffect(() => {
    void bootstrap({
      consultationId,
      patientId,
      appointmentId,
    });
  }, [appointmentId, bootstrap, consultationId, patientId]);

  return null;
}

export function HeyDoctorCopilotRuntimeProviders({
  children,
  consultationId,
  patientId,
  appointmentId = null,
}: HeyDoctorCopilotRuntimeProvidersProps) {
  if (!patientId) {
    return <>{children}</>;
  }

  return (
    <MedicalCopilotProvider>
      <ClinicalDictationProvider consultationId={consultationId}>
        <ClinicalVoiceIntelligenceProvider>
          <ClinicalWorkflowProvider
            consultationId={consultationId}
            patientId={patientId}
          >
            <ClinicalValidationProvider cohortTag="clinical_beta">
              <HeyDoctorCopilotSessionBootstrap
                consultationId={consultationId}
                patientId={patientId}
                appointmentId={appointmentId}
              />
              {children}
            </ClinicalValidationProvider>
          </ClinicalWorkflowProvider>
        </ClinicalVoiceIntelligenceProvider>
      </ClinicalDictationProvider>
    </MedicalCopilotProvider>
  );
}
