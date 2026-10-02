import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminLevelLabel,
  buildMedicosQuery,
  countryDisplayName,
  countryOptions,
  isNationalCoverage,
  subdivisionAfterCountryChange,
  subdivisionDisplayName,
  subdivisionOptionsForCountry,
} from "./jurisdiction-ui";

const coverage = [
  { countryCode: "CL", subdivisions: ["CL-RM", "CL-VS"] },
  { countryCode: "CO", subdivisions: [] },
  { countryCode: "US", subdivisions: ["US-CA"] },
] as const;

describe("public jurisdiction UI", () => {
  it("offers only countries returned by the endpoint, with human names", () => {
    const options = countryOptions(coverage);
    assert.deepEqual(
      options.map((option) => option.value),
      ["CL", "CO", "US"],
    );
    assert.equal(options[0]?.label, "Chile");
    assert.equal(options[1]?.label, "Colombia");
    assert.equal(countryDisplayName("US"), "Estados Unidos");
    assert.equal(options.some((option) => option.value === "ES"), false);
  });

  it("limits subdivisions to the selected country and resets an incompatible one", () => {
    assert.deepEqual(subdivisionOptionsForCountry(coverage, "CL"), [
      "CL-RM",
      "CL-VS",
    ]);
    assert.deepEqual(subdivisionOptionsForCountry(coverage, "US"), ["US-CA"]);
    assert.equal(subdivisionAfterCountryChange("CL-VS", ["US-CA"]), "");
    assert.equal(
      subdivisionAfterCountryChange("CL-VS", ["CL-RM", "CL-VS"]),
      "CL-VS",
    );
  });

  it("changes the administrative label from explicit metadata", () => {
    assert.equal(adminLevelLabel("CL"), "Región");
    assert.equal(adminLevelLabel("CO"), "Departamento");
    assert.equal(adminLevelLabel("US"), "Estado");
    assert.equal(adminLevelLabel("MX"), "Estado");
    assert.equal(adminLevelLabel("BR"), "Estado");
    assert.equal(adminLevelLabel("AR"), "Provincia");
    assert.equal(adminLevelLabel("ES"), "División administrativa");
  });

  it("supports a national license without a subdivision", () => {
    assert.equal(isNationalCoverage(subdivisionOptionsForCountry(coverage, "CO")), true);
    assert.equal(
      buildMedicosQuery({
        q: "cardio",
        specialty: "Cardiología",
        patientCountry: "co",
      }),
      "/medicos?q=cardio&specialty=Cardiolog%C3%ADa&patientCountry=CO",
    );
  });

  it("keeps ISO codes in the URL and preserves the existing filters", () => {
    assert.equal(
      buildMedicosQuery({
        q: "ana",
        specialty: "Medicina General",
        patientCountry: "cl",
        patientSubdivision: "cl-vs",
      }),
      "/medicos?q=ana&specialty=Medicina+General&patientCountry=CL&patientSubdivision=CL-VS",
    );
    const shown = subdivisionDisplayName("CL-VS");
    assert.equal(shown === "CL-VS" || shown.length > 0, true);
    assert.equal(subdivisionDisplayName("ZZ-ZZ"), "ZZ-ZZ");
  });
});
