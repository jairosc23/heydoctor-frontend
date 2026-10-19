import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isAec1LiquidSpineEnabled } from "./liquid-flags";

describe("AEC-1 M4 liquid flags", () => {
  it("defaults OFF (fail-closed soak)", () => {
    assert.equal(isAec1LiquidSpineEnabled(undefined), false);
    assert.equal(isAec1LiquidSpineEnabled(""), false);
    assert.equal(isAec1LiquidSpineEnabled("false"), false);
  });

  it("enables only on truthy HCX workspace shell env", () => {
    assert.equal(isAec1LiquidSpineEnabled("true"), true);
    assert.equal(isAec1LiquidSpineEnabled("1"), true);
  });
});
