import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ContinuityContext } from "@/lib/continuity-platform/types";
import {
  isContinuityContextEmpty,
  uiStateForContext,
} from "./continuity-panel-empty";

function base(): ContinuityContext {
  return {
    apiVersion: "pr9-ccp-v1",
    patientId: "p1",
    clinicId: "c1",
    assembledAt: "2026-07-26T00:00:00.000Z",
    activeMedications: [],
    timelineSummary: {
      window: { from: "a", to: "b" },
      events: [],
    },
    hints: [],
  };
}

describe("PR-10 C1 Empty convention (I2)", () => {
  it("empty when all arrays zero", () => {
    assert.equal(isContinuityContextEmpty(base()), true);
    assert.equal(uiStateForContext(base()), "Empty");
  });

  it("not empty when any section has data", () => {
    const withMed = {
      ...base(),
      activeMedications: [
        {
          chainId: "c",
          versionId: "v",
          medicationName: "X",
          status: "active" as const,
          issuedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    };
    assert.equal(isContinuityContextEmpty(withMed), false);
    assert.equal(uiStateForContext(withMed), "Loaded");
  });
});
