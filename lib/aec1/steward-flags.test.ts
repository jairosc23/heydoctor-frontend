import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAec1StewardReviewEnabled } from "./steward-flags";

describe("AEC-1 M1 steward flags", () => {
  it("defaults OFF (fail-closed chrome)", () => {
    assert.equal(isAec1StewardReviewEnabled(undefined), false);
    assert.equal(isAec1StewardReviewEnabled(""), false);
    assert.equal(isAec1StewardReviewEnabled("false"), false);
    assert.equal(isAec1StewardReviewEnabled("0"), false);
  });

  it("enables only on truthy env", () => {
    assert.equal(isAec1StewardReviewEnabled("true"), true);
    assert.equal(isAec1StewardReviewEnabled("1"), true);
  });
});
