import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { GOVERNED_CLINICAL_FUNCTIONAL_INTELLIGENCE_UI_GOVERNANCE } from "./governed-clinical-functional-intelligence-package";
import { mapGovernedClinicalFunctionalIntelligencePackageEnvelope } from "./governed-clinical-functional-intelligence-package-mapper";
describe("GovernedClinicalFunctionalIntelligencePackage mapper", () => {
  it("maps HITL functional intelligence package without write flags", () => {
    const mapped = mapGovernedClinicalFunctionalIntelligencePackageEnvelope({ status: "PROPOSED_FOR_PHYSICIAN_REVIEW", packageId: "p1", runtime: { ready: true }, drugInteractionAnalysis: { kind: "x" }, governance: { ...GOVERNED_CLINICAL_FUNCTIONAL_INTELLIGENCE_UI_GOVERNANCE }, reason: "ok" });
    assert.ok(mapped);
    assert.equal(mapped.writesEmr, false);
    assert.equal(mapped.automaticDecision, false);
    assert.ok(mapped.components.some((c) => c.key === "hitl" && c.present));
  });
});
