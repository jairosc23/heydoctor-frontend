import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  toClinicalAssistPrefillDraftFromContinuityHint,
  type ContinuityHydrationDraft,
} from "./adapter";
import { assertContinuityHydrationDraft } from "./assert-hydration-draft";
import { resolveContinuityHydrationGate } from "./hydration-policy";
import { applyPriorityAndDedupe } from "./priority-dedupe";
import {
  sanitizeStructuralPayload,
  structuralPayloadHasForbiddenKeys,
} from "./structural-payload";
import type { PassiveContinuityHint } from "./types";

function activeHint(): PassiveContinuityHint {
  return {
    hintId: "continuity-active:v1",
    apiVersion: "pr9-ccp-v1",
    sourceKind: "continuity_active",
    priorityRank: 1,
    title: "Continuar medicación activa",
    structuralPayload: {
      medications: [{ name: "Losartan", dosage: "50mg" }],
      diagnosis: "HTA",
      sourceChainId: "ch1",
      sourceVersionId: "v1",
    },
    provenance: {
      kind: "continuity_active_medication",
      provenanceApiVersion: "pr9-ccp-v1",
      occurredAt: "2026-07-01T00:00:00.000Z",
      actorClinicId: "c1",
      assembledBy: "continuity_context_builder",
      chainId: "ch1",
      versionId: "v1",
      patientId: "p1",
    },
    actionableWithoutConfirmation: false,
  };
}

describe("PR-9 CCP C0 Continuity Platform", () => {
  it("S2: adapter is idempotent for same hint+ctx", () => {
    const hint = activeHint();
    const ctx = {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    };
    const a = toClinicalAssistPrefillDraftFromContinuityHint(hint, ctx);
    const b = toClinicalAssistPrefillDraftFromContinuityHint(hint, ctx);
    assert.deepEqual(a, b);
  });

  it("S1: therapeutic_asset is wire-compat; HintProvenance is authoritative", () => {
    const draft = toClinicalAssistPrefillDraftFromContinuityHint(activeHint(), {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    });
    assert.equal(draft.sourceAssetType, "therapeutic_asset");
    assert.equal(draft.extensions?.therapeuticAssetWireCompatOnly, true);
    assert.equal(
      draft.extensions?.continuityHintProvenance.kind,
      "continuity_active_medication",
    );
    assert.equal(draft.cie10CodeId, null);
  });

  it("T2: structuralPayload strips forbidden keys", () => {
    assert.equal(
      structuralPayloadHasForbiddenKeys({
        medications: [{ name: "X" }],
        cie10CodeId: "I10",
      }),
      true,
    );
    const clean = sanitizeStructuralPayload({
      medications: [{ name: "X", dosage: "1" }],
      cie10CodeId: "I10",
      safetyDecision: {},
    });
    assert.ok(clean);
    assert.equal(
      "cie10CodeId" in (clean as object) || "safetyDecision" in (clean as object),
      false,
    );
  });

  it("T3: dedupe keeps better band and does not merge provenance", () => {
    const active = activeHint();
    const protocol: PassiveContinuityHint = {
      ...active,
      hintId: "proto",
      sourceKind: "clinical_protocol",
      provenance: {
        kind: "protocol_assisted_hint",
        provenanceApiVersion: "pr9-ccp-v1",
        occurredAt: "2026-07-26T00:00:00.000Z",
        actorClinicId: "c1",
        assembledBy: "continuity_context_builder",
        protocolId: "p",
        protocolVersionId: "pv",
        contentHash: "h",
        assistanceApiVersion: "pr8-pacp-v1",
      },
    };
    const { hints } = applyPriorityAndDedupe([protocol, active]);
    assert.equal(hints.length, 1);
    assert.equal(hints[0]!.sourceKind, "continuity_active");
    assert.equal(hints[0]!.provenance.kind, "continuity_active_medication");
  });

  it("S3: hydration gate selection", () => {
    assert.equal(
      resolveContinuityHydrationGate(activeHint()),
      "assertContinuityHydrationDraft",
    );
    assert.equal(
      resolveContinuityHydrationGate({
        ...activeHint(),
        sourceKind: "clinical_protocol",
      }),
      "validate-echo",
    );
  });

  it("assertContinuityHydrationDraft accepts Continuity draft", () => {
    const hint = activeHint();
    const draft = toClinicalAssistPrefillDraftFromContinuityHint(hint, {
      actorDoctorId: "d1",
      clinicId: "c1",
      patientId: "p1",
    });
    const ok: ContinuityHydrationDraft = assertContinuityHydrationDraft(
      draft,
      hint,
    );
    assert.equal(ok.medications[0]?.name, "Losartan");
  });
});
