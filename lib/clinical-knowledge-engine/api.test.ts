import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalKnowledgeEngineTypes, previewPath } from "./api";
import type { ClinicalKnowledgeEnginePreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(adviseType: string, overrides: Record<string, unknown> = {}) {
  return {
    adviseType,
    title: adviseType === "eligible_advice" ? "Consejo elegible" : adviseType,
    supportsPreview: true,
    supportsAdvise: true,
    supportsJurisdiction: false,
    supportsFederation: false,
    supportsScientificGovernance: false,
    supportsEvidence: false as const,
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
    inClinicalKnowledgeEngineScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(adviseType: string, overrides: Record<string, unknown> = {}): ClinicalKnowledgeEnginePreviewResponse {
  return {
    data: {
      adviseType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "standing-1",
          adviseType,
          title: "Consejo elegible",
          description: "Consejo elegible",
          status: "constituted",
          adviseStance: "restrict",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: adviseType, citations: [{ jurisdictionId: "scientific-1", jurisdictionClass: "provenance_standing" }] },
          provenance: { origin: "clinical_knowledge_engine", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ jurisdictionId: "scientific-1", jurisdictionClass: "provenance_standing" }] },
          engineSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          engineChannel: "clinical_knowledge_engine",
          supportsPreview: true,
          supportsAdvise: true,
    supportsJurisdiction: false,
    supportsFederation: false,
    supportsScientificGovernance: false,
          supportsEvidence: false,
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
          inClinicalKnowledgeEngineScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(adviseType),
      ...overrides,
    },
  } as ClinicalKnowledgeEnginePreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("eligible_advice", CONSULTATION_ID),
    `/clinical-knowledge-engine/eligible_advice/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("withheld_advice", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-knowledge-engine/withheld_advice/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("eligible_advice", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("eligible_advice", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("eligible_advice", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("eligible_advice", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalKnowledgeEngineTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/withheld_advice/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/conditional_advice/")) {
      return preview("conditional_advice", {
        capability: capability("conditional_advice", { title: "Consejo condicionado" }),
      });
    }
    return preview("eligible_advice");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalKnowledgeEngineTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.adviseType), ["eligible_advice", "conditional_advice"]);
    assert.equal(items[0]?.capability.supportsAdvise, true);
    assert.equal(items[0]?.capability.supportsJurisdiction, false);
    assert.equal(items[0]?.capability.supportsFederation, false);
    assert.equal(items[0]?.capability.supportsScientificGovernance, false);
    assert.equal(items[0]?.capability.supportsKnowledge, false);
    assert.equal(items[0]?.capability.supportsEvidence, false);
    assert.equal(items[0]?.capability.supportsGovernance, false);
    assert.equal(items[0]?.capability.supportsLearning, false);
    assert.equal(items[0]?.capability.supportsDecision, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsExecution, false);
    assert.equal(items[0]?.capability.supportsEmission, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalKnowledgeEngineTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalKnowledgeEngineTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
