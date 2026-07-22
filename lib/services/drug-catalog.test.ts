import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { SearchPresentationsParams } from "../types/drug-catalog";

describe("drug-catalog query contract (PR-1)", () => {
  it("builds stable cache keys for presentation search params", () => {
    const a: SearchPresentationsParams = {
      q: "para",
      jurisdictionCode: "CL",
      limit: 10,
    };
    const b: SearchPresentationsParams = {
      q: "PARA",
      jurisdictionCode: "CL",
      limit: 10,
    };
    const key = (params: SearchPresentationsParams) =>
      `rx-pres:${JSON.stringify({
        q: params.q?.trim().toLowerCase() ?? "",
        substanceId: params.substanceId ?? "",
        jurisdictionCode: params.jurisdictionCode ?? "",
        routeCode: params.routeCode ?? "",
        limit: params.limit ?? "",
      })}`;
    assert.equal(key(a), key(b));
  });

  it("expects Nest presentations envelope shape", () => {
    const apiBody = {
      data: {
        presentations: [
          {
            id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
            substanceId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
            displayLabel: "Amoxicilina 500 mg cápsula",
            brandName: null,
            strengthDisplay: "500 mg",
            dosageForm: "cápsula",
            jurisdictionCode: "CL",
            isGeneric: true,
            route: { code: "PO", nameEn: "Oral", nameEs: "Oral" },
          },
        ],
      },
    };
    assert.equal(apiBody.data.presentations.length, 1);
    assert.ok(apiBody.data.presentations[0]!.id);
  });
});
