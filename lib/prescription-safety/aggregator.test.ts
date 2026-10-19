import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateAlerts,
  alertDedupeKey,
  sortAlerts,
} from "./aggregator";
import type { SafetyAlert } from "./types";

function makeAlert(
  overrides: Partial<SafetyAlert> &
    Pick<SafetyAlert, "alertId" | "severity" | "priority" | "arrivedAt">,
): SafetyAlert {
  return {
    ruleId: "R3",
    family: "therapeutic_duplication",
    confidence: "HIGH",
    message: "msg",
    lineIndexes: [0],
    source: "test",
    requires: "ack",
    ...overrides,
  };
}

describe("prescription-safety aggregator (PR-4.1)", () => {
  it("orders by severity then priority then arrival", () => {
    const alerts = [
      makeAlert({
        alertId: "i1",
        severity: "INFO",
        priority: "HIGH",
        arrivedAt: 1,
      }),
      makeAlert({
        alertId: "w-low",
        severity: "WARNING",
        priority: "LOW",
        arrivedAt: 2,
      }),
      makeAlert({
        alertId: "c1",
        severity: "CRITICAL",
        priority: "NORMAL",
        arrivedAt: 3,
      }),
      makeAlert({
        alertId: "w-high",
        severity: "WARNING",
        priority: "HIGH",
        arrivedAt: 4,
      }),
      makeAlert({
        alertId: "w-high-earlier",
        severity: "WARNING",
        priority: "HIGH",
        arrivedAt: 1,
        message: "other",
      }),
    ];

    const sorted = sortAlerts(alerts).map((a) => a.alertId);
    assert.deepEqual(sorted, [
      "c1",
      "w-high-earlier",
      "w-high",
      "w-low",
      "i1",
    ]);
  });

  it("dedupes duplicate alerts keeping earlier arrival", () => {
    const alerts = [
      makeAlert({
        alertId: "a",
        severity: "WARNING",
        priority: "HIGH",
        arrivedAt: 2,
        message: "dup",
        ruleId: "R3",
        lineIndexes: [0, 1],
      }),
      makeAlert({
        alertId: "b",
        severity: "WARNING",
        priority: "HIGH",
        arrivedAt: 1,
        message: "dup",
        ruleId: "R3",
        lineIndexes: [1, 0],
      }),
    ];
    assert.equal(alertDedupeKey(alerts[0]!), alertDedupeKey(alerts[1]!));
    const aggregated = aggregateAlerts(alerts);
    assert.equal(aggregated.length, 1);
    assert.equal(aggregated[0]!.alertId, "b");
  });
});
