import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  collectProfileAlerts,
  computeAgeFromBirthDate,
  formatPatientDocument,
  formatPatientSex,
  jsonLinesToList,
  jsonLinesToText,
  resolvePatientAge,
} from "./patient-profile-display";

describe("jsonLinesToText", () => {
  it("returns empty string for missing or empty items", () => {
    assert.equal(jsonLinesToText(), "");
    assert.equal(jsonLinesToText([]), "");
  });

  it("formats label and detail with colon separator", () => {
    const text = jsonLinesToText([
      { label: "Penicilina", detail: "Anafilaxia" },
      { name: "Látex" },
    ]);
    assert.equal(text, "Penicilina: Anafilaxia\nLátex");
  });

  it("uses description when label is absent", () => {
    assert.equal(
      jsonLinesToText([{ description: "Alerta anticoagulante" }]),
      "Alerta anticoagulante",
    );
  });
});

describe("jsonLinesToList", () => {
  it("splits multiline profile text into trimmed lines", () => {
    assert.deepEqual(
      jsonLinesToList([
        { label: "A", detail: "1" },
        { label: "B" },
      ]),
      ["A: 1", "B"],
    );
  });
});

describe("formatPatientSex", () => {
  it("maps known sex codes to Spanish labels", () => {
    assert.equal(formatPatientSex("female"), "Femenino");
    assert.equal(formatPatientSex("male"), "Masculino");
  });

  it("returns em dash when sex is missing", () => {
    assert.equal(formatPatientSex(null), "—");
    assert.equal(formatPatientSex(undefined), "—");
  });

  it("falls back to raw value for unknown codes", () => {
    assert.equal(formatPatientSex("custom"), "custom");
  });
});

describe("formatPatientDocument", () => {
  it("joins document type and number", () => {
    assert.equal(
      formatPatientDocument({
        documentType: "RUT",
        documentNumber: "12.345.678-9",
      }),
      "RUT 12.345.678-9",
    );
  });

  it("uses identification fallback", () => {
    assert.equal(
      formatPatientDocument({ identification: "PASSPORT X1" }),
      "PASSPORT X1",
    );
  });

  it("returns em dash when no document fields", () => {
    assert.equal(formatPatientDocument({}), "—");
  });
});

describe("computeAgeFromBirthDate", () => {
  it("computes age relative to reference date", () => {
    const ref = new Date("2026-06-04T12:00:00Z");
    assert.equal(computeAgeFromBirthDate("1990-05-15", ref), 36);
  });

  it("returns null for invalid birth dates", () => {
    assert.equal(computeAgeFromBirthDate("not-a-date"), null);
  });
});

describe("collectProfileAlerts", () => {
  it("merges alerts and clinical warnings", () => {
    assert.deepEqual(
      collectProfileAlerts({
        alerts: [{ label: "Anticoagulante" }],
        clinicalWarnings: [{ description: "Embarazo" }],
      }),
      ["Anticoagulante", "Embarazo"],
    );
  });

  it("returns empty list when profile is missing", () => {
    assert.deepEqual(collectProfileAlerts(null), []);
  });
});

describe("resolvePatientAge", () => {
  it("derives age from birthDate even when backend age differs", () => {
    const ref = new Date(2026, 5, 4); // 2026-06-04 local
    assert.equal(
      resolvePatientAge({ age: 42, birthDate: "1990-01-01" }, ref),
      "36 años",
    );
  });

  it("derives age from birthDate when age is empty", () => {
    const ref = new Date(2026, 5, 4); // 2026-06-04 local
    assert.equal(
      resolvePatientAge({ age: null, birthDate: "2000-06-04" }, ref),
      "26 años",
    );
  });

  it("falls back to backend age when birthDate missing", () => {
    assert.equal(resolvePatientAge({ age: 42, birthDate: null }), "42 años");
  });

  it("returns em dash when age cannot be resolved", () => {
    assert.equal(resolvePatientAge({ age: null, birthDate: null }), "—");
  });
});
