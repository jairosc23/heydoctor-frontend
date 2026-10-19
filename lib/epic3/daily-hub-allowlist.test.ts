import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  EPIC3_DAILY_HUB_FORBIDDEN_API_PATTERNS,
  EPIC3_DAILY_HUB_SURFACES,
  EPIC3_EMR_AI_WRITER,
  EPIC3_GENERATIVE_DAILY_SURFACES,
  EPIC3_H3_LIB_WRAPPER,
  EPIC3_HITL_ACTS,
  isMedicalCopilotLabSurfaceEnabled,
} from "./architecture-contract";

const REPO_ROOT = path.resolve(import.meta.dirname, "../..");

describe("EPIC-3 E3-0c Daily Hub allowlist", () => {
  it("declares unique EMR AI writer as governed persistence", () => {
    assert.equal(EPIC3_EMR_AI_WRITER, "governed_persistence_execution_post_hitl");
    assert.equal(EPIC3_HITL_ACTS.H3_GOVERNED_PERSISTENCE, "governed_persistence");
  });

  it("Daily Hub surfaces do not embed governed- tokens (H3 only via lib wrappers)", () => {
    const violations: string[] = [];
    for (const rel of EPIC3_DAILY_HUB_SURFACES) {
      const full = path.join(REPO_ROOT, rel);
      assert.ok(fs.existsSync(full), `missing Daily Hub surface: ${rel}`);
      const src = fs.readFileSync(full, "utf8");
      for (const token of EPIC3_DAILY_HUB_FORBIDDEN_API_PATTERNS) {
        if (src.includes(token)) {
          violations.push(`${rel} contains forbidden token: ${token}`);
        }
      }
    }
    assert.equal(
      violations.length,
      0,
      `Daily Hub allowlist violations:\n${violations.join("\n")}`,
    );
  });

  it("lab surface defaults ON (no UX change) and can be disabled", () => {
    assert.equal(isMedicalCopilotLabSurfaceEnabled({}), true);
    assert.equal(
      isMedicalCopilotLabSurfaceEnabled({
        NEXT_PUBLIC_MEDICAL_COPILOT_LAB_SURFACE: "0",
      }),
      false,
    );
  });

  it("declares H3 lib wrappers and sole generative Daily Hub surfaces", () => {
    assert.ok(EPIC3_H3_LIB_WRAPPER.includes("lib/epic3/close-hitl-execution.ts"));
    assert.equal(EPIC3_GENERATIVE_DAILY_SURFACES.length, 2);
    const drawer = fs.readFileSync(
      path.join(
        REPO_ROOT,
        "app/panel/consultas/[id]/_components/copilot/ClinicalCopilotDrawer.tsx",
      ),
      "utf8",
    );
    assert.equal(drawer.includes("CopilotGenerativeSection"), false);
  });
});
