import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  formatPatientDisplayName,
  normalizePatient,
} from "./patients";

describe("normalizePatient", () => {
  it("maps enterprise fields and computed age from backend", () => {
    const row = normalizePatient({
      id: "p-1",
      name: "Ana García",
      displayName: "Ana García",
      email: "ana@example.com",
      documentType: "RUT",
      documentNumber: "12.345.678-9",
      birthDate: "1990-05-15",
      age: 35,
      sex: "female",
      insuranceProvider: "FONASA",
    });

    assert.equal(row.id, "p-1");
    assert.equal(row.displayName, "Ana García");
    assert.equal(row.documentType, "RUT");
    assert.equal(row.documentNumber, "12.345.678-9");
    assert.equal(row.identification, "12.345.678-9");
    assert.equal(row.age, 35);
    assert.equal(row.insuranceProvider, "FONASA");
  });

  it("splits legacy name when structured names are missing", () => {
    const row = normalizePatient({
      id: "p-2",
      name: "Juan Pérez López",
      email: "juan@example.com",
    });

    assert.equal(row.firstname, "Juan");
    assert.equal(row.lastname, "Pérez López");
  });
});

describe("formatPatientDisplayName", () => {
  it("prefers displayName over legacy name", () => {
    assert.equal(
      formatPatientDisplayName({
        id: "1",
        displayName: "Preferred",
        name: "Legacy",
      }),
      "Preferred"
    );
  });
});
