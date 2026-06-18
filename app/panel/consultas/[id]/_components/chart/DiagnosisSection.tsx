"use client";

import { DiagnosisBadge, SmartDiagnosisPicker } from "@/components/clinical";
import {
  getDiagnosisBadgeVariant,
  type DiagnosisSource,
} from "@/lib/services/consultation-diagnosis";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

export interface DiagnosisSectionProps {
  clinicId: string | null;
  diagnosis: string;
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  diagnosisSource?: DiagnosisSource;
  diagnosisError: string | null;
  onDiagnosisConfirm: (item: {
    code: string;
    description: string;
    cie10CodeId?: string;
  }) => void | Promise<void>;
  editable: boolean;
}

export function DiagnosisSection({
  clinicId,
  diagnosis,
  diagnosisCode,
  diagnosisDescription,
  diagnosisSource = "empty",
  diagnosisError,
  onDiagnosisConfirm,
  editable,
}: DiagnosisSectionProps) {
  const badgeVariant = getDiagnosisBadgeVariant(diagnosisSource);

  return (
    <ClinicalEncounterSection sectionNumber={11} title="Diagnósticos CIE-10">
      <fieldset disabled={!editable} className="min-w-0 border-0 p-0">
        {(diagnosisCode || diagnosisDescription) && badgeVariant ? (
          <DiagnosisBadge
            code={diagnosisCode}
            description={diagnosisDescription}
            variant={badgeVariant}
            className="mb-hd-2"
          />
        ) : null}
        <SmartDiagnosisPicker
          value={diagnosis}
          onChange={() => {}}
          onConfirm={onDiagnosisConfirm}
          clinicId={clinicId}
        />
        {diagnosisError ? (
          <p
            role="alert"
            className="clinical-status clinical-status--critical mt-hd-2 rounded-hd-md border px-hd-2 py-hd-2 text-xs"
          >
            {diagnosisError}
          </p>
        ) : null}
      </fieldset>
    </ClinicalEncounterSection>
  );
}
