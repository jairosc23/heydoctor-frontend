import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAssistConfirmedBody,
  toCreatePrescriptionDto,
} from "./confirm-and-emit";
import {
  buildIntakeSession,
  composerEditClinical,
  composerMarkConfirmed,
  composerMarkEmitted,
  createCompositionStateFromIntake,
  emptyCompositionState,
} from "./create-composition-state";
import { IntakeGateError, assertIntakeDraft } from "./intake-gate";
import { toClinicalAssistPrefillDraftFromTk } from "./tk-adapter";
import type { ClinicalAssistPrefillDraft } from "./types";
import { emptyAssistanceContext } from "./types";

function protocolDraft(): ClinicalAssistPrefillDraft {
  return {
    sourceAssetType: "clinical_protocol",
    sourceAssetId: "11111111-1111-4111-8111-111111111111",
    sourceRevisionId: "22222222-2222-4222-8222-222222222222",
    cie10CodeId: null,
    diagnosis: "HTA",
    medications: [{ name: "Losartan", dosage: "50mg" }],
    notes: "n",
    therapeuticIntent: "control",
    tags: [],
    assistanceProvenance: {
      kind: "protocol_assisted_composition",
      protocolId: "11111111-1111-4111-8111-111111111111",
      protocolVersionId: "22222222-2222-4222-8222-222222222222",
      protocolVersionNumber: 1,
      contentHash: "hash-1",
      actorDoctorId: "d1",
      clinicId: "c1",
      occurredAt: "2026-07-25T00:00:00.000Z",
      assistanceApiVersion: "pr8-pacp-v1",
    },
    assistanceContext: {
      ...emptyAssistanceContext(),
      cie10Hints: ["I10"],
    },
  };
}

describe("PR-8 M2 Composer Intake", () => {
  it("V-I3: intake creates HYDRATED state; physicianEdited sole SoT false", () => {
    const intake = buildIntakeSession(protocolDraft());
    const state = createCompositionStateFromIntake(intake, {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    });
    assert.equal(state.lifecycle, "HYDRATED");
    assert.equal(state.physicianEdited, false);
    assert.equal(
      "physicianEdited" in (state.assistanceSession as object),
      false,
    );
    assert.equal(state.diagnosis, "HTA");
    assert.equal(state.assistanceSession?.assistanceContext.evaluated, false);
  });

  it("State Transition: HYDRATED → EDITED → CONFIRMED → EMITTED", () => {
    const intake = buildIntakeSession(protocolDraft());
    let state = createCompositionStateFromIntake(intake, {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    });
    state = composerEditClinical(state, { diagnosis: "HTA edit" });
    assert.equal(state.lifecycle, "EDITED");
    assert.equal(state.physicianEdited, true);
    state = composerMarkConfirmed(state);
    assert.equal(state.lifecycle, "CONFIRMED");
    state = composerMarkEmitted(state);
    assert.equal(state.lifecycle, "EMITTED");
  });

  it("adapters cannot drive EMPTY transitions — empty state stays EMPTY", () => {
    const empty = emptyCompositionState();
    assert.equal(empty.lifecycle, "EMPTY");
    // adapter only produces draft
    const draft = toClinicalAssistPrefillDraftFromTk(
      {
        sourceAssetType: "protocol",
        sourceAssetId: "a1",
        sourceRevisionId: "r1",
        medications: [{ name: "X" }],
      },
      { doctorId: "d1", clinicId: "c1" },
    );
    assert.equal(draft.sourceAssetType, "therapeutic_asset");
    assert.equal(empty.lifecycle, "EMPTY");
  });

  it("V-I2: gate rejects evaluated true and ai_assist", () => {
    const d = protocolDraft();
    (d.assistanceContext as { evaluated: boolean }).evaluated = true;
    assert.throws(() => assertIntakeDraft(d), IntakeGateError);
    const ai = protocolDraft();
    ai.sourceAssetType = "ai_assist";
    ai.assistanceProvenance = {
      kind: "ai_assisted_composition",
      artifactId: "x",
      snapshotId: "y",
      actorDoctorId: "d1",
      clinicId: "c1",
      occurredAt: "2026-07-25T00:00:00.000Z",
      assistanceApiVersion: "pr8-pacp-v1",
    };
    assert.throws(() => assertIntakeDraft(ai), (e: IntakeGateError) => {
      return e.reasonCode === "ai_assist_reserved";
    });
  });

  it("V-I10: cie10Hints never set cie10CodeId", () => {
    const intake = buildIntakeSession(protocolDraft());
    const state = createCompositionStateFromIntake(intake, {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    });
    assert.equal(state.cie10CodeId, null);
    assert.deepEqual(state.assistanceSession?.assistanceContext.cie10Hints, [
      "I10",
    ]);
  });

  it("confirm mapping excludes assist provenance from CreatePrescriptionDto", () => {
    const intake = buildIntakeSession(protocolDraft());
    const state = createCompositionStateFromIntake(intake, {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    });
    const dto = toCreatePrescriptionDto(state);
    assert.equal(dto.patientId, "p1");
    assert.ok(dto.notes?.includes("Intent:"));
    assert.equal(
      "assistanceProvenance" in dto || "safetyDecision" in dto,
      false,
    );
    const body = buildAssistConfirmedBody(state, "55555555-5555-4555-8555-555555555555");
    assert.ok(body);
    assert.equal(body!.contentHash, "hash-1");
    assert.equal(body!.physicianEdited, false);
  });
});
