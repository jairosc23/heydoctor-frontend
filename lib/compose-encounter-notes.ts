import type { EncounterNotesDraft } from "./encounter-notes-types";
import {
  normalizeClinicalVitalSigns,
  parseClinicalVitalSignsFromNotes,
  serializeClinicalVitalSigns,
  VITAL_SIGNS_END,
  VITAL_SIGNS_MARKER,
} from "./clinical-vital-signs-context";
import {
  EMPTY_PHYSICAL_EXAM,
  serializePhysicalExam,
  parsePhysicalExamMarkerOnly,
  PHYSICAL_EXAM_END,
  PHYSICAL_EXAM_MARKER,
} from "./physical-exam-framework";
import {
  parseClinicalRecord,
  serializeClinicalRecord,
} from "./services/clinical-record";

const RECORD_MARKER = "[[HD_CR_V1]]";
const RECORD_END = "[[/HD_CR_V1]]";

const MARKER_BLOCKS = [
  { start: RECORD_MARKER, end: RECORD_END },
  { start: VITAL_SIGNS_MARKER, end: VITAL_SIGNS_END },
  { start: PHYSICAL_EXAM_MARKER, end: PHYSICAL_EXAM_END },
] as const;

function stripMarkerBlock(text: string, startMarker: string, endMarker: string): string {
  let result = text;
  for (;;) {
    const start = result.indexOf(startMarker);
    if (start === -1) break;
    const end = result.indexOf(endMarker, start);
    const removeEnd = end >= 0 ? end + endMarker.length : result.length;
    const before = result.slice(0, start).trimEnd();
    const after = end >= 0 ? result.slice(removeEnd).trimStart() : "";
    result = [before, after].filter(Boolean).join("\n\n");
  }
  return result;
}

export function stripAllEncounterMarkers(notes: string): string {
  let result = notes;
  for (const block of MARKER_BLOCKS) {
    result = stripMarkerBlock(result, block.start, block.end);
  }
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

export function parseEncounterNotes(
  raw: string | null | undefined,
): EncounterNotesDraft {
  const notes = raw ?? "";
  const record = parseClinicalRecord(notes);
  const vitals = normalizeClinicalVitalSigns(
    parseClinicalVitalSignsFromNotes(notes).vitals,
    { convertHeightMetersToCm: false },
  );
  const physicalExam = parsePhysicalExamMarkerOnly(notes);
  const freeNotes = stripAllEncounterMarkers(notes);

  return {
    clinicalRecord: {
      ...record,
      freeNotes,
    },
    vitals,
    physicalExam: physicalExam ?? { ...EMPTY_PHYSICAL_EXAM },
  };
}

export function composeEncounterNotes(draft: EncounterNotesDraft): string {
  const parts: string[] = [];

  const free = draft.clinicalRecord.freeNotes.trim();
  if (free) parts.push(free);

  const structuredBlock = serializeClinicalRecord({
    ...draft.clinicalRecord,
    freeNotes: "",
  });
  if (structuredBlock) parts.push(structuredBlock);

  const vitalsBlock = serializeClinicalVitalSigns(draft.vitals);
  if (vitalsBlock) parts.push(vitalsBlock);

  const examBlock = serializePhysicalExam(draft.physicalExam);
  if (examBlock) parts.push(examBlock);

  return parts.join("\n\n");
}
