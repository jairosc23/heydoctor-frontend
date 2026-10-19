import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(DIR, "../../app/panel/consultas/[id]/_components/chart/HumanDecisionSection.tsx");
const CHART = join(DIR, "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx");

const FORBIDDEN = [
  "composeHumanDecision",
  "human-decision.aggregate",
  "evaluateHumanDecisionGate",
  "resolveHumanDecisionCapability",
  "adaptHumanDecisionComposerInput",
  "adaptConstitutedGovernance",
  "adaptClinicalFoundationContext",
  "human-decision.composer",
  "human-decision.gate",
  "human-decision.capability",
  "@/lib/clinical-governance",
  "@/lib/clinical-recommendation",
  "@/lib/clinical-outcomes",
  "clinicalFoundation",
  "clinical-authority-spine",
  "hab-authority",
  "emission-pipeline",
  "journey-orchestrator",
  "LegalPdf",
  "medical-copilot",
  "/write",
  "/accept",
  "/reject",
  "/authorize",
  "/execute",
  "/emit",
  "fhir",
  "billing",
];

function assertClean(label: string, source: string) {
  for (const token of FORBIDDEN) {
    assert.equal(source.includes(token), false, `${label} must not contain ${token}`);
  }
}

test("human decision client does not import Composer, Aggregate, Gate, adapters, Governance or Foundation", () => {
  const files = readdirSync(DIR).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter human decision section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/human-decision"));
  assert.ok(source.includes("listEnabledHumanDecisionTypes"));
  assert.equal(source.includes("href="), false);
  assert.equal(source.includes("/write"), false);
  assert.equal(source.includes("aceptar"), false);
  assert.equal(source.includes("rechazar"), false);
  assertClean("HumanDecisionSection.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("HumanDecisionSection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
