import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatStructuredClinicalNote,
  mapAssistToClinicalSummary,
} from "./clinical-summary-quality";

describe("clinical-summary-quality", () => {
  it("genera secciones clínicas estructuradas", () => {
    const note = formatStructuredClinicalNote({
      chiefComplaint: "Cefalea",
      draftNotes: "Cefalea holocraneana de 3 días.",
      treatment: "Analgesia según tolerancia",
      activeDiagnosis: "I10 — Hipertensión esencial",
      assist: {
        assistiveOnlyNotice: "Verificar en consulta.",
        possibleDiagnoses: ["Considerar cefalea tensional"],
        recommendations: ["Control en 7 días si persiste"],
        generalEducation: ["Hidratación adecuada"],
      },
    });
    assert.match(note, /Motivo de consulta/);
    assert.match(note, /Anamnesis/);
    assert.match(note, /Impresión diagnóstica/);
    assert.match(note, /Seguimiento/);
  });

  it("mapea consultation-assist a summary clínico", () => {
    const mapped = mapAssistToClinicalSummary(
      {
        assistiveOnlyNotice: "Asistivo",
        possibleDiagnoses: ["Considerar HTA descompensada"],
        recommendations: ["Control de presión arterial"],
        generalEducation: ["Dieta baja en sodio"],
      },
      {
        chiefComplaint: "Cefalea",
        draftNotes: "PA elevada en domicilio.",
        activeDiagnosis: "I10 — Hipertensión esencial",
      },
    );
    assert.ok(mapped.improvedNotes.length > 80);
    assert.ok(mapped.suggestedDiagnosis.length >= 1);
  });
});
