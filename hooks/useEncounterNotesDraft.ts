"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import {
  composeEncounterNotes,
  parseEncounterNotes,
} from "@/lib/compose-encounter-notes";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import { EMPTY_PHYSICAL_EXAM } from "@/lib/physical-exam-framework";

export function useEncounterNotesDraft(
  rawNotes: string | null | undefined,
  freeNotes: string,
) {
  const [vitals, setVitals] = useState<ClinicalVitalSigns>({});
  const [physicalExam, setPhysicalExam] = useState<PhysicalExam>({
    ...EMPTY_PHYSICAL_EXAM,
  });
  const hydrationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const hydrationKey = rawNotes ?? "";
    if (hydrationKeyRef.current === hydrationKey) return;
    hydrationKeyRef.current = hydrationKey;
    const parsed = parseEncounterNotes(rawNotes);
    setVitals(parsed.vitals);
    setPhysicalExam(parsed.physicalExam);
  }, [rawNotes]);

  const composeNotes = useCallback(() => {
    const base = parseEncounterNotes(rawNotes);
    return composeEncounterNotes({
      clinicalRecord: {
        ...base.clinicalRecord,
        freeNotes: freeNotes.trim(),
      },
      vitals,
      physicalExam,
    });
  }, [rawNotes, freeNotes, vitals, physicalExam]);

  const composeWithClinicalRecord = useCallback(
    (serializedClinicalRecord: string) => {
      const record = parseEncounterNotes(serializedClinicalRecord).clinicalRecord;
      return composeEncounterNotes({
        clinicalRecord: record,
        vitals,
        physicalExam,
      });
    },
    [vitals, physicalExam],
  );

  return {
    vitals,
    setVitals,
    physicalExam,
    setPhysicalExam,
    composeNotes,
    composeWithClinicalRecord,
  };
}
