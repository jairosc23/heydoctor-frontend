"use client";

import { useEffect } from "react";
import { useClinicalIntelligence } from "@/context/ClinicalIntelligenceContext";
import type { ConsultationDiagnosisState } from "@/lib/services/consultation-diagnosis";

export function ClinicalIntelligenceSync({
  consultationId,
  patientId,
  diagnosisState,
}: {
  consultationId: string;
  patientId: string | null | undefined;
  diagnosisState: ConsultationDiagnosisState;
}) {
  const { setConsultationScope, setDiagnosis } = useClinicalIntelligence();

  useEffect(() => {
    setConsultationScope({
      consultationId,
      patientId: patientId ?? null,
    });
  }, [consultationId, patientId, setConsultationScope]);

  useEffect(() => {
    if (diagnosisState.cie10CodeId && diagnosisState.diagnosisCode) {
      setDiagnosis({
        cie10CodeId: diagnosisState.cie10CodeId,
        code: diagnosisState.diagnosisCode,
        description:
          diagnosisState.diagnosisDescription?.trim() ||
          diagnosisState.diagnosis?.trim() ||
          diagnosisState.diagnosisCode,
      });
      return;
    }
    setDiagnosis(null);
  }, [
    diagnosisState.cie10CodeId,
    diagnosisState.diagnosisCode,
    diagnosisState.diagnosisDescription,
    diagnosisState.diagnosis,
    setDiagnosis,
  ]);

  return null;
}
