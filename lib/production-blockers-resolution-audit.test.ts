import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  BLOCKER_RESOLUTIONS,
  evaluatePhase490Verdict,
  runProductionBlockersResolutionSummary,
  WORKSPACE_ENV_VALIDATION,
} from "./production-blockers-resolution-audit";

describe("production-blockers-resolution-audit Phase 4.9.0", () => {
  it("resuelve F1–F4 y documenta F5", () => {
    assert.equal(BLOCKER_RESOLUTIONS.length, 5);
    assert.ok(BLOCKER_RESOLUTIONS.every((b) => b.id.startsWith("F")));
    assert.equal(
      BLOCKER_RESOLUTIONS.filter((b) => b.status === "resolved").length,
      4,
    );
    assert.equal(
      BLOCKER_RESOLUTIONS.find((b) => b.id === "F5")?.status,
      "documented",
    );
  });

  it("F5 documenta flags default false y expected ON", () => {
    assert.equal(
      WORKSPACE_ENV_VALIDATION.flags.clinicalActionWorkspace.defaultInCode,
      false,
    );
    assert.equal(
      WORKSPACE_ENV_VALIDATION.flags.smartClinicalWorkspace.defaultInCode,
      false,
    );
    assert.equal(
      WORKSPACE_ENV_VALIDATION.flags.clinicalActionWorkspace
        .expectedForOfficialWorkspace,
      "1",
    );
  });

  it("veredicto: blockers código resueltos, activación workspace NO GO", () => {
    const verdict = evaluatePhase490Verdict();
    assert.equal(verdict.blockersResolved, true);
    assert.equal(verdict.workspaceActivationGo, "NO_GO");
  });

  it("resumen audit coherente", () => {
    const summary = runProductionBlockersResolutionSummary();
    assert.equal(summary.resolutions, 5);
    assert.equal(summary.resolved, 4);
    assert.equal(summary.documented, 1);
    assert.equal(summary.blockersResolved, true);
    assert.equal(summary.workspaceActivationGo, "NO_GO");
  });
});
