import type { ClinicalVitalSigns } from "./clinical-vital-signs-context";
import type { PhysicalExam } from "./physical-exam-framework";
import type { ClinicalRecord } from "./services/clinical-record";
import { EMPTY_CLINICAL_RECORD } from "./services/clinical-record";
import { EMPTY_PHYSICAL_EXAM } from "./physical-exam-framework";

export type EncounterNotesDraft = {
  clinicalRecord: ClinicalRecord;
  vitals: ClinicalVitalSigns;
  physicalExam: PhysicalExam;
};

export const EMPTY_ENCOUNTER_NOTES_DRAFT: EncounterNotesDraft = {
  clinicalRecord: {
    ...EMPTY_CLINICAL_RECORD,
    systemsReview: { ...EMPTY_CLINICAL_RECORD.systemsReview },
  },
  vitals: {},
  physicalExam: { ...EMPTY_PHYSICAL_EXAM },
};
