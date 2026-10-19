import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { STATUS_LABELS } from "../../app/panel/consultas/[id]/_components/consultation-status";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

describe("RC-19A Sprint 2 D2 consultation list status", () => {
  it("maps raw API statuses to Spanish labels", () => {
    assert.equal(STATUS_LABELS.draft, "Borrador");
    assert.equal(STATUS_LABELS.in_progress, "En progreso");
    assert.doesNotMatch(STATUS_LABELS.draft, /draft/);
    assert.doesNotMatch(STATUS_LABELS.in_progress, /in_progress/);
  });

  it("list page renders STATUS_LABELS instead of raw status", () => {
    const page = readFileSync(
      join(ROOT, "app/panel/consultas/page.tsx"),
      "utf8",
    );
    assert.match(page, /STATUS_LABELS/);
    assert.match(page, /data-testid="consultation-list-status"/);
    assert.doesNotMatch(page, /\{c\.status \?\? "—"\}/);
  });
});
