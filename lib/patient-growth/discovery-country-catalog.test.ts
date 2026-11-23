import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { COUNTRY_OPTIONS } from "../global-address-engine/countries";
import {
  countryCoveredByVerifiedDoctors,
  discoveryCountryOptions,
  hasDiscoveryCountry,
} from "./discovery-country-catalog";

describe("RC19-C international discovery catalogue", () => {
  const verifiedCoverage = [{ countryCode: "CL", subdivisions: [] }];

  it("derives its selectable countries from the canonical Global Address Engine", () => {
    const options = discoveryCountryOptions();
    const expected = COUNTRY_OPTIONS.filter((country) =>
      /^[A-Z]{2}$/.test(country.code),
    );
    assert.deepEqual(
      options.map((option) => option.value),
      expected.map((country) => country.code),
    );
    assert.equal(
      options.some((country) => country.value === "OTHER"),
      false,
    );
  });

  it("keeps previously included countries visible even without active licenses", () => {
    assert.equal(hasDiscoveryCountry("CL"), true);
    assert.equal(hasDiscoveryCountry("CO"), true);
    assert.equal(hasDiscoveryCountry("BR"), true);
    assert.equal(hasDiscoveryCountry("AR"), true);
    assert.equal(hasDiscoveryCountry("US"), true);
    assert.equal(hasDiscoveryCountry("ES"), true);
    assert.equal(hasDiscoveryCountry("ZZ"), false);
    assert.equal(countryCoveredByVerifiedDoctors("CL", verifiedCoverage), true);
    assert.equal(
      countryCoveredByVerifiedDoctors("CO", verifiedCoverage),
      false,
    );
    assert.equal(
      countryCoveredByVerifiedDoctors("BR", verifiedCoverage),
      false,
    );
  });

  it("does not fabricate coverage when a country is selectable", () => {
    const coverage = [{ countryCode: "CL", subdivisions: [] }];
    for (const option of discoveryCountryOptions()) {
      if (option.value !== "CL") {
        assert.equal(
          countryCoveredByVerifiedDoctors(option.value, coverage),
          false,
        );
      }
    }
  });
});
