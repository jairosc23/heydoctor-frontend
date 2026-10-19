import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalKnowledgeTypes, previewPath } from "./api";
import type { ClinicalKnowledgePreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(knowledgeType: string, overrides: Record<string, unknown> = {}) {
  return {
    knowledgeType,
    title: knowledgeType === "protocol_knowledge" ? "Conocimiento de protocolo" : knowledgeType,
    supportsPreview: true,
    supportsKnowledge: true,
    supportsLearning: false as const,
    supportsReentry: false as const,
    supportsDiagnosis: false as const,
    supportsDecision: false as const,
    supportsGovernance: false as const,
    supportsAuthorization: false as const,
    supportsExecution: false as const,
    supportsEmission: false as const,
    immutable: true as const,
    inClinicalKnowledgeScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(knowledgeType: string, overrides: Record<string, unknown> = {}): ClinicalKnowledgePreviewResponse {
  return {
    data: {
      knowledgeType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "knowledge-1",
          knowledgeType,
          title: "Conocimiento de protocolo",
          description: "Conocimiento de protocolo",
          status: "constituted",
          knowledgeStance: "withhold",
          countryCode: "CL",
          locale: "es-CL",
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          payload: { kind: knowledgeType, citations: [{ knowledgeId: "ref-1" }] },
          provenance: { origin: "clinical_knowledge", phiFree: true },
          parties: { clinic: { name: "Clinica Demo", countryCode: "CL" } },
          sourceRefs: { citations: [{ knowledgeId: "ref-1" }] },
          knowledgeSetId: null,
          constitutedAt: "2026-08-17T20:00:00.000Z",
          knowledgeChannel: "clinical_knowledge",
          supportsPreview: true,
          supportsKnowledge: true,
          supportsLearning: false,
          supportsReentry: false,
          supportsDiagnosis: false,
          supportsDecision: false,
          supportsGovernance: false,
          supportsAuthorization: false,
          supportsExecution: false,
          supportsEmission: false,
          immutable: true,
          inClinicalKnowledgeScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(knowledgeType),
      ...overrides,
    },
  } as ClinicalKnowledgePreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("protocol_knowledge", CONSULTATION_ID),
    `/clinical-knowledge/protocol_knowledge/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("relational_knowledge", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-knowledge/relational_knowledge/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("protocol_knowledge", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("protocol_knowledge", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("protocol_knowledge", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("protocol_knowledge", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalKnowledgeTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/relational_knowledge/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/constraint_knowledge/")) {
      return preview("constraint_knowledge", {
        capability: capability("constraint_knowledge", { title: "Conocimiento de restricción" }),
      });
    }
    return preview("protocol_knowledge");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalKnowledgeTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.knowledgeType), ["protocol_knowledge", "constraint_knowledge"]);
    assert.equal(items[0]?.capability.supportsKnowledge, true);
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

test("listEnabledClinicalKnowledgeTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalKnowledgeTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
