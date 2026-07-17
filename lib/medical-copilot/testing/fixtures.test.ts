import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MEDICAL_COPILOT_GOVERNANCE } from "../types";
import {
  buildMedicalCopilotEnvelopeFixture,
  createMemoryStorage,
} from "./fixtures";

describe("medical-copilot testing fixtures (F2-14)", () => {
  it("envelope preserves HITL governance", () => {
    const env = buildMedicalCopilotEnvelopeFixture({ ok: true });
    assert.equal(env.source, "medical_copilot_facade");
    assert.deepEqual(env.governance, MEDICAL_COPILOT_GOVERNANCE);
    assert.equal(env.governance.executesAction, false);
  });

  it("memory storage isolates ownership keys", () => {
    const a = createMemoryStorage();
    const b = createMemoryStorage();
    a.setItem("k", "1");
    assert.equal(a.getItem("k"), "1");
    assert.equal(b.getItem("k"), null);
  });
});
