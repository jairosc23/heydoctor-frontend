import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  clinicalActionModuleLabel,
  isClinicalActionWorkspaceEnabled,
} from "./clinical-action-workspace";

describe("clinical-action-workspace", () => {
  it("deshabilita el shell cuando la flag está ausente o vacía", () => {
    assert.equal(isClinicalActionWorkspaceEnabled(undefined), false);
    assert.equal(isClinicalActionWorkspaceEnabled(""), false);
  });

  it("habilita el shell con valores truthy conocidos", () => {
    assert.equal(isClinicalActionWorkspaceEnabled("1"), true);
    assert.equal(isClinicalActionWorkspaceEnabled("true"), true);
    assert.equal(isClinicalActionWorkspaceEnabled("ON"), true);
  });

  it("expone etiquetas legibles para módulos del action bar", () => {
    assert.equal(clinicalActionModuleLabel("prescriptions"), "Recetas");
    assert.equal(clinicalActionModuleLabel("orders"), "Órdenes");
  });
});
