"use client";

import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import { PhysicalExamSection } from "./PhysicalExamSection";
import { VitalSignsSection } from "./VitalSignsSection";

export interface ClinicalEncounterChartProps {
  vitals: ClinicalVitalSigns;
  onVitalsChange: (vitals: ClinicalVitalSigns) => void;
  physicalExam: PhysicalExam;
  onPhysicalExamChange: (exam: PhysicalExam) => void;
  editable: boolean;
  className?: string;
}

export function ClinicalEncounterChart({
  vitals,
  onVitalsChange,
  physicalExam,
  onPhysicalExamChange,
  editable,
  className,
}: ClinicalEncounterChartProps) {
  return (
    <div
      className={className}
      data-testid="clinical-encounter-chart"
      aria-label="Ficha clínica médica integral"
    >
      <div className="space-y-hd-4">
        <VitalSignsSection
          vitals={vitals}
          onChange={onVitalsChange}
          editable={editable}
        />
        <PhysicalExamSection
          exam={physicalExam}
          onChange={onPhysicalExamChange}
          editable={editable}
        />
      </div>
    </div>
  );
}
