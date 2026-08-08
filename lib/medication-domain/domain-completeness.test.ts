/**
 * Domain QA — P0.1 clinical completeness (ADR-020).
 * Asserts workflows are representable without semantic workarounds.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { MedicationOrder } from "./types";
import { emptyMedicationOrderLine, emptyPosology } from "./types";

function baseOrder(
  patch: Partial<MedicationOrder>,
): MedicationOrder {
  return {
    id: "ord-1",
    version: 1,
    status: "issued",
    careSetting: "AMBULATORY",
    intent: "ORDER",
    jurisdictionCode: "CL",
    patientId: "pat-1",
    lines: [emptyMedicationOrderLine("line-1")],
    ...patch,
  };
}

describe("Medication Domain P0.1 — Domain QA completeness", () => {
  it("represents ambulatory, hospital, STAT, PRN, continuous", () => {
    const ambulatory = baseOrder({ careSetting: "AMBULATORY", intent: "ORDER" });
    const hospital = baseOrder({ careSetting: "HOSPITAL", intent: "ORDER" });
    const stat = baseOrder({
      careSetting: "ED",
      priority: "STAT",
      intent: "ORDER",
    });
    const prnLine = emptyMedicationOrderLine("prn");
    prnLine.posology = {
      ...emptyPosology(),
      dose: { amount: 1, unit: "tablet" },
      asNeeded: { conditionCode: "if_pain", maxPerDay: 4 },
    };
    const prn = baseOrder({ lines: [prnLine] });
    const continuousLine = emptyMedicationOrderLine("chr");
    continuousLine.posology = {
      ...emptyPosology(),
      duration: { kind: "CONTINUOUS" },
    };
    const continuous = baseOrder({ lines: [continuousLine] });

    assert.equal(ambulatory.careSetting, "AMBULATORY");
    assert.equal(hospital.careSetting, "HOSPITAL");
    assert.equal(stat.priority, "STAT");
    assert.ok(prn.lines[0].posology.asNeeded);
    assert.equal(continuous.lines[0].posology.duration?.kind, "CONTINUOUS");
  });

  it("represents dose modification, suspension, renewal, reconciliation, scheduled", () => {
    const modified = baseOrder({ status: "amended", version: 2 });
    const suspended = baseOrder({ status: "suspended" });
    const onHold = baseOrder({ status: "on_hold" });
    const renewal = baseOrder({
      intent: "REFILL",
      lineage: { priorOrderId: "ord-0", replacesOrderId: "ord-0" },
    });
    const reconStop = baseOrder({
      status: "cancelled",
      lineage: {
        priorOrderId: "home-med-1",
        reconcileAction: "stop",
      },
    });
    const reconModify = baseOrder({
      status: "amended",
      lineage: {
        priorOrderId: "home-med-2",
        replacesOrderId: "home-med-2",
        reconcileAction: "modify",
      },
    });
    const scheduled = baseOrder({
      intent: "PLAN",
      scheduledStartAt: "2026-09-01T08:00:00.000Z",
      effectivePeriod: {
        startAt: "2026-09-01T08:00:00.000Z",
        endAt: "2026-09-14T08:00:00.000Z",
      },
    });

    assert.equal(modified.status, "amended");
    assert.equal(suspended.status, "suspended");
    assert.equal(onHold.status, "on_hold");
    assert.notEqual(suspended.status, "cancelled");
    assert.equal(renewal.intent, "REFILL");
    assert.equal(renewal.lineage?.priorOrderId, "ord-0");
    assert.equal(reconStop.lineage?.reconcileAction, "stop");
    assert.equal(reconModify.lineage?.reconcileAction, "modify");
    assert.ok(scheduled.scheduledStartAt);
    assert.ok(scheduled.effectivePeriod?.startAt);
  });
});
