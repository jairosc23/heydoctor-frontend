import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isGceCopilotAssistEnabled,
  isGceEncounterRuntimeEnabled,
} from "./flags";

describe("GCE-W2 feature flags", () => {
  it("defaults off when unset", () => {
    assert.equal(isGceEncounterRuntimeEnabled(undefined), false);
    assert.equal(isGceCopilotAssistEnabled(undefined), false);
  });

  it("truthy values enable", () => {
    assert.equal(isGceEncounterRuntimeEnabled("1"), true);
    assert.equal(isGceEncounterRuntimeEnabled("true"), true);
    assert.equal(isGceCopilotAssistEnabled("on"), true);
  });

  it("falsey values stay off", () => {
    assert.equal(isGceEncounterRuntimeEnabled("0"), false);
    assert.equal(isGceEncounterRuntimeEnabled("false"), false);
    assert.equal(isGceCopilotAssistEnabled(""), false);
  });
});
