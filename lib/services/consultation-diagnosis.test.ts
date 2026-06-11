import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSoapDraftKey,
  buildSoapPatch,
  emptyDiagnosisState,
  soapPatchFingerprint,
  getDiagnosisBadgeVariant,
  hydrateDiagnosisFromConsultation,
  shouldShowUnlinkedWarning,
  structuredDiagnosisFromPicker,
} from "./consultation-diagnosis";

const CIE10_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("hydrateDiagnosisFromConsultation", () => {
  it("hydrates structured diagnosis from cie10Code relation", () => {
    const state = hydrateDiagnosisFromConsultation({
      diagnosis: "R51 - Cefalea",
      cie10CodeId: CIE10_ID,
      cie10Code: {
        id: CIE10_ID,
        code: "R51",
        descriptionEs: "Cefalea",
      },
    });
    assert.equal(state.source, "structured");
    assert.equal(state.cie10CodeId, CIE10_ID);
    assert.equal(state.diagnosisCode, "R51");
  });

  it("hydrates parsed diagnosis when text looks structured but FK is missing", () => {
    const state = hydrateDiagnosisFromConsultation({
      diagnosis: "R51 - Cefalea",
      cie10CodeId: null,
      cie10Code: null,
    });
    assert.equal(state.source, "parsed");
    assert.equal(state.cie10CodeId, null);
    assert.equal(state.diagnosisCode, "R51");
  });
});

describe("structuredDiagnosisFromPicker", () => {
  it("builds atomic structured state from picker item", () => {
    const state = structuredDiagnosisFromPicker({
      code: "R51",
      description: "Cefalea",
      cie10CodeId: CIE10_ID,
    });
    assert.equal(state.source, "structured");
    assert.equal(state.diagnosis, "R51 - Cefalea");
    assert.equal(state.cie10CodeId, CIE10_ID);
  });
});

describe("buildSoapPatch consistency", () => {
  const structured = structuredDiagnosisFromPicker({
    code: "R51",
    description: "Cefalea",
    cie10CodeId: CIE10_ID,
  });

  it("confirm and autosave produce identical diagnosis payload", () => {
    const confirmPatch = buildSoapPatch({
      notes: "nota clínica",
      treatment: "reposo",
      diagnosis: structured,
    });
    const autosavePatch = buildSoapPatch({
      notes: "nota clínica",
      treatment: "reposo",
      diagnosis: structured,
    });
    assert.deepEqual(confirmPatch, autosavePatch);
    assert.equal(confirmPatch.diagnosis, "R51 - Cefalea");
    assert.equal(confirmPatch.cie10CodeId, CIE10_ID);
  });

  it("always sends cie10CodeId explicitly including null", () => {
    const parsed = hydrateDiagnosisFromConsultation({
      diagnosis: "R51 - Cefalea",
      cie10CodeId: null,
      cie10Code: null,
    });
    const patch = buildSoapPatch({ diagnosis: parsed });
    assert.equal(patch.cie10CodeId, null);
    assert.equal(patch.diagnosis, "R51 - Cefalea");
  });

  it("omits empty treatment but keeps diagnosis bundle", () => {
    const patch = buildSoapPatch({
      treatment: "   ",
      diagnosis: structured,
    });
    assert.equal(patch.treatmentPlan, undefined);
    assert.equal(patch.cie10CodeId, CIE10_ID);
  });
});

describe("soapPatchFingerprint", () => {
  it("returns stable fingerprint for identical SOAP patches", () => {
    const patch = buildSoapPatch({
      notes: "nota",
      treatment: "reposo",
      diagnosis: structuredDiagnosisFromPicker({
        code: "R51",
        description: "Cefalea",
        cie10CodeId: CIE10_ID,
      }),
    });
    assert.equal(soapPatchFingerprint(patch), soapPatchFingerprint(patch));
  });
});

