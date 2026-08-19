import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(DIR, "../../app/panel/consultas/[id]/_components/chart/ClinicalKnowledgeJurisdictionSection.tsx");
const CHART = join(DIR, "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx");

const FORBIDDEN = [
  "composeClinicalKnowledgeJurisdiction",
  "clinical-knowledge-jurisdiction.aggregate",
  "evaluateClinicalKnowledgeJurisdictionGate",
  "resolveClinicalKnowledgeJurisdictionCapability",
  "adaptClinicalKnowledgeJurisdictionComposerInput",
  "adaptKnowledgeCitation",
  "adaptEvidenceCitation",
  "adaptClinicalFoundationClinic",
  "clinical-knowledge-jurisdiction.composer",
  "clinical-knowledge-jurisdiction.gate",
  "clinical-knowledge-jurisdiction.capability",
  "@/lib/clinical-knowledge\"",
  "@/lib/clinical-knowledge'",
  "@/lib/clinical-evidence",
  "@/lib/clinical-scientific-governance",
  "@/lib/clinical-knowledge-federation",
  "@/lib/clinical-reentry",
  "@/lib/clinical-learning",
  "@/lib/clinical-execution",
  "@/lib/human-decision",
  "@/lib/clinical-governance",
  "@/lib/clinical-recommendation",
  "@/lib/clinical-outcomes",
  "clinicalFoundation",
  "clinical-authority-spine",
  "clinical-knowledge-graph",
  "hab-authority",
  "emission-pipeline",
  "journey-orchestrator",
  "LegalPdf",
  "medical-copilot",
  "/write",
  "/accept",
  "/reject",
  "/authorize",
  "/emit",
  "fhir",
  "billing",
];

function assertClean(label: string, source: string) {
  for (const token of FORBIDDEN) {
    assert.equal(source.includes(token), false, `${label} must not contain ${token}`);
  }
}

test("clinical scientific governance client does not import Composer, Aggregate, Gate, adapters, Knowledge or Evidence", () => {
  const files = readdirSync(DIR).filter((file) => file.endsWith(".ts") && !file.endsWith(".test.ts"));
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter scientific governance section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/clinical-knowledge-jurisdiction"));
  assert.ok(source.includes("listEnabledClinicalKnowledgeJurisdictionTypes"));
  assert.equal(source.includes("href="), false);
  assert.equal(source.includes("/write"), false);
  assert.equal(source.includes("aceptar"), false);
  assert.equal(source.includes("rechazar"), false);
  assertClean("ClinicalKnowledgeJurisdictionSection.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("ClinicalKnowledgeJurisdictionSection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
