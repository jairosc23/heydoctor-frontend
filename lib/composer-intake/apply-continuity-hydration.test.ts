import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  applyContinuityHydrationDraft,
  isComposerBusyForContinuityHandoff,
  registerContinuityHydrationApplier,
  type ContinuityHandoffRequest,
} from "./apply-continuity-hydration";
import type { ClinicalAssistPrefillDraft } from "./types";

function draft(): ClinicalAssistPrefillDraft {
  return {
    sourceAssetType: "therapeutic_asset",
    sourceAssetId: "continuity:ch1",
    sourceRevisionId: "v1",
    cie10CodeId: null,
    diagnosis: "HTA",
    medications: [{ name: "Losartan", dosage: "50mg" }],
    notes: null,
    assistanceProvenance: {
      kind: "therapeutic_assisted_composition",
      assetId: "continuity:ch1",
      revisionId: "v1",
      actorDoctorId: "d1",
      clinicId: "c1",
      occurredAt: "2026-07-01T00:00:00.000Z",
      assistanceApiVersion: "pr8-pacp-v1",
    },
  };
}

function req(partial?: Partial<ContinuityHandoffRequest>): ContinuityHandoffRequest {
  return {
    handoffId: "h1",
    patientId: "p1",
    hintId: "hint-1",
    draft: draft(),
    hydrationGate: "assertContinuityHydrationDraft",
    ...partial,
  };
}

describe("PR-11 applyContinuityHydrationDraft / busy", () => {
  beforeEach(() => {
    registerContinuityHydrationApplier(null);
  });

  it("TD1: busy matrix", () => {
    assert.equal(isComposerBusyForContinuityHandoff(null), false);
    assert.equal(isComposerBusyForContinuityHandoff("EMPTY"), false);
    assert.equal(isComposerBusyForContinuityHandoff("EMITTED"), false);
    assert.equal(isComposerBusyForContinuityHandoff("HYDRATED"), true);
    assert.equal(isComposerBusyForContinuityHandoff("EDITED"), true);
    assert.equal(isComposerBusyForContinuityHandoff("CONFIRMED"), true);
  });

  it("TDR3: rejects when no applier registered", async () => {
    const r = await applyContinuityHydrationDraft(req());
    assert.equal(r.ok, false);
    if (!r.ok) assert.equal(r.code, "handoff_rejected");
  });

  it("delegates to registered applier", async () => {
    registerContinuityHydrationApplier(async (r) => ({
      ok: true,
      handoffId: r.handoffId,
      composerLifecycle: "HYDRATED",
    }));
    const r = await applyContinuityHydrationDraft(req({ handoffId: "corr-9" }));
    assert.equal(r.ok, true);
    if (r.ok) {
      assert.equal(r.handoffId, "corr-9");
      assert.equal(r.composerLifecycle, "HYDRATED");
    }
  });
});
