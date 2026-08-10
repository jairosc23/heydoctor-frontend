import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  habitLinesFromProfile,
  habitsFromProfile,
  habitsToPayload,
} from "./patient-profile-habits";
import { jsonLinesToList, textToJsonLines } from "./patient-profile-display";

describe("patient profile habits (DTO strings, not JSONB arrays)", () => {
  it("round-trips strings without wrapping them as {label} arrays", () => {
    const draft = habitsFromProfile({
      smokingStatus: "ocasional",
      alcoholUse: "social",
      drugUse: null,
      exerciseFrequency: "3x semana",
    });
    const payload = habitsToPayload(draft);
    assert.equal(payload.smokingStatus, "ocasional");
    assert.equal(payload.alcoholUse, "social");
    assert.equal(payload.drugUse, null);
    assert.equal(payload.exerciseFrequency, "3x semana");
    assert.equal(Array.isArray(payload.smokingStatus), false);
  });

  it("never emits nested empty arrays [[]] (PR #97 regression)", () => {
    const payload = habitsToPayload({
      smokingStatus: "PENICILINA",
      alcoholUse: "",
      drugUse: "  ",
      exerciseFrequency: "HTA",
    });
    for (const value of Object.values(payload)) {
      assert.equal(Array.isArray(value), false);
      assert.notDeepEqual(value, [[]]);
    }
  });

  it("formats read-only chips without going through textToJsonLines", () => {
    const lines = habitLinesFromProfile({
      smokingStatus: "nunca",
      alcoholUse: "",
      drugUse: null,
      exerciseFrequency: "diario",
    });
    assert.deepEqual(lines, ["Tabaco: nunca", "Actividad física: diario"]);
  });

  it("familyHistory JSONB {label} still round-trips like allergies (PR #97)", () => {
    const family = textToJsonLines("DM padre\nCA mama: materna");
    assert.deepEqual(family, [
      { label: "DM padre" },
      { label: "CA mama", detail: "materna" },
    ]);
    assert.deepEqual(jsonLinesToList(family), ["DM padre", "CA mama: materna"]);
    assert.notDeepEqual(family, [[]]);
  });
});
