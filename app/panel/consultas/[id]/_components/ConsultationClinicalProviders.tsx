"use client";

import type { ReactNode } from "react";
import { ClinicalIntelligenceProvider } from "@/context/ClinicalIntelligenceContext";
import { ConsultationPlanProvider } from "@/context/ConsultationPlanProvider";
import type { UnifiedPlanApplyResult } from "@/lib/types/unified-clinical-plan";

export function ConsultationClinicalProviders({
  consultationId,
  patientId,
  onPlanApplied,
  children,
}: {
  consultationId: string;
  patientId: string;
  onPlanApplied?: (result: UnifiedPlanApplyResult) => void;
  children: ReactNode;
}) {
  return (
    <ClinicalIntelligenceProvider
      initialConsultationId={consultationId}
      initialPatientId={patientId}
    >
      <ConsultationPlanProvider
        patientId={patientId}
        consultationId={consultationId}
        onPlanApplied={onPlanApplied}
      >
        {children}
      </ConsultationPlanProvider>
    </ClinicalIntelligenceProvider>
  );
}