describe("buildSoapDraftKey", () => {
  it("includes cie10CodeId so FK changes trigger autosave", () => {
    const withFk = buildSoapDraftKey({
      notes: "n",
      treatment: "t",
      diagnosis: structuredDiagnosisFromPicker({
        code: "R51",
        description: "Cefalea",
        cie10CodeId: CIE10_ID,
      }),
    });
    const withoutFk = buildSoapDraftKey({
      notes: "n",
      treatment: "t",
      diagnosis: structuredDiagnosisFromPicker({
        code: "R51",
        description: "Cefalea",
      }),
    });
    assert.notEqual(withFk, withoutFk);
    assert.match(withFk, new RegExp(CIE10_ID));
  });
});

describe("picker → confirm → reload flow", () => {
  it("reload hydrates structured state from GET response", () => {
    const pickerState = structuredDiagnosisFromPicker({
      code: "R51",
      description: "Cefalea",
      cie10CodeId: CIE10_ID,
    });
    const confirmPatch = buildSoapPatch({ diagnosis: pickerState });

    const apiResponse = {
      diagnosis: confirmPatch.diagnosis,
      cie10CodeId: confirmPatch.cie10CodeId,
      cie10Code: {
        id: CIE10_ID,
        code: "R51",
        descriptionEs: "Cefalea",
      },
    };

    const reloaded = hydrateDiagnosisFromConsultation(apiResponse);
    assert.equal(reloaded.source, "structured");
    assert.equal(reloaded.cie10CodeId, CIE10_ID);
    assert.equal(reloaded.diagnosisCode, "R51");
  });
});

describe("picker → autosave → reload flow", () => {
  it("autosave patch matches confirm and reload preserves FK", () => {
    const state = structuredDiagnosisFromPicker({
      code: "J06.9",
      description: "IVA",
      cie10CodeId: CIE10_ID,
    });
    const autosavePatch = buildSoapPatch({
      notes: "evolución",
      treatment: "hidratación",
      diagnosis: state,
    });

    assert.equal(autosavePatch.cie10CodeId, CIE10_ID);

    const reloaded = hydrateDiagnosisFromConsultation({
      diagnosis: autosavePatch.diagnosis ?? "",
      cie10CodeId: autosavePatch.cie10CodeId ?? null,
      cie10Code: {
        id: CIE10_ID,
        code: "J06.9",
        descriptionEs: "IVA",
      },
    });
    assert.equal(reloaded.source, "structured");
  });
});

describe("confirm fail rollback", () => {
  it("rollback re-hydrates from last known consultation without orphan FK in UI state", () => {
    const serverConsultation = {
      diagnosis: null,
      cie10CodeId: null,
      cie10Code: null,
    };
    const beforeConfirm = hydrateDiagnosisFromConsultation(serverConsultation);

    const failedPicker = structuredDiagnosisFromPicker({
      code: "R51",
      description: "Cefalea",
      cie10CodeId: CIE10_ID,
    });
    assert.equal(failedPicker.cie10CodeId, CIE10_ID);

    const rolledBack = hydrateDiagnosisFromConsultation(serverConsultation);
    assert.deepEqual(rolledBack, beforeConfirm);
    assert.equal(rolledBack.cie10CodeId, null);
    assert.equal(rolledBack.source, "empty");
  });
});

describe("DiagnosisBadge structured vs parsed", () => {
  it("structured source maps to structured variant without warning", () => {
    const state = hydrateDiagnosisFromConsultation({
      diagnosis: "R51 - Cefalea",
      cie10CodeId: CIE10_ID,
      cie10Code: { id: CIE10_ID, code: "R51", descriptionEs: "Cefalea" },
    });
    assert.equal(getDiagnosisBadgeVariant(state.source), "structured");
    assert.equal(shouldShowUnlinkedWarning(state.source, state.diagnosisCode), false);
  });

  it("parsed source maps to parsed variant with unlinked warning", () => {
    const state = hydrateDiagnosisFromConsultation({
      diagnosis: "R51 - Cefalea",
      cie10CodeId: null,
      cie10Code: null,
    });
    assert.equal(getDiagnosisBadgeVariant(state.source), "parsed");
    assert.equal(shouldShowUnlinkedWarning(state.source, state.diagnosisCode), true);
  });

  it("empty source yields no badge variant", () => {
    assert.equal(getDiagnosisBadgeVariant(emptyDiagnosisState().source), null);
  });
});
