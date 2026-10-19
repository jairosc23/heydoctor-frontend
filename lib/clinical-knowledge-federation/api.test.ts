import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalKnowledgeFederationTypes, previewPath } from "./api";
import type { ClinicalKnowledgeFederationPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(federationType: string, overrides: Record<string, unknown> = {}) {
  return {
    federationType,
    title: federationType === "federable_standing" ? "Federación compartible" : federationType,
    supportsPreview: true,
    supportsFederation: true,
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
    inClinicalKnowledgeFederationScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(federationType: string, overrides: Record<string, unknown> = {}): ClinicalKnowledgeFederationPreviewResponse {
  return {
    data: {
      federationType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "standing-1",
          federationType,
          title: "Federación compartible",
          description: "Federación compartible",
          status: "constituted",
          federationStance: "restrict",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: federationType, citations: [{ scientificId: "scientific-1", scientificClass: "provenance_standing" }] },
          provenance: { origin: "clinical_knowledge_federation", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ scientificId: "scientific-1", scientificClass: "provenance_standing" }] },
          federationSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          federationChannel: "clinical_knowledge_federation",
          supportsPreview: true,
          supportsFederation: true,
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
          inClinicalKnowledgeFederationScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(federationType),
      ...overrides,
    },
  } as ClinicalKnowledgeFederationPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("federable_standing", CONSULTATION_ID),
    `/clinical-knowledge-federation/federable_standing/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("retained_standing", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-knowledge-federation/retained_standing/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("federable_standing", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("federable_standing", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("federable_standing", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("federable_standing", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalKnowledgeFederationTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/retained_standing/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/restricted_standing/")) {
      return preview("restricted_standing", {
        capability: capability("restricted_standing", { title: "Federación restringida" }),
      });
    }
    return preview("federable_standing");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalKnowledgeFederationTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.federationType), ["federable_standing", "restricted_standing"]);
    assert.equal(items[0]?.capability.supportsFederation, true);
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

test("listEnabledClinicalKnowledgeFederationTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalKnowledgeFederationTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
