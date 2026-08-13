import test from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../heydoctor-api";
import {
  fileNameFromDisposition,
  listEnabledClinicalDocuments,
  pdfPath,
  previewPath,
} from "./api";

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";

test("preview and pdf paths use only official engine endpoints", () => {
  assert.equal(
    previewPath("visit_summary", CONSULTATION_ID),
    `/clinical-documents/visit_summary/preview?consultationId=${CONSULTATION_ID}`,
  );
  assert.equal(
    pdfPath("visit_summary", CONSULTATION_ID, "attachment"),
    `/clinical-documents/visit_summary/pdf?consultationId=${CONSULTATION_ID}&disposition=attachment`,
  );
  assert.equal(
    fileNameFromDisposition(
      `inline; filename="visit-summary-${CONSULTATION_ID}.pdf"`,
      "visit_summary",
      CONSULTATION_ID,
    ),
    `visit-summary-${CONSULTATION_ID}.pdf`,
  );
});

test("listEnabledClinicalDocuments hides 403 and country-blocked types", async () => {
  const { heydoctorApi } = await import("../heydoctor-api");
  const api = heydoctorApi as { get: typeof heydoctorApi.get };
  const originalGet = api.get;
  api.get = (async (path: string) => {
    if (path.includes("medical_leave")) {
      throw new ApiError("PDF emission is not enabled for this country", 403);
    }
    if (path.includes("clinical_history")) {
      return {
        data: {
          type: "clinical_history",
          consultationId: CONSULTATION_ID,
          model: {
            type: "clinical_history",
            countryCode: "CL",
            clinic: { name: "Clínica Demo", countryCode: "CL" },
            doctor: { name: "Dra. Demo" },
            patient: { name: "Ana Pérez" },
            payload: { kind: "clinical_history" },
            provenance: {
              hitlRequired: true,
              generatedByAi: false,
              sources: ["patient_profile"],
            },
          },
          gate: { ok: true, issues: [] },
        },
      };
    }
    return {
      data: {
        type: "visit_summary",
        consultationId: CONSULTATION_ID,
        model: {
          type: "visit_summary",
          countryCode: "CL",
          clinic: { name: "Clínica Demo", countryCode: "CL" },
          doctor: { name: "Dra. Demo" },
          patient: { name: "Ana Pérez" },
          payload: { kind: "visit_summary" },
          provenance: {
            hitlRequired: true,
            generatedByAi: false,
            sources: ["clinical_foundation"],
          },
        },
        gate: { ok: true, issues: [] },
      },
    };
  }) as typeof heydoctorApi.get;

  try {
    const items = await listEnabledClinicalDocuments(CONSULTATION_ID);
    assert.deepEqual(
      items.map((item) => item.type),
      ["visit_summary", "clinical_history"],
    );
    assert.equal(items[0]?.capability.requiresHitl, true);
    assert.equal(items[0]?.capability.supportsPdf, true);
  } finally {
    api.get = originalGet;
  }
});
