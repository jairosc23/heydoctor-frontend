"use client";

/**
 * P0 — Encounter-scoped HeyDoctor Copilot runtime tree.
 * Providers stay mounted for the Encounter (no reset on Workspace close).
 * Session bootstrap is LAZY: Workspace open, or explicit eager flag opt-in.
 * Encounter Memory SSOT mounts here (minimal in-encounter lifecycle).
 */

import { useEffect, useRef, type ReactNode } from "react";
import { ClinicalDictationProvider } from "@/context/ClinicalDictationContext";
import { ClinicalValidationProvider } from "@/context/ClinicalValidationContext";
import { ClinicalVoiceIntelligenceProvider } from "@/context/ClinicalVoiceIntelligenceContext";
import { ClinicalWorkflowProvider } from "@/context/ClinicalWorkflowContext";
import { EncounterMemoryProvider } from "@/context/EncounterMemoryContext";
import {
  MedicalCopilotProvider,
  useMedicalCopilot,
} from "@/context/MedicalCopilotContext";
import {
  recordCopilotBootstrapComplete,
  recordCopilotBootstrapStart,
} from "@/lib/brand/heydoctor-copilot-bootstrap-metrics";
import { isHeyDoctorCopilotEagerBootstrapEnabled } from "@/lib/brand/heydoctor-copilot-flags";

export type HeyDoctorCopilotRuntimeProvidersProps = {
  children: ReactNode;
  consultationId: string;
  patientId?: string | null;
  appointmentId?: string | null;
  /** Workspace open → triggers lazy bootstrap (default path). */
  workspaceOpen?: boolean;
  encounterStatus?: string | null;
  patientName?: string | null;
  patientAge?: string | number | null;
  patientSex?: string | null;
  activeProblems?: string[];
};

/** Restore/create session + 4 panel GETs (parallel after session). */
const ESTIMATED_BOOTSTRAP_REQUESTS = 5;

function HeyDoctorCopilotSessionBootstrap({
  consultationId,
  patientId,
  appointmentId,
  workspaceOpen = false,
}: {
  consultationId: string;
  patientId: string;
  appointmentId?: string | null;
  workspaceOpen?: boolean;
}) {
  const { bootstrap, session, loading } = useMedicalCopilot();
  const inFlightRef = useRef(false);
  const attemptedForOpenCycleRef = useRef(false);

  const eager = isHeyDoctorCopilotEagerBootstrapEnabled();
  const shouldBootstrap = eager || workspaceOpen;
  const mode = eager ? "eager_flag" : "lazy_workspace_open";

  useEffect(() => {
    if (!eager && !workspaceOpen) {
      attemptedForOpenCycleRef.current = false;
      return;
    }
    if (!shouldBootstrap) return;
    if (session?.sessionId) return;
    if (loading || inFlightRef.current) return;
    if (attemptedForOpenCycleRef.current) return;

    attemptedForOpenCycleRef.current = true;
    inFlightRef.current = true;
    recordCopilotBootstrapStart({ consultationId, mode });
    const startedAt =
      typeof performance !== "undefined" ? performance.now() : Date.now();

    void bootstrap({
      consultationId,
      patientId,
      appointmentId,
    }).finally(() => {
      const endedAt =
        typeof performance !== "undefined" ? performance.now() : Date.now();
      recordCopilotBootstrapComplete({
        latencyMs: Math.round(endedAt - startedAt),
        estimatedRequests: ESTIMATED_BOOTSTRAP_REQUESTS,
      });
      inFlightRef.current = false;
    });
  }, [
    appointmentId,
    bootstrap,
    consultationId,
    eager,
    loading,
    mode,
    patientId,
    session?.sessionId,
    shouldBootstrap,
    workspaceOpen,
  ]);

  return null;
}

export function HeyDoctorCopilotRuntimeProviders({
  children,
  consultationId,
  patientId,
  appointmentId = null,
  workspaceOpen = false,
  encounterStatus = null,
  patientName = null,
  patientAge = null,
  patientSex = null,
  activeProblems = [],
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
              <EncounterMemoryProvider
                consultationId={consultationId}
                patientId={patientId}
                encounterStatus={encounterStatus}
                patientName={patientName}
                patientAge={patientAge}
                patientSex={patientSex}
                activeProblems={activeProblems}
              >
                <HeyDoctorCopilotSessionBootstrap
                  consultationId={consultationId}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  workspaceOpen={workspaceOpen}
                />
                {children}
              </EncounterMemoryProvider>
            </ClinicalValidationProvider>
          </ClinicalWorkflowProvider>
        </ClinicalVoiceIntelligenceProvider>
      </ClinicalDictationProvider>
    </MedicalCopilotProvider>
  );
}
