import { COUNTRY_OPTIONS } from "@/lib/global-address-engine/countries";
import type { PublicJurisdiction } from "@/lib/services/public-discovery";

/** Countries are the platform catalog, not the verified-provider coverage set. */
export function discoveryCountryOptions() {
  return COUNTRY_OPTIONS.filter((country) => /^[A-Z]{2}$/.test(country.code)).map(
    (country) => ({ value: country.code, label: country.name.es }),
  );
}

export function hasDiscoveryCountry(code: string): boolean {
  return discoveryCountryOptions().some((country) => country.value === code);
}

/** Coverage governs subdivision filters and doctor eligibility, never country visibility. */
export function countryCoveredByVerifiedDoctors(
  countryCode: string,
  jurisdictions: readonly PublicJurisdiction[],
): boolean {
  return jurisdictions.some((row) => row.countryCode === countryCode);
}
