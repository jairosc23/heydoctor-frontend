import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSmartClinicalWorkspaceEnabled } from "./smart-clinical-workspace";

describe("smart-clinical-workspace", () => {
  it("deshabilita el shell cuando la flag está ausente o vacía", () => {
    assert.equal(isSmartClinicalWorkspaceEnabled(undefined), false);
    assert.equal(isSmartClinicalWorkspaceEnabled(""), false);
  });

  it("habilita el shell con valores truthy conocidos", () => {
    assert.equal(isSmartClinicalWorkspaceEnabled("1"), true);
    assert.equal(isSmartClinicalWorkspaceEnabled("true"), true);
    assert.equal(isSmartClinicalWorkspaceEnabled("ON"), true);
  });
});
