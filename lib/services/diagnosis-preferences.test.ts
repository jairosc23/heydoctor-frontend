import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { DiagnosisSuggestion } from "./diagnosis-preferences";

describe("DiagnosisSuggestion shape", () => {
  it("supports favorite recent and frequent sources", () => {
    const favorite: DiagnosisSuggestion = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      code: "I10",
      description: "Hipertensión esencial",
      source: "favorite",
      isFavorite: true,
      sortOrder: 0,
    };
    const recent: DiagnosisSuggestion = {
      id: "11111111-1111-4111-8111-111111111111",
      code: "R51",
      description: "Cefalea",
      source: "recent",
      isFavorite: false,
      lastUsedAt: "2026-06-06T12:00:00.000Z",
    };
    const frequent: DiagnosisSuggestion = {
      id: "22222222-2222-4222-8222-222222222222",
      code: "E11.9",
      description: "DM tipo 2",
      source: "frequent",
      isFavorite: true,
      useCount: 12,
    };
    assert.equal(favorite.source, "favorite");
    assert.equal(recent.source, "recent");
    assert.equal(frequent.useCount, 12);
  });
});
