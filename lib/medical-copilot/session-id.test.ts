import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { assertMedicalCopilotSessionId } from "./session-id";

describe("assertMedicalCopilotSessionId (F2-08)", () => {
  it("accepts trimmed non-empty ids", () => {
    assert.equal(assertMedicalCopilotSessionId("  abc-123  "), "abc-123");
  });

  it("rejects empty / non-string / oversized", () => {
    assert.equal(assertMedicalCopilotSessionId(""), null);
    assert.equal(assertMedicalCopilotSessionId("   "), null);
    assert.equal(assertMedicalCopilotSessionId(null), null);
    assert.equal(assertMedicalCopilotSessionId(undefined), null);
    assert.equal(assertMedicalCopilotSessionId(1), null);
    assert.equal(assertMedicalCopilotSessionId("x".repeat(129)), null);
  });
});
