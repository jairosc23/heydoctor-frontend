import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { EncounterRuntime } from "./encounter-runtime";
import { ClinicalPluginRegistry } from "./plugin-registry";
import { validateClinicalPluginManifest } from "./clinical-plugin-manifest";
import { MEDICAL_COPILOT_ASSIST_MANIFEST } from "../encounter-plugins/medical-copilot-assist/manifest";

const actor = {
  doctorId: "doc-1",
  clinicId: "clinic-1",
  patientId: "pat-1",
  encounterId: "enc-1",
};

describe("GCE-W2 ClinicalPluginManifest", () => {
  it("accepts frozen Copilot assist manifest", () => {
    const v = validateClinicalPluginManifest(MEDICAL_COPILOT_ASSIST_MANIFEST);
    assert.equal(v.ok, true);
  });

  it("rejects executesAction true", () => {
    const v = validateClinicalPluginManifest({
      ...MEDICAL_COPILOT_ASSIST_MANIFEST,
      executesAction: true,
    });
    assert.equal(v.ok, false);
  });

  it("rejects prescription:write permission", () => {
    const v = validateClinicalPluginManifest({
      ...MEDICAL_COPILOT_ASSIST_MANIFEST,
      permissions: ["prescription:write"],
    });
    assert.equal(v.ok, false);
  });
});

describe("GCE-W2 PluginRegistry", () => {
  it("registers and lists enabled plugins", () => {
    const reg = new ClinicalPluginRegistry();
    reg.register(MEDICAL_COPILOT_ASSIST_MANIFEST);
    assert.equal(reg.list().length, 1);
    assert.equal(reg.list()[0]?.id, "medical-copilot-assist");
  });

  it("rejects id collision", () => {
    const reg = new ClinicalPluginRegistry();
    reg.register(MEDICAL_COPILOT_ASSIST_MANIFEST);
    assert.throws(() => reg.register(MEDICAL_COPILOT_ASSIST_MANIFEST));
  });
});

describe("GCE-W2 EncounterRuntime", () => {
  it("open → ready → activate → assisting → close", async () => {
    const runtime = new EncounterRuntime();
    runtime.getRegistry().register(MEDICAL_COPILOT_ASSIST_MANIFEST);
    const session = await runtime.open(actor);
    assert.equal(session.state, "ready");
    await runtime.activatePlugin("medical-copilot-assist");
    assert.equal(runtime.getSession()?.state, "assisting");
    await runtime.close();
    assert.equal(runtime.getSession()?.state, "closed");
  });

  it("activatePlugin rejects when not ready", async () => {
    const runtime = new EncounterRuntime();
    runtime.getRegistry().register(MEDICAL_COPILOT_ASSIST_MANIFEST);
    await assert.rejects(() => runtime.activatePlugin("medical-copilot-assist"));
  });
});
