import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/LongitudinalClinicalRecordSection.tsx",
);
const CHART = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx",
);

const FORBIDDEN = [
  "composeLongitudinalClinicalRecord",
  "longitudinal-clinical-record.aggregate",
  "evaluateLongitudinalRecordGate",
  "resolveLongitudinalCapability",
  "adaptLongitudinalComposerInput",
  "adaptRegisteredArtifact",
  "adaptClinicalFoundationContext",
  "longitudinal-clinical-record.composer",
  "longitudinal-clinical-record.gate",
  "longitudinal-clinical-record.capability",
  "clinical-foundation",
  "clinicalFoundation",
  "clinical-authority-spine",
  "clinical-artifact-registry",
  "clinical-documents",
  "clinical-orders-engine",
  "clinical-decision-support-engine",
  "LegalPdf",
  "medical-copilot",
  "hab-authority",
  "emission-pipeline",
  "journey-orchestrator",
  "/write",
  "/timeline",
  "fhir",
  "billing",
];

function assertClean(label: string, source: string) {
  for (const token of FORBIDDEN) {
    assert.equal(
      source.includes(token),
      false,
      `${label} must not contain ${token}`,
    );
  }
}

test("longitudinal records client does not import Composer, Aggregate, Gate, adapters, or Foundation", () => {
  const files = readdirSync(DIR).filter(
    (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter longitudinal section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/longitudinal-records"));
  assert.ok(source.includes("listEnabledLongitudinalRecordTypes"));
  assert.equal(source.includes("href="), false);
  assert.equal(source.includes("/write"), false);
  assert.equal(source.includes("/timeline"), false);
  assertClean("LongitudinalClinicalRecordSection.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("LongitudinalClinicalRecordSection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
