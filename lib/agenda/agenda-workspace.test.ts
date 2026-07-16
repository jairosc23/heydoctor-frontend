import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGENDA_WORKSPACE_TABS,
  isAgendaWorkspaceTab,
} from "./agenda-workspace";

describe("agenda-workspace (Agenda Enterprise Phase 8–9)", () => {
  it("defines five workspace tabs including dashboard", () => {
    assert.equal(AGENDA_WORKSPACE_TABS.length, 5);
    assert.ok(isAgendaWorkspaceTab("dashboard"));
    assert.ok(isAgendaWorkspaceTab("calendar"));
    assert.ok(isAgendaWorkspaceTab("operations"));
    assert.equal(isAgendaWorkspaceTab("analytics"), false);
  });
});
