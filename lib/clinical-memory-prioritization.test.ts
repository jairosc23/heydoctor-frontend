import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { partitionMemoryHighlights } from "./clinical-memory-prioritization";

describe("clinical-memory-prioritization", () => {
  it("mantiene alergias y alertas críticas fuera de overflow", () => {
    const { visible, overflow } = partitionMemoryHighlights({
      allergyLines: ["Penicilina"],
      alerts: [
        {
          code: "CRIT_1",
          severity: "critical",
          message: "Interacción medicamentosa grave",
          source: "rule",
        },
      ],
      highlights: [
        "HTA predominante",
        "Seguimiento activo",
        "3 consultas recientes",
        "Metformina recurrente",
        "Riesgo crítico no identificado",
      ],
      compactVisibleSlots: 3,
    });

    assert.ok(visible.some((h) => h.tier === "allergy"));
    assert.ok(visible.some((h) => h.tier === "critical"));
    assert.ok(!overflow.some((h) => h.tier === "allergy"));
    assert.ok(!overflow.some((h) => h.tier === "critical"));
  });
});
