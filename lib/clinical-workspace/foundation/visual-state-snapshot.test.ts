import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { clinicalWorkspaceKernel } from "../kernel";
import { getVisualWorkspaceState } from "./overlay-manager";

describe("INC-001 SPR1-BLOCKER-01 visual snapshot identity", () => {
  afterEach(() => {
    clinicalWorkspaceKernel.exitFullscreen();
  });

  it("returns the same reference while visual state is unchanged", () => {
    const a = getVisualWorkspaceState();
    const b = getVisualWorkspaceState();
    assert.equal(a, b);
    assert.deepEqual(a, { mode: "frame", activeSurface: null });
  });

  it("keeps kernel getVisualState referentially stable", () => {
    const a = clinicalWorkspaceKernel.getVisualState();
    const b = clinicalWorkspaceKernel.getVisualState();
    assert.equal(a, b);
  });

  it("reuses a constant fullscreen snapshot", () => {
    clinicalWorkspaceKernel.enterFullscreen();
    const a = clinicalWorkspaceKernel.getVisualState();
    const b = clinicalWorkspaceKernel.getVisualState();
    assert.equal(a, b);
    assert.deepEqual(a, { mode: "fullscreen", activeSurface: "teleconsulta" });
  });
});
