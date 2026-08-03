import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  jsonLinesToList,
  jsonLinesToText,
  textToJsonLines,
} from "./patient-profile-display";

/**
 * Mirrors PatientAntecedentsSection draft/read merge contract:
 * personales = chronic ∪ surgeries ∪ disabilities (unique lines).
 */
function mergeLines(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const group of groups) {
    for (const line of group) {
      if (!seen.has(line)) {
        seen.add(line);
        out.push(line);
      }
    }
  }
  return out;
}

function personalDraftText(profile: {
  chronicConditions?: Record<string, unknown>[];
  surgeries?: Record<string, unknown>[];
  disabilities?: Record<string, unknown>[];
}): string {
  return mergeLines(
    jsonLinesToList(profile.chronicConditions),
    jsonLinesToList(profile.surgeries),
    jsonLinesToList(profile.disabilities),
  ).join("\n");
}

describe("patient antecedents draft contract", () => {
  it("edit draft includes surgeries/disabilities that read-mode shows", () => {
    const profile = {
      chronicConditions: [{ label: "HTA" }],
      surgeries: [{ label: "Apendicectomía" }],
      disabilities: [{ label: "Limitación rodilla" }],
    };
    const text = personalDraftText(profile);
    assert.match(text, /HTA/);
    assert.match(text, /Apendicectomía/);
    assert.match(text, /Limitación rodilla/);
  });

  it("round-trips personal lines into chronicConditions JSONB shape", () => {
    const text = "HTA\nApendicectomía: 2019";
    const lines = textToJsonLines(text);
    assert.equal(jsonLinesToText(lines), text);
  });
});
