import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const SECTION = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalAuthoritySection.tsx",
);
const MOUNT = join(
  DIR,
  "../../components/clinical/clinical-authority/ConfirmationMount.tsx",
);
const CHART = join(
  DIR,
  "../../app/panel/consultas/[id]/_components/chart/ClinicalEncounterChart.tsx",
);

const FORBIDDEN = [
  "composeClinicalAuthorityAct",
  "clinical-authority-act.aggregate",
  "evaluateClinicalAuthorityActGate",
  "adaptClinicalAuthorityComposerInput",
  "adaptClinicalFoundationContext",
  "clinical-foundation",
  "clinicalFoundation",
  "LegalPdf",
  "medical-copilot",
  "hab-authority",
  "submitHabDecision",
  "emission-pipeline",
  "journey-orchestrator",
  "/confirm",
  "/authorize",
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

test("clinical authority client does not import Composer, Aggregate, Gate, adapters, or Foundation", () => {
  const files = readdirSync(DIR).filter(
    (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    assertClean(file, readFileSync(join(DIR, file), "utf8"));
  }
});

test("Encounter authority section consumes only the HTTP client", () => {
  const source = readFileSync(SECTION, "utf8");
  assert.ok(source.includes("@/lib/clinical-authority"));
  assert.ok(source.includes("listEnabledClinicalAuthorityActs"));
  assert.ok(source.includes("ConfirmationMount"));
  assert.equal(source.includes("/confirm"), false);
  assert.equal(source.includes("/authorize"), false);
  assertClean("ClinicalAuthoritySection.tsx", source);
});

test("ConfirmationMount does not execute HAB, confirm or emission", () => {
  const source = readFileSync(MOUNT, "utf8");
  assert.ok(source.includes("Emisión no disponible"));
  assert.equal(source.includes("onClick"), false);
  assert.equal(source.includes("submitHabDecision"), false);
  assertClean("ConfirmationMount.tsx", source);
});

test("Encounter chart wires the section without engine domain imports", () => {
  const source = readFileSync(CHART, "utf8");
  assert.ok(source.includes("ClinicalAuthoritySection"));
  assertClean("ClinicalEncounterChart.tsx", source);
});
