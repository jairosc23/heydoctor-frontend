import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAntecedentsFlushPayload,
  partitionPersonalAntecedents,
} from "./patient-antecedents-flush";
import { jsonLinesToList } from "./patient-profile-display";

describe("partitionPersonalAntecedents (PR-A)", () => {
  it("keeps surgeries/disabilities when still present in personales", () => {
    const profile = {
      surgeries: [{ label: "Apendicectomía" }],
      disabilities: [{ label: "Limitación rodilla" }],
    };
    const personalText = "HTA\nApendicectomía\nLimitación rodilla";
    const part = partitionPersonalAntecedents(personalText, profile);
    assert.deepEqual(jsonLinesToList(part.chronicConditions), ["HTA"]);
    assert.deepEqual(jsonLinesToList(part.surgeries), ["Apendicectomía"]);
    assert.deepEqual(jsonLinesToList(part.disabilities), [
      "Limitación rodilla",
    ]);
  });

  it("does not wipe surgeries when flush consolidates new chronic lines", () => {
    const profile = {
      surgeries: [{ label: "Apendicectomía" }],
      disabilities: [],
    };
    const personalText = "HTA\nDM2\nApendicectomía";
    const part = partitionPersonalAntecedents(personalText, profile);
    assert.deepEqual(jsonLinesToList(part.surgeries), ["Apendicectomía"]);
    assert.ok(jsonLinesToList(part.chronicConditions).includes("HTA"));
    assert.ok(jsonLinesToList(part.chronicConditions).includes("DM2"));
    assert.ok(!jsonLinesToList(part.chronicConditions).includes("Apendicectomía"));
  });

  it("allows intentional removal of a surgery line from the editor", () => {
    const profile = {
      surgeries: [{ label: "Apendicectomía" }],
      disabilities: [],
    };
    const part = partitionPersonalAntecedents("HTA", profile);
    assert.deepEqual(jsonLinesToList(part.surgeries), []);
    assert.deepEqual(jsonLinesToList(part.chronicConditions), ["HTA"]);
  });

  it("buildAntecedentsFlushPayload never forces empty surgeries when line remains", () => {
    const payload = buildAntecedentsFlushPayload(
      {
        personalText: "HTA\nApendicectomía",
        medicationsText: "Losartán",
        allergiesText: "",
        familyText: "",
      },
      { surgeries: [{ label: "Apendicectomía" }], disabilities: [] },
    );
    assert.deepEqual(jsonLinesToList(payload.surgeries), ["Apendicectomía"]);
    assert.notEqual(payload.surgeries?.length, 0);
  });
});
