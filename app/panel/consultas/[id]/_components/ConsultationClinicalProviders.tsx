"use client";

import type { ReactNode } from "react";
import { ClinicalIntelligenceProvider } from "@/context/ClinicalIntelligenceContext";
import { ConsultationPlanProvider } from "@/context/ConsultationPlanProvider";

export function ConsultationClinicalProviders({
  consultationId,
  patientId,
  children,
}: {
  consultationId: string;
  patientId: string;
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
      >
        {children}
      </ConsultationPlanProvider>
    </ClinicalIntelligenceProvider>
  );
}
