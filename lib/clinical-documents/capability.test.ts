import test from "node:test";
import assert from "node:assert/strict";
import {
  documentCapabilityFromPreview,
  isCountryCapabilityBlocked,
} from "./capability";
import type { ClinicalDocumentPreviewResponse } from "./types";

function preview(
  overrides: Partial<ClinicalDocumentPreviewResponse["data"]> = {},
): ClinicalDocumentPreviewResponse {
  return {
    data: {
      type: "visit_summary",
      consultationId: "11111111-1111-4111-8111-111111111111",
      model: {
        type: "visit_summary",
        countryCode: "CL",
        clinic: { name: "Clínica Demo", countryCode: "CL" },
        doctor: { name: "Dra. Demo" },
        patient: { name: "Ana Pérez" },
        payload: { kind: "visit_summary", reason: "Control HTA" },
        provenance: {
          hitlRequired: true,
          generatedByAi: false,
          sources: ["clinical_foundation"],
        },
      },
      gate: { ok: true, issues: [] },
      ...overrides,
    },
  };
}

test("capability comes from preview gate and provenance, not a local catalog", () => {
  const capability = documentCapabilityFromPreview(preview());
  assert.equal(capability.title, "Resumen de consulta");
  assert.equal(capability.supportsPreview, true);
  assert.equal(capability.supportsPdf, true);
  assert.equal(capability.requiresHitl, true);
  assert.equal(capability.enabledForCountry, true);
  assert.equal(capability.countryCode, "CL");
});

test("country-gated leave is disabled from Gate issues in preview", () => {
  const blocked = preview({
    type: "medical_leave",
    model: {
      type: "medical_leave",
      countryCode: "MX",
      clinic: { name: "Clínica MX", countryCode: "MX" },
      doctor: { name: "Dra. Demo" },
      patient: { name: "Ana Pérez" },
      payload: { kind: "medical_leave" },
      provenance: {
        hitlRequired: true,
        generatedByAi: false,
        sources: ["clinical_foundation"],
      },
    },
    gate: {
      ok: false,
      issues: [
        {
          code: "medical_leave_country_not_enabled",
          field: "countryCode",
          message: "medical leave is not enabled for country MX",
        },
      ],
    },
  });

  assert.equal(isCountryCapabilityBlocked(blocked.data.gate), true);
  const capability = documentCapabilityFromPreview(blocked);
  assert.equal(capability.enabledForCountry, false);
  assert.equal(capability.supportsPdf, false);
  assert.equal(capability.requiresHitl, true);
});

test("incomplete gate keeps the document visible but blocks PDF", () => {
  const incomplete = preview({
    gate: {
      ok: false,
      issues: [
        {
          code: "missing_reason",
          field: "payload.reason",
          message: "reason is required",
        },
      ],
    },
  });
  const capability = documentCapabilityFromPreview(incomplete);
  assert.equal(capability.enabledForCountry, true);
  assert.equal(capability.supportsPdf, false);
});
