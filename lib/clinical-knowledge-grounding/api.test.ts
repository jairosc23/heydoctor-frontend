import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalKnowledgeGroundingTypes, previewPath } from "./api";
import type { ClinicalKnowledgeGroundingPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(groundingType: string, overrides: Record<string, unknown> = {}) {
  return {
    groundingType,
    title: groundingType === "grounded_attribution" ? "Atribución trazable" : groundingType,
    supportsPreview: true,
    supportsGrounding: true,
    supportsAdvise: false,
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
    inClinicalKnowledgeGroundingScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(groundingType: string, overrides: Record<string, unknown> = {}): ClinicalKnowledgeGroundingPreviewResponse {
  return {
    data: {
      groundingType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "standing-1",
          groundingType,
          title: "Atribución trazable",
          description: "Atribución trazable",
          status: "constituted",
          groundingStance: "restrict",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: groundingType, citations: [{ engineId: "scientific-1", engineClass: "provenance_standing" }] },
          provenance: { origin: "clinical_knowledge_grounding", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ engineId: "scientific-1", engineClass: "provenance_standing" }] },
          groundingSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          groundingChannel: "clinical_knowledge_grounding",
          supportsPreview: true,
          supportsGrounding: true,
    supportsAdvise: false,
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
          inClinicalKnowledgeGroundingScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(groundingType),
      ...overrides,
    },
  } as ClinicalKnowledgeGroundingPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("grounded_attribution", CONSULTATION_ID),
    `/clinical-knowledge-grounding/grounded_attribution/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("withheld_attribution", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-knowledge-grounding/withheld_attribution/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("grounded_attribution", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("grounded_attribution", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("grounded_attribution", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("grounded_attribution", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalKnowledgeGroundingTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/withheld_attribution/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/conditional_attribution/")) {
      return preview("conditional_attribution", {
        capability: capability("conditional_attribution", { title: "Atribución condicionada" }),
      });
    }
    return preview("grounded_attribution");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalKnowledgeGroundingTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.groundingType), ["grounded_attribution", "conditional_attribution"]);
    assert.equal(items[0]?.capability.supportsGrounding, true);
    assert.equal(items[0]?.capability.supportsAdvise, false);
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

test("listEnabledClinicalKnowledgeGroundingTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalKnowledgeGroundingTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
