import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AGENDA_WORKSPACE_TABS,
  isAgendaWorkspaceTab,
} from "./agenda-workspace";

describe("agenda-workspace (Agenda Enterprise Phase 8)", () => {
  it("defines four workspace tabs", () => {
    assert.equal(AGENDA_WORKSPACE_TABS.length, 4);
    assert.ok(isAgendaWorkspaceTab("calendar"));
    assert.ok(isAgendaWorkspaceTab("operations"));
    assert.equal(isAgendaWorkspaceTab("dashboard"), false);
  });
});
