import assert from "node:assert/strict";
import { describe, it } from "node:test";
import fs from "node:fs";
import path from "node:path";

/**
 * RC6 FE certification — docs freeze only; no new clinical modules.
 */
describe("RC6 FE production certification", () => {
  const docsDir = path.join(process.cwd(), "docs");
  const required = [
    "medical-copilot-rc6.md",
    "medical-copilot-rc6-architecture.md",
    "medical-copilot-rc6-security-review.md",
    "medical-copilot-rc6-certification-checklist.json",
    "medical-copilot-rc6-inventory.json",
    "medical-copilot-rc6-repo-audit.json",
  ];

  it("keeps RC6 certification docs present", () => {
    for (const name of required) {
      assert.equal(fs.existsSync(path.join(docsDir, name)), true, name);
    }
  });

  it("does not introduce rc6-operational clinical layer", () => {
    assert.equal(
      fs.existsSync(
        path.join(process.cwd(), "lib/medical-copilot/rc6-operational"),
      ),
      false,
    );
  });
});
