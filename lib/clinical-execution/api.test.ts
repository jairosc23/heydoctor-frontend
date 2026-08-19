import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalExecutionTypes, previewPath } from "./api";
import type { ClinicalExecutionPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(executionType: string, overrides: Record<string, unknown> = {}) {
  return {
    executionType,
    title: executionType === "therapeutic_execution" ? "Ejecución terapéutica" : executionType,
    supportsPreview: true,
    supportsExecution: true,
    supportsDiagnosis: false as const,
    supportsDecision: false as const,
    supportsGovernance: false as const,
    supportsAuthorization: false as const,
    supportsEmission: false as const,
    immutable: true as const,
    inClinicalExecutionScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(executionType: string, overrides: Record<string, unknown> = {}): ClinicalExecutionPreviewResponse {
  return {
    data: {
      executionType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "execution-1",
          executionType,
          title: "Ejecución terapéutica",
          description: "Ejecución terapéutica",
          status: "progressed",
          progression: "hold",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: executionType, decisions: [{ decisionId: "decision-1" }] },
          provenance: { origin: "human_decision", decisionConstituted: true },
          sourceRefs: { decisions: [{ decisionId: "decision-1" }] },
          executionSetId: null,
          progressedAt: "2026-08-17T20:00:00.000Z",
          executionChannel: "clinical_execution",
          supportsPreview: true,
          supportsExecution: true,
          supportsDiagnosis: false,
          supportsDecision: false,
          supportsGovernance: false,
          supportsAuthorization: false,
          supportsEmission: false,
          immutable: true,
          inClinicalExecutionScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(executionType),
      ...overrides,
    },
  } as ClinicalExecutionPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_execution", CONSULTATION_ID),
    `/clinical-execution/therapeutic_execution/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_execution", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-execution/investigation_execution/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("therapeutic_execution", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("therapeutic_execution", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("therapeutic_execution", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("therapeutic_execution", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalExecutionTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_execution/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/precaution_execution/")) {
      return preview("precaution_execution", {
        capability: capability("precaution_execution", { title: "Ejecución de precaución" }),
      });
    }
    return preview("therapeutic_execution");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalExecutionTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.executionType), ["therapeutic_execution", "precaution_execution"]);
    assert.equal(items[0]?.capability.supportsExecution, true);
    assert.equal(items[0]?.capability.supportsDecision, false);
    assert.equal(items[0]?.capability.supportsGovernance, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsEmission, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalExecutionTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalExecutionTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
