import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isMedicationOrderBuilderEnabled } from "./flags";

describe("Medication Order Builder flag", () => {
  it("defaults ON when unset", () => {
    assert.equal(isMedicationOrderBuilderEnabled(undefined), true);
    assert.equal(isMedicationOrderBuilderEnabled(""), true);
  });

  it("opts out with 0/false/off", () => {
    assert.equal(isMedicationOrderBuilderEnabled("0"), false);
    assert.equal(isMedicationOrderBuilderEnabled("false"), false);
    assert.equal(isMedicationOrderBuilderEnabled("off"), false);
  });

  it("enables with 1/true", () => {
    assert.equal(isMedicationOrderBuilderEnabled("1"), true);
    assert.equal(isMedicationOrderBuilderEnabled("true"), true);
  });
});
