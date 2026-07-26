import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createCopilotAssistController } from "./plugin";

describe("GCE-W2 medical-copilot-assist controller", () => {
  it("acceptLocal only changes UI state (no throw / no PE)", () => {
    const c = createCopilotAssistController();
    c.state = "suggestion";
    c.suggestion = { summary: "demo", raw: {} };
    assert.doesNotThrow(() => c.acceptLocal());
    assert.equal(c.state, "accepted_local");
  });

  it("rejectLocal clears suggestion", () => {
    const c = createCopilotAssistController();
    c.state = "suggestion";
    c.suggestion = { summary: "demo", raw: {} };
    c.rejectLocal();
    assert.equal(c.state, "rejected");
    assert.equal(c.suggestion, null);
  });
});
