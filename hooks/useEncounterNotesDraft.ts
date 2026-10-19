"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ClinicalVitalSigns } from "@/lib/clinical-vital-signs-context";
import {
  composeEncounterNotes,
  parseEncounterNotes,
} from "@/lib/compose-encounter-notes";
import {
  encounterNotesEditorSnapshotFromParsed,
  resolveEncounterNotesHydration,
  type EncounterNotesEditorSnapshot,
} from "@/lib/encounter-notes-hydration";
import type { PhysicalExam } from "@/lib/physical-exam-framework";
import {
  EMPTY_PHYSICAL_EXAM,
  emptyMskExam,
} from "@/lib/physical-exam-framework";

const EMPTY_EDITOR_SNAPSHOT: EncounterNotesEditorSnapshot = {
  presentIllnessHistory: "",
  vitals: {},
  physicalExam: { ...EMPTY_PHYSICAL_EXAM, msk: emptyMskExam() },
};

export function useEncounterNotesDraft(
  rawNotes: string | null | undefined,
  freeNotes: string,
  consultationId?: string | null,
) {
  const [vitals, setVitals] = useState<ClinicalVitalSigns>({});
  const [physicalExam, setPhysicalExam] = useState<PhysicalExam>({
    ...EMPTY_PHYSICAL_EXAM,
    msk: emptyMskExam(),
  });
  const [presentIllnessHistory, setPresentIllnessHistory] = useState("");
  const hydrationKeyRef = useRef<string | null>(null);
  const consultationIdRef = useRef<string | null>(null);
  const lastHydratedLocalRef = useRef<EncounterNotesEditorSnapshot | null>(
    null,
  );
  const draftRef = useRef<EncounterNotesEditorSnapshot>(EMPTY_EDITOR_SNAPSHOT);

  draftRef.current = {
    presentIllnessHistory,
    vitals,
    physicalExam,
  };

  useEffect(() => {
    const incomingRawNotes = rawNotes ?? "";
    const nextConsultationId = consultationId ?? "";
    const parsed = parseEncounterNotes(rawNotes);
    const incoming = encounterNotesEditorSnapshotFromParsed(parsed);
    const decision = resolveEncounterNotesHydration({
      consultationId: nextConsultationId,
      previousConsultationId: consultationIdRef.current,
      incomingRawNotes,
      lastHydratedRawNotes: hydrationKeyRef.current,
      local: draftRef.current,
      lastHydratedLocal: lastHydratedLocalRef.current,
      incoming,
    });

    consultationIdRef.current = nextConsultationId;

    if (decision === "keep-local") {
      return;
    }

    hydrationKeyRef.current = incomingRawNotes;
    lastHydratedLocalRef.current = incoming;

    if (decision === "adopt-echo") {
      return;
    }

    setVitals(parsed.vitals);
    setPhysicalExam(parsed.physicalExam);
    setPresentIllnessHistory(parsed.clinicalRecord.presentIllnessHistory);
  }, [rawNotes, consultationId]);

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
