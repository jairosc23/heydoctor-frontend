import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalEvidenceTypes, previewPath } from "./api";
import type { ClinicalEvidencePreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(evidenceType: string, overrides: Record<string, unknown> = {}) {
  return {
    evidenceType,
    title: evidenceType === "supporting_evidence" ? "Evidencia de apoyo" : evidenceType,
    supportsPreview: true,
    supportsEvidence: true,
    supportsKnowledge: false as const,
    supportsLearning: false as const,
    supportsReentry: false as const,
    supportsDiagnosis: false as const,
    supportsDecision: false as const,
    supportsGovernance: false as const,
    supportsAuthorization: false as const,
    supportsExecution: false as const,
    supportsEmission: false as const,
    immutable: true as const,
    inClinicalEvidenceScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(evidenceType: string, overrides: Record<string, unknown> = {}): ClinicalEvidencePreviewResponse {
  return {
    data: {
      evidenceType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "evidence-1",
          evidenceType,
          title: "Evidencia de apoyo",
          description: "Evidencia de apoyo",
          status: "constituted",
          evidenceStance: "contradict",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: evidenceType, citations: [{ knowledgeId: "knowledge-1" }] },
          provenance: { origin: "clinical_evidence", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ knowledgeId: "knowledge-1" }] },
          evidenceSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          evidenceChannel: "clinical_evidence",
          supportsPreview: true,
          supportsEvidence: true,
          supportsKnowledge: false,
          supportsLearning: false,
          supportsReentry: false,
          supportsDiagnosis: false,
          supportsDecision: false,
          supportsGovernance: false,
          supportsAuthorization: false,
          supportsExecution: false,
          supportsEmission: false,
          immutable: true,
          inClinicalEvidenceScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(evidenceType),
      ...overrides,
    },
  } as ClinicalEvidencePreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("supporting_evidence", CONSULTATION_ID),
    `/clinical-evidence/supporting_evidence/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("contradicting_evidence", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-evidence/contradicting_evidence/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("supporting_evidence", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("supporting_evidence", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("supporting_evidence", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("supporting_evidence", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalEvidenceTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/contradicting_evidence/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/limiting_evidence/")) {
      return preview("limiting_evidence", {
        capability: capability("limiting_evidence", { title: "Evidencia de limitación" }),
      });
    }
    return preview("supporting_evidence");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalEvidenceTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.evidenceType), ["supporting_evidence", "limiting_evidence"]);
    assert.equal(items[0]?.capability.supportsEvidence, true);
    assert.equal(items[0]?.capability.supportsKnowledge, false);
    assert.equal(items[0]?.capability.supportsLearning, false);
    assert.equal(items[0]?.capability.supportsReentry, false);
    assert.equal(items[0]?.capability.supportsDecision, false);
    assert.equal(items[0]?.capability.supportsGovernance, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsExecution, false);
    assert.equal(items[0]?.capability.supportsEmission, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalEvidenceTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalEvidenceTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
