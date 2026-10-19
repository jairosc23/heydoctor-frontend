import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  __resetCopilotBootstrapMetricsForTests,
  getCopilotBootstrapMetrics,
  recordCopilotBootstrapComplete,
  recordCopilotBootstrapStart,
} from "./heydoctor-copilot-bootstrap-metrics";
import { isHeyDoctorCopilotEagerBootstrapEnabled } from "./heydoctor-copilot-flags";

describe("HeyDoctor Copilot bootstrap metrics + flags", () => {
  it("defaults eager bootstrap OFF (lazy Workspace open)", () => {
    assert.equal(isHeyDoctorCopilotEagerBootstrapEnabled(), false);
  });

  it("records latency and estimated requests without PHI", () => {
    __resetCopilotBootstrapMetricsForTests();
    recordCopilotBootstrapStart({
      consultationId: "consultation-uuid-abcdefgh",
      mode: "lazy_workspace_open",
    });
    recordCopilotBootstrapComplete({
      latencyMs: 420,
      estimatedRequests: 5,
    });
    const m = getCopilotBootstrapMetrics();
    assert.equal(m.attempts, 1);
    assert.equal(m.completed, 1);
    assert.equal(m.lastLatencyMs, 420);
    assert.equal(m.lastEstimatedRequests, 5);
    assert.equal(m.lastMode, "lazy_workspace_open");
    assert.ok(m.lastConsultationRef);
    assert.ok(!m.lastConsultationRef.includes("abcdefgh"));
  });
});
