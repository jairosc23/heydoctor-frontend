import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  STEWARD_SCENARIO_CATALOG,
  attestationIsComplete,
  buildStewardAttestation,
  type StewardScenarioResult,
} from "./steward-attestation";

function allScenarios(passed: boolean | null): StewardScenarioResult[] {
  return STEWARD_SCENARIO_CATALOG.map((s) => ({
    id: s.id,
    title: s.title,
    passed,
    notes: "",
  }));
}

describe("AEC-1 M1 steward attestation", () => {
  it("embeds authority boundary assertions (dismiss/ack ≠ HAB)", () => {
    const attestation = buildStewardAttestation({
      stewardIdentity: "steward@clinic",
      disposition: "ACCEPT",
      scenarios: allScenarios(true),
      stewardReviewEnabled: true,
    });
    assert.equal(attestation.kind, "AEC1_STEWARD_ATTESTATION");
    assert.equal(attestation.authorityAssertions.nonAuthorityPreserved, true);
    assert.equal(attestation.authorityAssertions.dismissIsNotHab, true);
    assert.equal(attestation.authorityAssertions.acknowledgeIsNotHab, true);
    assert.equal(
      attestation.authorityAssertions.stewardIsNotClinicalAuthority,
      true,
    );
    assert.equal(attestation.authorityAssertions.confirmHabForbiddenInUi, true);
    assert.equal(attestation.authorityAssertions.emitPeForbiddenInUi, true);
    assert.equal(
      attestation.authorityAssertions.applyToChartForbiddenInUi,
      true,
    );
  });

  it("requires identity + all scenario pass/fail marks", () => {
    const incomplete = buildStewardAttestation({
      stewardIdentity: "",
      disposition: "REJECT",
      scenarios: allScenarios(null),
      stewardReviewEnabled: true,
    });
    assert.equal(attestationIsComplete(incomplete), false);

    const partial = buildStewardAttestation({
      stewardIdentity: "s1",
      disposition: "ACCEPT_WITH_FIXES",
      scenarios: allScenarios(true).map((s, i) =>
        i === 0 ? { ...s, passed: null } : s,
      ),
      stewardReviewEnabled: true,
    });
    assert.equal(attestationIsComplete(partial), false);

    const complete = buildStewardAttestation({
      stewardIdentity: "s1",
      disposition: "ACCEPT",
      scenarios: allScenarios(false),
      stewardReviewEnabled: false,
    });
    assert.equal(attestationIsComplete(complete), true);
  });
});
