import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  registerContinuityHydrationApplier,
  type ContinuityHandoffRequest,
} from "@/lib/composer-intake/apply-continuity-hydration";
import type {
  ContinuityContext,
  PassiveContinuityHint,
} from "@/lib/continuity-platform/types";
import {
  __resetContinuityHandoffLockForTests,
  isContinuityHandoffInFlight,
  runContinuityHydrationHandoff,
} from "./continuity-hydration-handoff";

function hint(): PassiveContinuityHint {
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

function ctx(): ContinuityContext {
  return {
    apiVersion: "pr9-ccp-v1",
    patientId: "p1",
    clinicId: "c1",
    assembledAt: "2026-07-26T00:00:00.000Z",
    activeMedications: [],
    timelineSummary: {
      window: { from: "a", to: "b" },
      events: [],
    },
    hints: [hint()],
  };
}

describe("PR-11 ContinuityHydrationHandoff", () => {
  beforeEach(() => {
    __resetContinuityHandoffLockForTests();
    registerContinuityHydrationApplier(null);
  });

  it("success path transfers via applyContinuityHydrationDraft", async () => {
    const seen: ContinuityHandoffRequest[] = [];
    registerContinuityHydrationApplier(async (req) => {
      seen.push(req);
      return {
        ok: true,
        handoffId: req.handoffId,
        composerLifecycle: "HYDRATED",
      };
    });

    const result = await runContinuityHydrationHandoff({
      hint: hint(),
      context: ctx(),
      actor: { actorDoctorId: "d1", clinicId: "c1", patientId: "p1" },
    });

    assert.equal(result.ok, true);
    assert.equal(seen.length, 1);
    assert.equal(seen[0].hintId, "continuity-active:v1");
    assert.equal(seen[0].patientId, "p1");
    assert.equal(typeof seen[0].handoffId, "string");
    assert.equal(isContinuityHandoffInFlight(), false);
  });

  it("TD2: concurrent CTA returns in_flight and releases lock", async () => {
    let release!: () => void;
    const gate = new Promise<void>((r) => {
      release = r;
    });
    registerContinuityHydrationApplier(async (req) => {
      await gate;
      return {
        ok: true,
        handoffId: req.handoffId,
        composerLifecycle: "HYDRATED",
      };
    });

    const first = runContinuityHydrationHandoff({
      hint: hint(),
      context: ctx(),
      actor: { actorDoctorId: "d1", clinicId: "c1", patientId: "p1" },
    });
    // allow first to take lock
    await new Promise((r) => setTimeout(r, 0));
    assert.equal(isContinuityHandoffInFlight(), true);

    const second = await runContinuityHydrationHandoff({
      hint: hint(),
      context: ctx(),
      actor: { actorDoctorId: "d1", clinicId: "c1", patientId: "p1" },
    });
    assert.equal(second.ok, false);
    if (!second.ok) assert.equal(second.code, "in_flight");

    release();
    const firstResult = await first;
    assert.equal(firstResult.ok, true);
    assert.equal(isContinuityHandoffInFlight(), false);
  });

  it("TDR5: applier failure leaves lock clear", async () => {
    registerContinuityHydrationApplier(async (req) => ({
      ok: false,
      handoffId: req.handoffId,
      code: "composer_busy",
    }));
    const result = await runContinuityHydrationHandoff({
      hint: hint(),
      context: ctx(),
      actor: { actorDoctorId: "d1", clinicId: "c1", patientId: "p1" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "composer_busy");
    assert.equal(isContinuityHandoffInFlight(), false);
  });

  it("patient mismatch fails without calling applier", async () => {
    let called = false;
    registerContinuityHydrationApplier(async (req) => {
      called = true;
      return {
        ok: true,
        handoffId: req.handoffId,
        composerLifecycle: "HYDRATED",
      };
    });
    const result = await runContinuityHydrationHandoff({
      hint: hint(),
      context: ctx(),
      actor: { actorDoctorId: "d1", clinicId: "c1", patientId: "other" },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.code, "patient_mismatch");
    assert.equal(called, false);
  });
});
