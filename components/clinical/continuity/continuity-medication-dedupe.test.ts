import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { visibleContinuityMedications } from "./continuity-medication-dedupe";
import type { ContinuityActiveMedication } from "../../../lib/continuity-platform/types";

function med(
  name: string,
  dosage: string,
  chainId: string,
): ContinuityActiveMedication {
  return {
    chainId,
    versionId: `${chainId}-v1`,
    medicationName: name,
    dosage,
    status: "active",
    issuedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("RC-19A Sprint 2 D6 Continuity medication dedupe", () => {
  it("keeps a single Losartan row when CCP returns duplicates", () => {
    const rows = visibleContinuityMedications([
      med("Losartan", "50 mg", "a"),
      med("Losartán", "50mg", "b"),
    ]);
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.medicationName, "Losartan");
  });

  it("hides names already listed in the Clinical Snapshot", () => {
    const rows = visibleContinuityMedications(
      [med("Losartan", "50 mg", "a"), med("Paracetamol", "500 mg", "c")],
      ["Losartán"],
    );
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.medicationName, "Paracetamol");
  });
});
