"use client";

import { useOptionalClinicalIntelligence } from "@/context/ClinicalIntelligenceContext";
import { useOptionalConsultationPlan } from "@/context/ConsultationPlanProvider";
import {
  firstLineOrFallback,
  formatDiagnosisPreview,
  formatPlanPreviewCounts,
} from "@/lib/soap-compact-preview";
import { cn } from "@/lib/utils";

const previewClass =
  "text-[11px] leading-snug text-slate-600 line-clamp-2";

export function SoapDiagnosisPreview({
  diagnosisCode,
  diagnosisDescription,
  diagnosis,
}: {
  diagnosisCode?: string | null;
  diagnosisDescription?: string | null;
  diagnosis: string;
}) {
  return (
    <p className={previewClass}>
      {formatDiagnosisPreview({
        code: diagnosisCode,
        description: diagnosisDescription,
        diagnosisText: diagnosis,
      })}
    </p>
  );
}

export function SoapPlanPreview() {
  const clinicalIntelligence = useOptionalClinicalIntelligence();
  const consultationPlan = useOptionalConsultationPlan();

  const hasDiagnosis = Boolean(
    clinicalIntelligence?.cie10CodeId ||
      clinicalIntelligence?.diagnosisContext?.code?.trim(),
  );

  const plan = consultationPlan?.plan;
  const medicationCount = plan?.medications.filter((i) => i.enabled).length ?? 0;
  const labCount = plan?.labs.filter((i) => i.enabled).length ?? 0;
  const recommendationCount =
    (plan?.education.filter((i) => i.enabled).length ?? 0) +
    (plan?.followUp.filter((i) => i.enabled).length ?? 0);

  return (
    <p className={previewClass}>
      {formatPlanPreviewCounts({
        actionCount: medicationCount,
        labCount,
        recommendationCount,
        loading: consultationPlan?.loading,
        hasDiagnosis,
      })}
    </p>
  );
}

export function SoapNotesPreview({ notes }: { notes: string }) {
  return (
    <p className={previewClass}>
      {firstLineOrFallback(notes, "Sin notas")}
    </p>
  );
}

export function SoapTreatmentPreview({ treatment }: { treatment: string }) {
  return (
    <p className={previewClass}>
      {firstLineOrFallback(treatment, "Sin tratamiento")}
    </p>
  );
}

export function SoapPreviewShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(className)}>{children}</div>;
}
