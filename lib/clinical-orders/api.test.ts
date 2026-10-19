import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import { listEnabledClinicalOrders, previewPath } from "./api";
import type { ClinicalOrderPreviewResponse } from "./types";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const ORDER_ID = "22222222-2222-4222-8222-222222222222";

function capability(
  type: string,
  overrides: Record<string, unknown> = {},
) {
  return {
    type,
    title: type === "prescription" ? "Receta médica" : type,
    supportsPreview: true,
    supportsIssue: true,
    supportsDispatch: false as const,
    supportsDocument: true,
    canBelongToOrderSet: true,
    requiresHitl: true as const,
    requiresPersistedSource: true,
    inClinicalEngineScope: true,
    enabledCountries: "*" as const,
    rxForbiddenInE08: type === "prescription",
    ...overrides,
  };
}

function preview(
  type: string,
  overrides: Record<string, unknown> = {},
): ClinicalOrderPreviewResponse {
  return {
    data: {
      type,
      consultationId: CONSULTATION_ID,
      view: {
        ok: true,
        view: {
          id: "order-1",
          type,
          title: "Receta médica",
          status: "draft",
          priority: "routine",
          countryCode: "CL",
          locale: "es-CL",
          consultationId: CONSULTATION_ID,
          issuedAt: null,
          validity: null,
          clinic: { name: "Clinica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Perez" },
          payload: {
            kind: "prescription",
            medications: [{ name: "Losartan 50 mg" }],
          },
          origin: "encounter",
          hitlRequired: true,
          orderedBy: null,
          approvedBy: null,
          sourceRef: null,
          orderSetId: null,
          supportsPreview: true,
          supportsIssue: true,
          supportsDispatch: false,
          supportsDocument: true,
          requiresPersistedSource: true,
          rxForbiddenInE08: true,
        },
      },
      gate: { ok: true, issues: [] },
      capability: capability(type),
      ...overrides,
    },
  } as ClinicalOrderPreviewResponse;
}

test("previewPath uses only the official HTTP preview endpoint", () => {
  assert.equal(
    previewPath("prescription", CONSULTATION_ID),
    `/clinical-orders/prescription/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    previewPath("laboratory", CONSULTATION_ID, ORDER_ID),
    `/clinical-orders/laboratory/preview?consultationId=${CONSULTATION_ID}&orderId=${ORDER_ID}`,
  );
  assert.equal(previewPath("imaging", CONSULTATION_ID).includes("/pdf"), false);
});

test("listEnabledClinicalOrders hides 403 and types without preview capability", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("/laboratory/")) {
      throw new ApiError("Forbidden", 403);
    }
    if (path.includes("/imaging/")) {
      return preview("imaging", {
        capability: capability("imaging", {
          inClinicalEngineScope: false,
          supportsPreview: false,
        }),
      });
    }
    if (path.includes("/prescription/")) {
      return preview("prescription");
    }
    if (path.includes("/procedure/")) {
      return preview("procedure", {
        capability: capability("procedure", { title: "Orden de procedimiento" }),
      });
    }
    return preview("referral", {
      capability: capability("referral", { title: "Interconsulta" }),
    });
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalOrders(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.type),
      ["prescription", "procedure", "referral"],
    );
    assert.equal(items[0]?.capability.title, "Receta médica");
    assert.equal(items[0]?.capability.supportsDispatch, false);
    assert.equal(items[0]?.capability.rxForbiddenInE08, true);
  } finally {
    api.get = originalGet;
  }
});

test("listEnabledClinicalOrders throws 404 when every preview is missing", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async () => {
    throw new ApiError("Consulta no encontrada", 404);
  }) as typeof heydoctorApi.get;

  try {
    await assert.rejects(
      () => listEnabledClinicalOrders(CONSULTATION_ID),
      (error: unknown) => error instanceof ApiError && error.status === 404,
    );
  } finally {
    api.get = originalGet;
  }
});
