import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createPersistGate } from "./persist-gate";

describe("createPersistGate", () => {
  it("allows persist until discard, then never again", () => {
    const gate = createPersistGate();
    assert.equal(gate.shouldPersist(), true);
    gate.discard();
    assert.equal(gate.shouldPersist(), false);
    gate.discard();
    assert.equal(gate.shouldPersist(), false);
  });
});
