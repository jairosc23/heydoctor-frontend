"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { MedicalCopilotWorkspace } from "@/components/medical-copilot";
import { ClinicalDictationPanel } from "@/components/medical-copilot/ClinicalDictationPanel";
import { ClinicalVoiceSuggestionsPanel } from "@/components/medical-copilot/ClinicalVoiceSuggestionsPanel";
import { ClinicalFeedbackPanel } from "@/components/medical-copilot/ClinicalFeedbackPanel";
import { ClinicalWorkflowBanner } from "@/components/medical-copilot/ClinicalWorkflowBanner";
import { ClinicalWorkflowTelemetryBridge } from "@/components/medical-copilot/ClinicalWorkflowTelemetryBridge";
import {
  MedicalCopilotErrorState,
  MedicalCopilotLoadingState,
} from "@/components/medical-copilot/states";
import { ClinicalDictationProvider } from "@/context/ClinicalDictationContext";
import { ClinicalValidationProvider } from "@/context/ClinicalValidationContext";
import { ClinicalVoiceIntelligenceProvider } from "@/context/ClinicalVoiceIntelligenceContext";
import { ClinicalWorkflowProvider } from "@/context/ClinicalWorkflowContext";
import { MedicalCopilotProvider } from "@/context/MedicalCopilotContext";
import { isMedicalCopilotEnabled } from "@/lib/medical-copilot/enabled";
import { fetchConsultation } from "@/lib/services/consultations";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

/**
 * RC-2 — Kill switch + Session Ownership + Auth recovery entry.
 * CB-1/CB-2/CB-3 surfaces mount only when Medical Copilot is enabled.
 */
export default function MedicalCopilotPage() {
  const params = useParams();
  const consultationId =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
        ? params.id[0]
        : "";

  const [patientId, setPatientId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copilotEnabled, setCopilotEnabled] = useState(true);

  useEffect(() => {
    setCopilotEnabled(isMedicalCopilotEnabled());
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!consultationId) {
        setError("Consulta no válida");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const consultation = await fetchConsultation(consultationId);
        const resolvedPatientId =
          consultation.patientId ||
          (consultation as { patient?: { id?: string } }).patient?.id ||
          null;
        if (!resolvedPatientId) {
          throw new Error("La consulta no tiene patientId asociado");
        }
        if (!cancelled) {
          setPatientId(resolvedPatientId);
        }
      } catch (err) {
        if (!cancelled) {
          setError(getApiErrorMessage(err));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [consultationId]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href={`/panel/consultas/${consultationId}`}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← Volver a la consulta
          </Link>
          <span className="text-xs text-slate-500">
            Medical Copilot v1.0 · RC
          </span>
        </div>
      </div>

      {loading ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <MedicalCopilotLoadingState label="Preparando consulta…" />
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <MedicalCopilotErrorState message={error} />
        </div>
      ) : null}

      {!loading && !error && !copilotEnabled ? (
        <div
          className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8"
          data-testid="medical-copilot-kill-switch"
        >
          <MedicalCopilotErrorState
            title="Medical Copilot deshabilitado"
            message="El Medical Copilot está desactivado por kill switch / feature flag. La consulta clínica, el EMR y la autenticación no se ven afectados. Vuelva a la consulta para continuar el trabajo clínico."
          />
          <div className="mt-4">
            <Link
              href={`/panel/consultas/${consultationId}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              Ir a la consulta clínica
            </Link>
          </div>
        </div>
      ) : null}

      {!loading && !error && patientId && copilotEnabled ? (
        <MedicalCopilotProvider>
          <ClinicalDictationProvider consultationId={consultationId}>
            <ClinicalVoiceIntelligenceProvider>
              <ClinicalWorkflowProvider
                consultationId={consultationId}
                patientId={patientId}
              >
                <ClinicalValidationProvider cohortTag="clinical_beta">
                  <ClinicalWorkflowTelemetryBridge />
                  <div
                    className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"
                    data-testid="medical-copilot-active-shell"
                  >
                    <ClinicalWorkflowBanner />
                    <ClinicalDictationPanel />
                    <ClinicalVoiceSuggestionsPanel />
                    <ClinicalFeedbackPanel />
                  </div>
                  <MedicalCopilotWorkspace
                    consultationId={consultationId}
                    patientId={patientId}
                  />
                </ClinicalValidationProvider>
              </ClinicalWorkflowProvider>
            </ClinicalVoiceIntelligenceProvider>
          </ClinicalDictationProvider>
        </MedicalCopilotProvider>
      ) : null}
    </div>
  );
}
