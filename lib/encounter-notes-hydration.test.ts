import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EMPTY_PHYSICAL_EXAM, emptyMskExam } from "./physical-exam-framework";
import {
  type EncounterNotesEditorSnapshot,
  resolveEncounterNotesHydration,
} from "./encounter-notes-hydration";

const emptyExam: EncounterNotesEditorSnapshot["physicalExam"] = {
  ...EMPTY_PHYSICAL_EXAM,
  msk: emptyMskExam(),
};

function snap(
  presentIllnessHistory: string,
  extras?: Partial<EncounterNotesEditorSnapshot>,
): EncounterNotesEditorSnapshot {
  return {
    presentIllnessHistory,
    vitals: {},
    physicalExam: emptyExam,
    ...extras,
  };
}

describe("resolveEncounterNotesHydration", () => {
  it("hydrates on first mount", () => {
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "",
        previousConsultationId: null,
        incomingRawNotes: "",
        lastHydratedRawNotes: null,
        local: snap(""),
        lastHydratedLocal: null,
        incoming: snap(""),
      }),
      "hydrate",
    );
  });

  it("hydrates when switching encounters", () => {
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "b",
        previousConsultationId: "a",
        incomingRawNotes: "notes-b",
        lastHydratedRawNotes: "notes-a",
        local: snap("dirty A"),
        lastHydratedLocal: snap("A"),
        incoming: snap("B"),
      }),
      "hydrate",
    );
  });

  it("keeps local typing when autosave echoes stale notes", () => {
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "c1",
        previousConsultationId: "c1",
        incomingRawNotes: "saved-ab",
        lastHydratedRawNotes: "initial",
        local: snap("abc"),
        lastHydratedLocal: snap("a"),
        incoming: snap("ab"),
      }),
      "keep-local",
    );
  });

  it("adopts the persist echo when incoming matches the local draft", () => {
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "c1",
        previousConsultationId: "c1",
        incomingRawNotes: "saved-abc",
        lastHydratedRawNotes: "initial",
        local: snap("abc"),
        lastHydratedLocal: snap("a"),
        incoming: snap("abc"),
      }),
      "adopt-echo",
    );
  });

  it("hydrates a clean editor when server notes change", () => {
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "c1",
        previousConsultationId: "c1",
        incomingRawNotes: "reload",
        lastHydratedRawNotes: "initial",
        local: snap("server"),
        lastHydratedLocal: snap("server"),
        incoming: snap("reloaded"),
      }),
      "hydrate",
    );
  });

  it("does not replace a dirty first-load draft with the GET payload", () => {
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "c1",
        previousConsultationId: "",
        incomingRawNotes: "from-server",
        lastHydratedRawNotes: "",
        local: snap("typed before load"),
        lastHydratedLocal: snap(""),
        incoming: snap("from-server"),
      }),
      "keep-local",
    );
  });

  it("keeps local physical exam when only HEA was saved", () => {
    const localExam = {
      ...emptyExam,
      general: "Abdomen blando, en edición",
    };
    assert.equal(
      resolveEncounterNotesHydration({
        consultationId: "c1",
        previousConsultationId: "c1",
        incomingRawNotes: "hea-only",
        lastHydratedRawNotes: "initial",
        local: snap("Cefalea", { physicalExam: localExam }),
        lastHydratedLocal: snap("Cefalea"),
        incoming: snap("Cefalea"),
      }),
      "keep-local",
    );
  });
});
