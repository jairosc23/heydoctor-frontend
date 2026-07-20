import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const MODULE = path.resolve(import.meta.dirname, "h1-ai-run-review.ts");
const SERVICE = path.resolve(
  import.meta.dirname,
  "../services/ai-run-review.ts",
);

describe("EPIC-3 H1 ai-run-review", () => {
  it("lib calls approve/reject contract endpoints", () => {
    const svc = fs.readFileSync(SERVICE, "utf8");
    assert.ok(svc.includes("/ai/runs"));
    assert.ok(svc.includes("/approve"));
    assert.ok(svc.includes("/reject"));
    assert.ok(svc.includes("approveAiRun"));
    assert.ok(svc.includes("rejectAiRun"));
  });

  it("orchestrator reuses service (no sessionStorage SoT)", () => {
    const src = fs.readFileSync(MODULE, "utf8");
    assert.ok(src.includes("approveAiRun"));
    assert.ok(src.includes("rejectAiRun"));
    assert.equal(src.includes("sessionStorage"), false);
    assert.equal(src.includes("updateConsultation"), false);
  });
});
