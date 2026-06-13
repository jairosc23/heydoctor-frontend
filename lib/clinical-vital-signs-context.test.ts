import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  computeBmi,
  extractVitalSignsFromText,
  formatClinicalVitalSignsForContext,
  parseClinicalVitalSignsFromNotes,
  serializeClinicalVitalSigns,
  VITAL_SIGNS_MARKER,
} from "./clinical-vital-signs-context";

describe("clinical-vital-signs-context", () => {
  it("extrae PA y FC desde texto libre del médico", () => {
    const vitals = extractVitalSignsFromText(
      "Paciente con PA 152/98 mmHg y FC 88 lpm.",
    );
    assert.equal(vitals.systolic, 152);
    assert.equal(vitals.diastolic, 98);
    assert.equal(vitals.heartRate, 88);
  });

  it("calcula IMC cuando hay peso y talla documentados", () => {
    const vitals = extractVitalSignsFromText("Peso 70 kg, talla 170 cm.");
    assert.equal(vitals.weightKg, 70);
    assert.equal(vitals.heightCm, 170);
    assert.equal(vitals.bmi, computeBmi(70, 170));
  });

  it("no inventa vitales si el texto no los contiene", () => {
    const ctx = parseClinicalVitalSignsFromNotes("Cefalea holocraneana sin otros datos.");
    assert.equal(ctx.hasData, false);
    assert.equal(ctx.source, "none");
  });

  it("parsea marcador estructurado HD_VS_V1", () => {
    const block = serializeClinicalVitalSigns({
      systolic: 130,
      diastolic: 85,
      heartRate: 76,
    });
    assert.ok(block?.includes(VITAL_SIGNS_MARKER));
    const ctx = parseClinicalVitalSignsFromNotes(`Notas libres.\n\n${block}`);
    assert.equal(ctx.source, "structured_marker");
    assert.equal(ctx.vitals.systolic, 130);
    assert.equal(ctx.vitals.heartRate, 76);
  });

  it("formatea bloque de contexto solo con datos reales", () => {
    const formatted = formatClinicalVitalSignsForContext({
      vitals: { systolic: 120, diastolic: 80, oxygenSaturation: 98 },
      source: "free_text",
      hasData: true,
    });
    assert.match(formatted ?? "", /Signos vitales:/);
    assert.match(formatted ?? "", /120\/80/);
    assert.match(formatted ?? "", /SatO2 98%/);
  });
});
