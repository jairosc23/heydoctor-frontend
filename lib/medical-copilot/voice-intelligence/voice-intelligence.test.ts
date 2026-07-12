import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  analyzeClinicalVoiceText,
  createClinicalVoiceIntelligenceService,
  CLINICAL_VOICE_INTELLIGENCE_GOVERNANCE,
} from "./index";

describe("analyzeClinicalVoiceText", () => {
  it("marks empty text as incomplete without generative AI", () => {
    const analysis = analyzeClinicalVoiceText("");
    assert.equal(analysis.governance.usesGenerativeAi, false);
    assert.equal(analysis.governance.writesToEmr, false);
    assert.equal(analysis.governance.generatesSoap, false);
    assert.ok(
      analysis.suggestions.every((s) => s.requiresPhysicianReview === true),
    );
    assert.ok(
      analysis.suggestions.every((s) => s.autoAppliesToDictation === false),
    );
    assert.ok(
      analysis.suggestions.some((s) => s.type === "incomplete_text"),
    );
  });

  it("flags short text and pending sections", () => {
    const analysis = analyzeClinicalVoiceText(
      "Paciente refiere dolor de cabeza desde ayer.",
    );
    assert.ok(
      analysis.suggestions.some((s) => s.type === "incomplete_text") ||
        analysis.suggestions.some((s) => s.type === "pending_clinical_section"),
    );
    assert.ok(
      analysis.suggestions.some((s) => s.type === "pending_clinical_section"),
    );
  });

  it("detects structural inconsistency with unbalanced parentheses", () => {
    const analysis = analyzeClinicalVoiceText(
      "Motivo de consulta: cefalea (intensa. Examen neurológico normal. Diagnóstico: cefalea tensional. Plan: analgesia.",
    );
    assert.ok(
      analysis.suggestions.some((s) => s.type === "structural_inconsistency"),
    );
  });

  it("includes configurable reminders without mutating input", () => {
    const text = "Motivo anamnesis examen diagnóstico plan completo con suficiente longitud para revisión.";
    const before = text;
    const analysis = analyzeClinicalVoiceText(text, {
      reminders: ["Confirmar alergias"],
      minCompleteLength: 10,
      expectedSections: ["motivo", "plan"],
    });
    assert.equal(before, text);
    assert.ok(
      analysis.suggestions.some(
        (s) =>
          s.type === "configurable_reminder" &&
          s.title === "Confirmar alergias",
      ),
    );
  });

  it("exposes fixed governance constants", () => {
    assert.deepEqual(CLINICAL_VOICE_INTELLIGENCE_GOVERNANCE, {
      requiresPhysicianReview: true,
      generatesSoap: false,
      writesToEmr: false,
      usesGenerativeAi: false,
    });
  });
});

describe("ClinicalVoiceIntelligenceService", () => {
  it("analyzes snapshots without persistence API", () => {
    const service = createClinicalVoiceIntelligenceService({
      minCompleteLength: 5,
    });
    const a = service.analyze("corto");
    const b = service.analyze("corto");
    assert.equal(a.sourceTextHash, b.sourceTextHash);
    assert.notEqual(a.analysisId, b.analysisId);
  });
});
