import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildAiSyncPatch,
  buildConsultationSummaryRequest,
  createClinicalAiRequestId,
  registerClinicalAiBeforeRequestHook,
} from "./clinical-ai-facade";
import {
  CLINICAL_AI_FACADE_CONSUMERS,
  CLINICAL_AI_FACADE_ENDPOINTS,
  runClinicalAiFacadeAudit,
} from "./clinical-ai-facade-audit";

describe("clinical-ai-facade Phase 4.8.3A", () => {
  it("createClinicalAiRequestId genera id no vacío", () => {
    const id = createClinicalAiRequestId();
    assert.ok(id.length >= 8);
    assert.notEqual(createClinicalAiRequestId(), id);
  });

  it("registerClinicalAiBeforeRequestHook registra hook de throttling/observabilidad", () => {
    const unregister = registerClinicalAiBeforeRequestHook((_op, reqId) => {
      assert.ok(reqId.length > 0);
    });
    assert.equal(typeof unregister, "function");
    unregister();
  });

  it("buildConsultationSummaryRequest incluye contexto clínico", () => {
    const req = buildConsultationSummaryRequest({
      consultationId: "c-1",
      chiefComplaint: "Cefalea",
      draftNotes: "Paciente refiere dolor occipital",
      patientAge: 45,
      patientSex: "F",
    });
    assert.equal(req.consultationId, "c-1");
    assert.match(req.clientSnapshot?.clinicalContextPrompt ?? "", /Cefalea/);
    assert.equal(req.clientSnapshot?.patientAge, "45");
  });

  it("buildAiSyncPatch mapea campos de consulta", () => {
    const patch = buildAiSyncPatch({
      consultationId: "c-2",
      draftNotes: "Notas",
      chiefComplaint: "Dolor",
      treatment: "Paracetamol",
      cie10CodeId: "uuid-cie10",
      activeDiagnosis: { code: "R51", description: "Cefalea" },
    });
    assert.equal(patch.notes, "Notas");
    assert.equal(patch.reason, "Dolor");
    assert.match(String(patch.diagnosis ?? ""), /R51/);
    assert.equal(patch.cie10CodeId, "uuid-cie10");
  });
});

describe("clinical-ai-facade-audit Phase 4.8.3A", () => {
  it("inventaria 4 consumidores migrados", () => {
    assert.equal(CLINICAL_AI_FACADE_CONSUMERS.length, 4);
    assert.ok(CLINICAL_AI_FACADE_CONSUMERS.every((c) => c.migrated));
  });

  it("centraliza 5 operaciones/endpoints", () => {
    assert.equal(CLINICAL_AI_FACADE_ENDPOINTS.length, 5);
    const ops = new Set(CLINICAL_AI_FACADE_ENDPOINTS.map((e) => e.operation));
    assert.ok(ops.has("inline_note_suggestions"));
    assert.ok(ops.has("consultation_insights"));
    assert.ok(ops.has("autofill_record"));
  });

  it("ningún componente llama IA generativa directamente", () => {
    const audit = runClinicalAiFacadeAudit();
    if (!audit.passed) {
      assert.fail(
        `Violaciones facade: ${JSON.stringify(audit.componentViolations, null, 2)}`,
      );
    }
    assert.equal(audit.consumersMigrated, 4);
    assert.equal(audit.endpointsCentralized, 5);
  });
});
