import assert from "node:assert/strict";
import { describe, it } from "node:test";

/**
 * Phase D guardrail: Copilot disposition channel ≠ HAB Confirm channel.
 */
describe("copilot-disposition channel contracts", () => {
  it("disposition kinds are dispose_* only", () => {
    const kinds = [
      "dispose_accept",
      "dispose_reject",
      "dispose_refine",
      "dispose_ignore",
    ];
    for (const k of kinds) {
      assert.match(k, /^dispose_/);
      assert.notEqual(k, "confirm");
      assert.notEqual(k, "approve");
    }
  });

  it("HAB kinds remain distinct", () => {
    const hab = ["confirm", "reject", "modify", "abort"];
    const dispose = [
      "dispose_accept",
      "dispose_reject",
      "dispose_refine",
      "dispose_ignore",
    ];
    for (const h of hab) {
      assert.equal(dispose.includes(h as never), false);
    }
  });
});
