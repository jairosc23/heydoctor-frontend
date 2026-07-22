import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateAlerts } from "./aggregator";
import { MockSafetyProvider } from "./mock-provider";

const input = {
  patientId: "p1",
  consultationId: "c1",
  diagnosis: "J06.9",
  lines: [
    { lineIndex: 0, displayLabel: "Amoxicilina 500 mg", drugPresentationId: "x" },
    { lineIndex: 1, displayLabel: "Ibuprofeno 400 mg" },
  ],
};

describe("prescription-safety mock provider (PR-4.1)", () => {
  it("none → empty evaluation", async () => {
    const provider = new MockSafetyProvider("none");
    const evaluation = await provider.evaluate(input);
    assert.equal(evaluation.alerts.length, 0);
    assert.equal(provider.id, "mock_safety_provider");
  });

  it("info / warning / critical scenarios", async () => {
    const info = await new MockSafetyProvider("info").evaluate(input);
    assert.equal(info.alerts[0]?.severity, "INFO");
    assert.equal(info.alerts[0]?.requires, "none");

    const warning = await new MockSafetyProvider("warning").evaluate(input);
    assert.equal(warning.alerts[0]?.severity, "WARNING");
    assert.equal(warning.alerts[0]?.requires, "ack");

    const critical = await new MockSafetyProvider("critical").evaluate(input);
    assert.equal(critical.alerts[0]?.severity, "CRITICAL");
    assert.equal(critical.alerts[0]?.requires, "justification");
  });

  it("confidence scenarios expose HIGH / PARTIAL / LOW", async () => {
    for (const confidence of ["HIGH", "PARTIAL", "LOW"] as const) {
      const scenario =
        confidence === "HIGH"
          ? "confidence_high"
          : confidence === "PARTIAL"
            ? "confidence_partial"
            : "confidence_low";
      const evaluation = await new MockSafetyProvider(scenario).evaluate(input);
      assert.equal(evaluation.alerts[0]?.confidence, confidence);
    }
  });

  it("multi aggregates without duplicates and CRITICAL first", async () => {
    const evaluation = await new MockSafetyProvider("multi").evaluate(input);
    assert.ok(evaluation.alerts.length > 3);
    const aggregated = aggregateAlerts(evaluation.alerts);
    assert.ok(aggregated.length < evaluation.alerts.length);
    assert.equal(aggregated[0]?.severity, "CRITICAL");
    const ids = aggregated.map((a) => a.alertId);
    assert.ok(!ids.includes("mock-multi-warn-high-dup"));
  });
});
