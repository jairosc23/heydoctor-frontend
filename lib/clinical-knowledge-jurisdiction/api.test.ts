import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalKnowledgeJurisdictionTypes, previewPath } from "./api";
import type { ClinicalKnowledgeJurisdictionPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(jurisdictionType: string, overrides: Record<string, unknown> = {}) {
  return {
    jurisdictionType,
    title: jurisdictionType === "in_force_standing" ? "Vigencia jurisdiccional" : jurisdictionType,
    supportsPreview: true,
    supportsJurisdiction: true,
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
    inClinicalKnowledgeJurisdictionScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(jurisdictionType: string, overrides: Record<string, unknown> = {}): ClinicalKnowledgeJurisdictionPreviewResponse {
  return {
    data: {
      jurisdictionType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "standing-1",
          jurisdictionType,
          title: "Vigencia jurisdiccional",
          description: "Vigencia jurisdiccional",
          status: "constituted",
          jurisdictionStance: "restrict",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: jurisdictionType, citations: [{ federationId: "scientific-1", federationClass: "provenance_standing" }] },
          provenance: { origin: "clinical_knowledge_jurisdiction", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ federationId: "scientific-1", federationClass: "provenance_standing" }] },
          jurisdictionSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          jurisdictionChannel: "clinical_knowledge_jurisdiction",
          supportsPreview: true,
          supportsJurisdiction: true,
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
          inClinicalKnowledgeJurisdictionScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(jurisdictionType),
      ...overrides,
    },
  } as ClinicalKnowledgeJurisdictionPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("in_force_standing", CONSULTATION_ID),
    `/clinical-knowledge-jurisdiction/in_force_standing/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("withheld_standing", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-knowledge-jurisdiction/withheld_standing/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("in_force_standing", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("in_force_standing", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("in_force_standing", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("in_force_standing", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalKnowledgeJurisdictionTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/withheld_standing/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/conditional_standing/")) {
      return preview("conditional_standing", {
        capability: capability("conditional_standing", { title: "Vigencia condicionada" }),
      });
    }
    return preview("in_force_standing");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalKnowledgeJurisdictionTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.jurisdictionType), ["in_force_standing", "conditional_standing"]);
    assert.equal(items[0]?.capability.supportsJurisdiction, true);
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

test("listEnabledClinicalKnowledgeJurisdictionTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalKnowledgeJurisdictionTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
