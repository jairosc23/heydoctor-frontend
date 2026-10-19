import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  LIQUID_AUTHORITY_ASSERTIONS,
  liquidAssistDisclosure,
  planLiquidRegions,
  resolveLiquidEncounterPhase,
} from "./liquid-composition";

describe("AEC-1 M4 liquid composition", () => {
  it("preserves single-workspace authority assertions", () => {
    assert.equal(
      LIQUID_AUTHORITY_ASSERTIONS.singleWorkspaceShell,
      "ConsultationWorkspace",
    );
    assert.equal(LIQUID_AUTHORITY_ASSERTIONS.noSecondWorkspaceRoute, true);
    assert.equal(LIQUID_AUTHORITY_ASSERTIONS.assistNeverConfirmsOrEmits, true);
    assert.equal(LIQUID_AUTHORITY_ASSERTIONS.copilotIsModelPlane, true);
    assert.equal(LIQUID_AUTHORITY_ASSERTIONS.w5IsDeterministicPlane, true);
    assert.equal(LIQUID_AUTHORITY_ASSERTIONS.habIsConfirmationAuthority, true);
  });

  it("maps encounter status to phases", () => {
    assert.equal(
      resolveLiquidEncounterPhase({ status: "scheduled" }),
      "pre_encounter",
    );
    assert.equal(resolveLiquidEncounterPhase({ status: "in_progress" }), "active");
    assert.equal(
      resolveLiquidEncounterPhase({ status: "signed", isSigned: true }),
      "closing",
    );
    assert.equal(
      resolveLiquidEncounterPhase({ status: "in_progress", degraded: true }),
      "degraded",
    );
  });

  it("keeps work surface visible; collapses assist pre-encounter", () => {
    const pre = planLiquidRegions({ phase: "pre_encounter", role: "doctor" });
    assert.equal(pre.work.visible, true);
    assert.equal(pre.assist.emphasis, "collapsed");
    assert.equal(pre.authority.visible, false);

    const active = planLiquidRegions({ phase: "active", role: "doctor" });
    assert.equal(active.work.emphasis, "primary");
    assert.equal(active.assist.visible, true);

    const degraded = planLiquidRegions({ phase: "degraded", role: "doctor" });
    assert.equal(degraded.work.visible, true);
    assert.equal(degraded.assist.visible, false);
  });

  it("steward role keeps assist secondary without emit shortcuts", () => {
    const plan = planLiquidRegions({ phase: "active", role: "steward" });
    assert.equal(plan.assist.visible, true);
    assert.equal(plan.assist.emphasis, "secondary");
  });

  it("progressive assist disclosure is fail-closed when degraded", () => {
    assert.equal(liquidAssistDisclosure("degraded"), "hidden");
    assert.equal(liquidAssistDisclosure("pre_encounter"), "collapsed");
    assert.equal(liquidAssistDisclosure("active"), "expanded");
  });
});
