import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalRecommendationSection.tsx",
);
const CHART = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx",
);

const FORBIDDEN = [
  "composeClinicalRecommendation",
  "clinical-recommendation.aggregate",
  "evaluateClinicalRecommendationGate",
  "resolveClinicalRecommendationCapability",
  "adaptClinicalRecommendationComposerInput",
  "adaptReasonedReasoning",
  "adaptClinicalFoundationContext",
  "clinical-recommendation.composer",
  "clinical-recommendation.gate",
  "clinical-recommendation.capability",
  "@/lib/clinical-reasoning",
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
  "/accept",
  "/reject",
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

test("clinical recommendation client does not import Composer, Aggregate, Gate, adapters, Reasoning or Foundation", () => {
  const files = readdirSync(DIR).filter(
    (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter clinical recommendation section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/clinical-recommendation"));
  assert.ok(source.includes("listEnabledClinicalRecommendationTypes"));
  assert.equal(source.includes("href="), false);
  assert.equal(source.includes("/write"), false);
  assert.equal(source.includes("aceptar"), false);
  assert.equal(source.includes("rechazar"), false);
  assertClean("ClinicalRecommendationSection.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("ClinicalRecommendationSection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
