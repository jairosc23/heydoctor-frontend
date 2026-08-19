import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalReentryTypes, previewPath } from "./api";
import type { ClinicalReentryPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(reentryType: string, overrides: Record<string, unknown> = {}) {
  return {
    reentryType,
    title: reentryType === "therapeutic_reentry" ? "Reingreso terapéutico" : reentryType,
    supportsPreview: true,
    supportsReentry: true,
    supportsLearning: false as const,
    supportsDiagnosis: false as const,
    supportsDecision: false as const,
    supportsGovernance: false as const,
    supportsAuthorization: false as const,
    supportsExecution: false as const,
    supportsEmission: false as const,
    immutable: true as const,
    inClinicalReentryScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(reentryType: string, overrides: Record<string, unknown> = {}): ClinicalReentryPreviewResponse {
  return {
    data: {
      reentryType,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "reentry-1",
          reentryType,
          title: "Reingreso terapéutico",
          description: "Reingreso terapéutico",
          status: "reentered",
          reentryAdmission: "withhold",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: reentryType, learnings: [{ learningId: "learning-1" }] },
          provenance: { origin: "clinical_learning", learningConstituted: true },
          sourceRefs: { learnings: [{ learningId: "learning-1" }] },
          reentrySetId: null,
          reenteredAt: "2026-08-17T20:00:00.000Z",
          reentryChannel: "clinical_reentry",
          supportsPreview: true,
          supportsReentry: true,
          supportsLearning: false,
          supportsDiagnosis: false,
          supportsDecision: false,
          supportsGovernance: false,
          supportsAuthorization: false,
          supportsExecution: false,
          supportsEmission: false,
          immutable: true,
          inClinicalReentryScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(reentryType),
      ...overrides,
    },
  } as ClinicalReentryPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("therapeutic_reentry", CONSULTATION_ID),
    `/clinical-reentry/therapeutic_reentry/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("investigation_reentry", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-reentry/investigation_reentry/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(previewPath("therapeutic_reentry", CONSULTATION_ID).includes("/write"), false);
  assert.equal(previewPath("therapeutic_reentry", CONSULTATION_ID).includes("/accept"), false);
  assert.equal(previewPath("therapeutic_reentry", CONSULTATION_ID).includes("/authorize"), false);
  assert.equal(previewPath("therapeutic_reentry", CONSULTATION_ID).includes("/emit"), false);
});

test("listEnabledClinicalReentryTypes hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/investigation_reentry/")) throw new ApiError("Forbidden", 403);
    if (path.includes("/precaution_reentry/")) {
      return preview("precaution_reentry", {
        capability: capability("precaution_reentry", { title: "Reingreso de precaución" }),
      });
    }
    return preview("therapeutic_reentry");
  }) as typeof heydoctorApi.get;
  try {
    const items = await listEnabledClinicalReentryTypes(CONSULTATION_ID);
    assert.deepEqual(items.map((item) => item.reentryType), ["therapeutic_reentry", "precaution_reentry"]);
    assert.equal(items[0]?.capability.supportsReentry, true);
    assert.equal(items[0]?.capability.supportsLearning, false);
    assert.equal(items[0]?.capability.supportsDecision, false);
    assert.equal(items[0]?.capability.supportsGovernance, false);
    assert.equal(items[0]?.capability.supportsAuthorization, false);
    assert.equal(items[0]?.capability.supportsExecution, false);
    assert.equal(items[0]?.capability.supportsEmission, false);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalReentryTypes throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;
  try {
    await assert.rejects(
      () => listEnabledClinicalReentryTypes(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
