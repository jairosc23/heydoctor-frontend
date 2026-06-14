import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildGenerativeContextSummary,
  mapAssistToGenerativeView,
  partitionAssistRecommendations,
} from "./copilot-generative-section";

describe("copilot-generative-section Phase 4.8.3B", () => {
  it("buildGenerativeContextSummary compone motivo, notas y diagnóstico", () => {
    const summary = buildGenerativeContextSummary({
      chiefComplaint: "Cefalea intensa",
      notes: "Inicio ayer, sin fiebre.",
      diagnosis: "R51 — Cefalea",
      treatment: "Paracetamol PRN",
    });
    assert.match(summary, /Motivo: Cefalea intensa/);
    assert.match(summary, /Notas: Inicio ayer/);
    assert.match(summary, /R51/);
    assert.match(summary, /Paracetamol/);
  });

  it("buildGenerativeContextSummary indica vacío sin datos", () => {
    const summary = buildGenerativeContextSummary({});
    assert.match(summary, /Sin motivo ni notas/);
  });

  it("partitionAssistRecommendations separa seguimiento de conducta", () => {
    const { conduct, followUp } = partitionAssistRecommendations([
      "Iniciar analgesia según peso",
      "Control clínico en 7 días",
      "Solicitar TAC si empeora",
    ]);
    assert.equal(conduct.length, 2);
    assert.equal(followUp.length, 1);
    assert.match(followUp[0] ?? "", /Control clínico/);
  });

  it("mapAssistToGenerativeView mapea secciones UX del Copilot", () => {
    const view = mapAssistToGenerativeView(
      {
        assistiveOnlyNotice: "Solo apoyo informativo.",
        possibleDiagnoses: ["I10 — HTA"],
        recommendations: [
          "Ajustar antihipertensivo",
          "Control en 2 semanas",
        ],
        generalEducation: ["Dieta baja en sodio"],
      },
      {
        chiefComplaint: "PA elevada",
        notes: "152/98 en consulta",
      },
    );
    assert.match(view.clinicalSummary, /PA elevada/);
    assert.deepEqual(view.differentialDiagnoses, ["I10 — HTA"]);
    assert.ok(view.suggestedConduct.some((c) => /antihipertensivo/i.test(c)));
    assert.ok(view.followUp.some((f) => /Control/i.test(f)));
    assert.deepEqual(view.patientEducation, ["Dieta baja en sodio"]);
  });
});
