import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const DIR = import.meta.dirname;
const FORBIDDEN = [
  "clinical-foundation",
  "clinicalFoundation",
  "LegalPdf",
  "/consultations/",
  "medical-copilot",
  "continuity",
  "unsaved-changes-guard",
  "useConsultationAutosave",
  "patient-profile",
  "PayloadComposer",
];

test("clinical documents client does not import Foundation, Copilot, Continuity, or Legal PDF", () => {
  const files = readdirSync(DIR).filter(
    (file) => file.endsWith(".ts") && !file.endsWith(".test.ts"),
  );
  assert.ok(files.length > 0);
  for (const file of files) {
    const source = readFileSync(join(DIR, file), "utf8");
    for (const token of FORBIDDEN) {
      assert.equal(
        source.includes(token),
        false,
        `${file} must not contain ${token}`,
      );
    }
  }
});
