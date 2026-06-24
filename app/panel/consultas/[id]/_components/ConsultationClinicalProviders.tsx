"use client";

import type { ReactNode } from "react";
import { ClinicalIntelligenceProvider } from "@/context/ClinicalIntelligenceContext";
import { ConsultationPlanProvider } from "@/context/ConsultationPlanProvider";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import type { UnifiedPlanApplyResult } from "@/lib/types/unified-clinical-plan";

export function ConsultationClinicalProviders({
  consultationId,
  patientId,
  clinicalFoundation,
  onPlanApplied,
  children,
}: {
  consultationId: string;
  patientId: string;
  clinicalFoundation?: ClinicalFoundationBundle | null;
  onPlanApplied?: (result: UnifiedPlanApplyResult) => void;
  children: ReactNode;
}) {
  return (
    <ClinicalIntelligenceProvider
      initialConsultationId={consultationId}
      initialPatientId={patientId}
      clinicalFoundation={clinicalFoundation}
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
