import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledHumanDecisionTypes, previewPath } from "./api";
import type { HumanDecisionPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(decisionType: string, overrides: Record<string, unknown> = {}) {
  return {
    decisionType,
    title: decisionType === "therapeutic_decision" ? "Decisión terapéutica" : decisionType,
    supportsPreview: true,
    supportsDecision: true,
    supportsDiagnosis: false as const,
    supportsGovernance: false as const,
    supportsAuthorization: false as const,
    supportsExecution: false as const,
    supportsEmission: false as const,
    immutable: true as const,
    inHumanDecisionScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(decisionType: string, overrides: Record<string, unknown> = {}): HumanDecisionPreviewResponse {
  return {
    data: {
      decisionType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "decision-1",
          decisionType,
          title: "Decisión terapéutica",
          description: "Decisión terapéutica",
          status: "decided",
          disposition: "refine",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: decisionType, governances: [{ governanceId: "governance-1" }] },
          provenance: { origin: "clinical_governance", governanceConstituted: true },
          sourceRefs: { governances: [{ governanceId: "governance-1" }] },
          decisionSetId: null,
          decidedAt: "2026-08-17T18:00:00.000Z",
          decisionChannel: "human_decision",
          supportsPreview: true,
          supportsDecision: true,
          supportsDiagnosis: false,
          supportsGovernance: false,
          supportsAuthorization: false,
          supportsExecution: false,
          supportsEmission: false,
          immutable: true,
          inHumanDecisionScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(decisionType),
      ...overrides,
    },
  } as HumanDecisionPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_decision", CONSULTATION_ID),
    `/human-decision/therapeutic_decision/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_decision", CONSULTATION_ID, PREVIEW_ID),
    `/human-decision/investigation_decision/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("therapeutic_decision", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("therapeutic_decision", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("therapeutic_decision", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("therapeutic_decision", CONSULTATION_ID).includes("/execute"), false);
});

test("listEnabledHumanDecisionTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_decision/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/precaution_decision/")) {
      return preview("precaution_decision", {
        capability: capability("precaution_decision", { title: "Decisión de precaución" }),
      });
    }
    return preview("therapeutic_decision");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledHumanDecisionTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.decisionType), ["therapeutic_decision", "precaution_decision"]);
    assert.equal(items[0]?.capability.supportsDecision, true);
    assert.equal(items[0]?.capability.supportsGovernance, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsExecution, false);
    assert.equal(items[0]?.capability.supportsEmission, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledHumanDecisionTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledHumanDecisionTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
