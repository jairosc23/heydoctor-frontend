import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalScientificGovernanceTypes, previewPath } from "./api";
import type { ClinicalScientificGovernancePreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(scientificType: string, overrides: Record<string, unknown> = {}) {
  return {
    scientificType,
    title: scientificType === "provenance_standing" ? "Gobernanza de procedencia" : scientificType,
    supportsPreview: true,
    supportsScientificGovernance: true,
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
    inClinicalScientificGovernanceScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(scientificType: string, overrides: Record<string, unknown> = {}): ClinicalScientificGovernancePreviewResponse {
  return {
    data: {
      scientificType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "standing-1",
          scientificType,
          title: "Gobernanza de procedencia",
          description: "Gobernanza de procedencia",
          status: "constituted",
          scientificStance: "conflicted",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: scientificType, citations: [{ knowledgeId: "knowledge-1" }, { evidenceId: "evidence-1" }] },
          provenance: { origin: "clinical_scientific_governance", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ knowledgeId: "knowledge-1" }, { evidenceId: "evidence-1" }] },
          scientificSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          scientificChannel: "clinical_scientific_governance",
          supportsPreview: true,
          supportsScientificGovernance: true,
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
          inClinicalScientificGovernanceScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(scientificType),
      ...overrides,
    },
  } as ClinicalScientificGovernancePreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("provenance_standing", CONSULTATION_ID),
    `/clinical-scientific-governance/provenance_standing/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("conflict_standing", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-scientific-governance/conflict_standing/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("provenance_standing", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("provenance_standing", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("provenance_standing", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("provenance_standing", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalScientificGovernanceTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/conflict_standing/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/retraction_standing/")) {
      return preview("retraction_standing", {
        capability: capability("retraction_standing", { title: "Gobernanza de retractación" }),
      });
    }
    return preview("provenance_standing");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalScientificGovernanceTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.scientificType), ["provenance_standing", "retraction_standing"]);
    assert.equal(items[0]?.capability.supportsScientificGovernance, true);
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

test("listEnabledClinicalScientificGovernanceTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalScientificGovernanceTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
