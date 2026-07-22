"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import {
  composeEncounterNotes,
  parseEncounterNotes,
} from "@/lib/compose-encounter-notes";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import {
  EMPTY_PHYSICAL_EXAM,
  emptyMskExam,
} from "@/lib/physical-exam-framework";

export function useEncounterNotesDraft(
  rawNotes: string | null | undefined,
  freeNotes: string,
) {
  const [vitals, setVitals] = useState<ClinicalVitalSigns>({});
  const [physicalExam, setPhysicalExam] = useState<PhysicalExam>({
    ...EMPTY_PHYSICAL_EXAM,
    msk: emptyMskExam(),
  });
  const [presentIllnessHistory, setPresentIllnessHistory] = useState("");
  const hydrationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const hydrationKey = rawNotes ?? "";
    if (hydrationKeyRef.current === hydrationKey) return;
    hydrationKeyRef.current = hydrationKey;
    const parsed = parseEncounterNotes(rawNotes);
    setVitals(parsed.vitals);
    setPhysicalExam(parsed.physicalExam);
    setPresentIllnessHistory(parsed.clinicalRecord.presentIllnessHistory);
  }, [rawNotes]);

  const composeNotes = useCallback(() => {
    const base = parseEncounterNotes(rawNotes);
    return composeEncounterNotes({
      clinicalRecord: {
        ...base.clinicalRecord,
        presentIllnessHistory,
        freeNotes: freeNotes.trim(),
      },
      vitals,
      physicalExam,
    });
  }, [rawNotes, freeNotes, presentIllnessHistory, vitals, physicalExam]);

  return {
    vitals,
    setVitals,
    physicalExam,
    setPhysicalExam,
    presentIllnessHistory,
    setPresentIllnessHistory,
    composeNotes,
  };
}
