import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalAuthorityActs, previewPath } from "./api";
import type { ClinicalAuthorityPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PREVIEW_ID = "22222222-2222-4222-8222-222222222222";

function capability(actClass: string, overrides: Record<string, unknown> = {}) {
  return {
    actClass,
    title:
      actClass === "encounter_close"
        ? "Acto de cierre de encuentro"
        : actClass,
    supportsPreview: true,
    supportsConfirm: true,
    supportsAuthorize: true,
    supportsEmission: false as const,
    requiresHitl: true as const,
    requiresPhysician: true as const,
    inAuthoritySpineScope: true,
    enabledCountries: "*" as const,
    ...overrides,
  };
}

function preview(
  actClass: string,
  overrides: Record<string, unknown> = {},
): ClinicalAuthorityPreviewResponse {
  return {
    data: {
      actClass,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "act-1",
          actClass,
          title: "Acto de cierre de encuentro",
          description: "Acto de cierre de encuentro",
          status: "proposed",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          validity: null,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: { kind: actClass },
          provenance: { origin: "encounter", hitlRequired: true },
          sourceRefs: [],
          confirmedBy: null,
          decisionReason: null,
          habDecisionId: null,
          emissionId: null,
          emittedAt: null,
          authorityChannel: "clinical_authority_spine",
          supportsPreview: true,
          supportsConfirm: true,
          supportsAuthorize: true,
          supportsEmission: false,
          requiresHitl: true,
          requiresPhysician: true,
          inAuthoritySpineScope: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(actClass),
      ...overrides,
    },
  } as ClinicalAuthorityPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("encounter_close", CONSULTATION_ID),
    `/clinical-authority/encounter_close/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("medication", CONSULTATION_ID, PREVIEW_ID),
    `/clinical-authority/medication/preview?consultationId=${CONSULTATION_ID}&previewId=${PREVIEW_ID}`,
  );
  assert.equal(
    previewPath("order", CONSULTATION_ID).includes("/confirm"),
    false,
  );
  assert.equal(
    previewPath("order", CONSULTATION_ID).includes("/authorize"),
    false,
  );
});

test("listEnabledClinicalAuthorityActs hides 403 and classes without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/order/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/clinical_document/")) {
      return preview("clinical_document", {
        capability: capability("clinical_document", {
          inAuthoritySpineScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/medication/")) {
      return preview("medication", {
        capability: capability("medication", { title: "Acto de medicación" }),
      });
    }
    return preview("encounter_close");
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalAuthorityActs(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.actClass),
      ["medication", "encounter_close"],
    );
    assert.equal(items[0]?.capability.title, "Acto de medicación");
    assert.equal(items[0]?.capability.supportsEmission, false);
    assert.equal(items[0]?.capability.requiresHitl, true);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalAuthorityActs throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalAuthorityActs(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
