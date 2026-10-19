import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalUnderstandingSection.tsx",
);
const CHART = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx",
);

const FORBIDDEN = [
  "composeClinicalUnderstanding",
  "clinical-understanding.aggregate",
  "evaluateClinicalUnderstandingGate",
  "resolveClinicalUnderstandingCapability",
  "adaptClinicalUnderstandingComposerInput",
  "adaptRegisteredArtifact",
  "adaptLongitudinalRecordRef",
  "adaptClinicalFoundationContext",
  "clinical-understanding.composer",
  "clinical-understanding.gate",
  "clinical-understanding.capability",
  "clinical-foundation",
  "clinicalFoundation",
  "clinical-authority-spine",
  "clinical-artifact-registry",
  "longitudinal-clinical-record",
  "clinical-rules-evaluator",
  "clinical-rule-evaluation",
  "clinical-documents",
  "clinical-orders-engine",
  "clinical-decision-support-engine",
  "clinical-knowledge-graph",
  "clinical-intelligence",
  "clinical-context",
  "LegalPdf",
  "medical-copilot",
  "hab-authority",
  "emission-pipeline",
  "journey-orchestrator",
  "/write",
  "fhir",
  "billing",
  "evaluateRules",
  "rule-engine",
  "governed-deterministic-clinical-rules",
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

test("clinical understanding client does not import Composer, Aggregate, Gate, adapters, or Foundation", () => {
  const files = readdirSync(DIR).filter(
    (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter clinical understanding section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/clinical-understanding"));
  assert.ok(source.includes("listEnabledClinicalUnderstandingTypes"));
  assert.equal(source.includes("href="), false);
  assert.equal(source.includes("/write"), false);
  assertClean("ClinicalUnderstandingSection.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("ClinicalUnderstandingSection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
