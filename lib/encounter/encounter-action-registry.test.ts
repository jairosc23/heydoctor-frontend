import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ENCOUNTER_ACTIONS,
  SHARE_CONSULTATION_ACTION_ID,
  encounterActionLabel,
  isShareConsultationAction,
  resolveEncounterActions,
  type EncounterActionContext,
} from "./encounter-action-registry";

const base: EncounterActionContext = {
  isLocked: false,
  canPay: false,
  canToggleEdit: true,
  isEditing: false,
  hideModuleShortcuts: false,
  hideDocumentActions: true,
  hasPatientId: true,
  hasTransition: true,
  paymentStep: "idle",
  creatingPayment: false,
};

describe("encounter action registry", () => {
  it("registers share-consultation once for toolbar and overflow", () => {
    const share = ENCOUNTER_ACTIONS.filter(
      (action) => action.id === SHARE_CONSULTATION_ACTION_ID,
    );
    assert.equal(share.length, 1);
    assert.deepEqual(share[0]?.placements, ["toolbar", "overflow"]);
    assert.equal(isShareConsultationAction(SHARE_CONSULTATION_ACTION_ID), true);
  });

  it("resolves the same share action in toolbar and overflow", () => {
    const toolbar = resolveEncounterActions(base, "toolbar");
    const overflow = resolveEncounterActions(base, "overflow");
    assert.ok(toolbar.some((action) => action.id === SHARE_CONSULTATION_ACTION_ID));
    assert.ok(
      overflow.some((action) => action.id === SHARE_CONSULTATION_ACTION_ID),
    );
    assert.equal(
      encounterActionLabel(
        toolbar.find((action) => action.id === SHARE_CONSULTATION_ACTION_ID)!,
        base,
      ),
      "Compartir consulta",
    );
  });

  it("keeps Continuity in overflow when the encounter has a patient", () => {
    const overflow = resolveEncounterActions(base, "overflow");
    assert.ok(overflow.some((action) => action.id === "continuity"));
    const withoutPatient = resolveEncounterActions(
      { ...base, hasPatientId: false },
      "overflow",
    );
    assert.ok(withoutPatient.every((action) => action.id !== "continuity"));
  });

  it("hides module shortcuts and document actions from the header registry", () => {
    const toolbar = resolveEncounterActions(
      { ...base, hideModuleShortcuts: true },
      "toolbar",
    );
    assert.ok(toolbar.every((action) => action.id !== "prescription"));
    assert.ok(toolbar.every((action) => action.id !== "lab"));
    const overflow = resolveEncounterActions(base, "overflow");
    assert.ok(overflow.every((action) => action.id !== "invoice"));
    assert.ok(overflow.every((action) => action.id !== "pdf"));
  });
});
