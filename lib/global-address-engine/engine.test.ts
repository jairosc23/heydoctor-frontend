import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addressSelectionToPatientFields,
  applyAddressChange,
  buildLevelFieldStates,
  computeAgeFromBirthDate,
  createEmptyAddressSelection,
  getCountryAddressProfile,
  listSpecializedCountryCodes,
  patientFieldsToAddressSelection,
  resolveAgeDisplay,
} from "./index";

describe("Global Address Engine — nationality vs residence", () => {
  it("keeps residence cascade independent of nationality (no coupling in engine)", () => {
    let address = createEmptyAddressSelection("CL");
    address = applyAddressChange(address, { countryCode: "CO" });
    assert.equal(address.countryCode, "CO");
    // Engine has no nationality field — separation is structural.
    assert.equal("nationality" in address, false);
  });
});

describe("Global Address Engine — country master cascade", () => {
  it("adapts admin labels for Chile / Colombia / US", () => {
    assert.equal(
      getCountryAddressProfile("CL", "es").levels[0]?.label.es,
      "Región",
    );
    assert.equal(
      getCountryAddressProfile("CO", "es").levels[0]?.label.es,
      "Departamento",
    );
    assert.equal(
      getCountryAddressProfile("US", "es").levels[0]?.label.es,
      "Estado",
    );
  });

  it("cascades Chile región → provincia → comuna and clears dependents", () => {
    let sel = createEmptyAddressSelection("CL");
    sel = applyAddressChange(sel, { level: "admin1", code: "13" });
    assert.equal(sel.admin1Name, "Metropolitana de Santiago");

    const provinces = buildLevelFieldStates(sel).find((l) => l.key === "admin2");
    assert.ok(provinces && provinces.mode === "select");
    assert.ok((provinces?.options.length ?? 0) > 0);

    sel = applyAddressChange(sel, { level: "admin2", code: "131" });
    assert.equal(sel.admin2Name, "Santiago");

    sel = applyAddressChange(sel, { level: "admin3", code: "13114" });
    assert.equal(sel.admin3Name, "Las Condes");

    sel = applyAddressChange(sel, { level: "admin1", code: "05" });
    assert.equal(sel.admin1Name, "Valparaíso");
    assert.equal(sel.admin2Code, "");
    assert.equal(sel.admin3Code, "");
  });

  it("uses free-text for Colombia municipio (no catalog yet)", () => {
    let sel = createEmptyAddressSelection("CO");
    sel = applyAddressChange(sel, { level: "admin1", code: "11" });
    const fields = buildLevelFieldStates(sel);
    const municipio = fields.find((l) => l.key === "admin2");
    assert.equal(municipio?.mode, "text");
    sel = applyAddressChange(sel, {
      level: "admin2",
      freeText: "Bogotá",
    });
    assert.equal(sel.freeText?.admin2, "Bogotá");
  });

  it("maps selection to legacy patient fields", () => {
    let sel = createEmptyAddressSelection("CL");
    sel = applyAddressChange(sel, { level: "admin1", code: "13" });
    sel = applyAddressChange(sel, { level: "admin2", code: "131" });
    sel = applyAddressChange(sel, { level: "admin3", code: "13123" });
    sel = applyAddressChange(sel, { addressLine1: "Av. Providencia 123" });
    const mapped = addressSelectionToPatientFields(sel);
    assert.equal(mapped.country, "CL");
    assert.equal(mapped.stateProvince, "Metropolitana de Santiago");
    assert.equal(mapped.city, "Providencia");
    assert.equal(mapped.addressLine1, "Av. Providencia 123");
  });

  it("hydrates Chile selection from legacy city/state fields", () => {
    const sel = patientFieldsToAddressSelection({
      country: "CL",
      stateProvince: "Metropolitana de Santiago",
      city: "Las Condes",
      addressLine1: "Calle 1",
    });
    assert.equal(sel.admin1Code, "13");
    assert.equal(sel.admin3Name, "Las Condes");
  });

  it("registers specialized adapters", () => {
    const codes = listSpecializedCountryCodes();
    assert.ok(codes.includes("CL"));
    assert.ok(codes.includes("CO"));
    assert.ok(codes.includes("AR"));
    assert.ok(codes.includes("US"));
  });
});

describe("Global Address Engine — age SSOT", () => {
  it("computes age from YYYY-MM-DD and never blanks when valid", () => {
    const ref = new Date(2026, 6, 17); // 2026-07-17
    assert.equal(computeAgeFromBirthDate("1990-05-15", ref), 36);
    assert.equal(resolveAgeDisplay("1990-05-15", null, ref), "36");
    assert.equal(resolveAgeDisplay("", 42, ref), "42");
    assert.equal(resolveAgeDisplay("not-a-date"), "—");
  });
});
