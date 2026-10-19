import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it } from "node:test";
import { createEmptyAddressSelection, listCountriesForSelect } from "./index";

const FRONTEND_ROOT = join(__dirname, "../..");
const ENGINE_ROOT = join(__dirname);

const GEO_LIST_PATTERNS: RegExp[] = [
  /\bconst\s+COUNTRIES\b/,
  /\bconst\s+COUNTRY_OPTIONS\b/,
  /\bconst\s+REGIONS\b/,
  /\bconst\s+PROVINCES\b/,
  /\bconst\s+COMMUNES\b/,
  /\bconst\s+COMUNAS\b/,
  /\bconst\s+STATES\b/,
  /\bconst\s+CITIES\b/,
  /\bconst\s+DEPARTMENTS\b/,
  /\bconst\s+DEPARTAMENTOS\b/,
];

function walkFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (
      name === "node_modules" ||
      name === ".next" ||
      name === "coverage" ||
      name === "dist"
    ) {
      continue;
    }
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      walkFiles(full, out);
      continue;
    }
    if (/\.(ts|tsx|js|jsx)$/.test(name)) out.push(full);
  }
  return out;
}

describe("Global Address Engine — SSOT audit", () => {
  it("exposes a non-empty official country provider", () => {
    const options = listCountriesForSelect("es");
    assert.ok(options.length >= 7);
    assert.ok(options.some((o) => o.value === "CL" && o.label === "Chile"));
  });

  it("allows empty country selection for required forms", () => {
    const empty = createEmptyAddressSelection("");
    assert.equal(empty.countryCode, "");
  });

  it("forbids geographic list constants outside lib/global-address-engine", () => {
    const files = walkFiles(FRONTEND_ROOT);
    const violations: string[] = [];

    for (const file of files) {
      if (file.startsWith(ENGINE_ROOT)) continue;
      const rel = relative(FRONTEND_ROOT, file);
      // Skip this audit test file if ever moved; and generated caches.
      if (rel.includes("ssot-audit.test")) continue;

      const source = readFileSync(file, "utf8");
      for (const pattern of GEO_LIST_PATTERNS) {
        if (pattern.test(source)) {
          violations.push(`${rel} matches ${pattern}`);
        }
      }
    }

    assert.deepEqual(
      violations,
      [],
      `Geographic list duplicates found:\n${violations.join("\n")}`,
    );
  });
});
