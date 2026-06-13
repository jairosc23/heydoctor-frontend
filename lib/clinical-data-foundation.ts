/**
 * Phase 4.5.2 — Clinical Data Foundation™
 * Agregador de vitales, examen físico y contexto longitudinal.
 */

import {
  formatClinicalVitalSignsForContext,
  parseClinicalVitalSignsFromNotes,
  type ClinicalVitalSignsContext,
} from "./clinical-vital-signs-context";
import {
  formatLongitudinalSummaryForContext,
  buildLongitudinalSummary,
  type LongitudinalSummary,
} from "./longitudinal-summary";
import {
  formatPhysicalExamForContext,
  resolvePhysicalExamFromNotes,
  type PhysicalExam,
} from "./physical-exam-framework";
import type { PatientClinicalMemory } from "./types/clinical-memory";

export type ClinicalDataFoundation = {
  vitalSigns: ClinicalVitalSignsContext;
  physicalExam: PhysicalExam;
  longitudinal: LongitudinalSummary;
};

export type BuildClinicalDataFoundationInput = {
  encounterNotes?: string | null;
  treatment?: string | null;
  memory?: PatientClinicalMemory | null;
  currentConsultationId?: string | null;
};

export function buildClinicalDataFoundation(
  input: BuildClinicalDataFoundationInput,
): ClinicalDataFoundation {
  const notes = input.encounterNotes ?? "";
  const vitalSigns = parseClinicalVitalSignsFromNotes(notes, input.treatment);
  const physicalExam = resolvePhysicalExamFromNotes(notes);
  const longitudinal = buildLongitudinalSummary(input.memory, {
    currentConsultationId: input.currentConsultationId,
  });

  return { vitalSigns, physicalExam, longitudinal };
}

export function formatClinicalDataFoundationPrompt(
  foundation: ClinicalDataFoundation,
): string {
  const blocks = [
    formatClinicalVitalSignsForContext(foundation.vitalSigns),
    formatPhysicalExamForContext(foundation.physicalExam),
    formatLongitudinalSummaryForContext(foundation.longitudinal),
  ].filter((b): b is string => Boolean(b?.trim()));

  return blocks.join("\n\n");
}

export function clinicalDataFoundationHasContent(
  foundation: ClinicalDataFoundation,
): boolean {
  return (
    foundation.vitalSigns.hasData ||
    formatPhysicalExamForContext(foundation.physicalExam) != null ||
    foundation.longitudinal.hasData
  );
}
