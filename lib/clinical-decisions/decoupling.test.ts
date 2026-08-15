import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalDecisionsSection.tsx",
);
const CHART = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx",
);

const FORBIDDEN = [
  "composeClinicalDecisionSupport",
  "ClinicalDecisionSupportAggregate",
  "evaluateClinicalDecisionSupportGate",
  "adaptClinicalDecisionSupportComposerInput",
  "adaptClinicalFoundationContext",
  "clinical-foundation",
  "clinicalFoundation",
  "LegalPdf",
  "medical-copilot",
  "CdsRecommendationSet",
  "clinical-decision-support.composer",
  "clinical-decision-support.aggregate",
  "clinical-decision-support.gate",
  "clinical-decision-support.capability",
  "/acknowledge",
  "/override",
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

test("clinical decisions client does not import Composer, Aggregate, Gate, adapters, or Foundation", () => {
  const files = readdirSync(DIR).filter(
    (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter decisions section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/clinical-decisions"));
  assert.ok(source.includes("listEnabledClinicalDecisions"));
  assert.equal(source.includes("/acknowledge"), false);
  assert.equal(source.includes("/override"), false);
  assertClean("ClinicalDecisionsSection.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("ClinicalDecisionsSection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
