import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveUnsavedNavigation } from "./resolve-navigation";

describe("resolveUnsavedNavigation", () => {
  it("allows immediate navigation when there are no pending changes", () => {
    assert.equal(resolveUnsavedNavigation(false), "navigate");
  });

  it("prompts when there are unsaved changes", () => {
    assert.equal(resolveUnsavedNavigation(true), "prompt");
  });
});
