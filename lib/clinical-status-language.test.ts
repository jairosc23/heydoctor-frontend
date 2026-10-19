import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  autosaveStatusToClinical,
  consultationStatusToClinical,
  getClinicalStatus,
  orderStatusToClinical,
} from "./clinical-status-language";

describe("clinical-status-language", () => {
  it("unifica estados de consulta, órdenes y autosave", () => {
    assert.equal(consultationStatusToClinical("draft"), "draft");
    assert.equal(consultationStatusToClinical("in_progress"), "active");
    assert.equal(consultationStatusToClinical("locked"), "critical");
    assert.equal(orderStatusToClinical("pending"), "pending");
    assert.equal(orderStatusToClinical("unexecuted"), "unexecuted");
    assert.equal(autosaveStatusToClinical("saved"), "completed");
    assert.equal(autosaveStatusToClinical("error"), "critical");
  });

  it("expone clases visuales consistentes por estado", () => {
    const active = getClinicalStatus("active");
    const critical = getClinicalStatus("critical");
    assert.match(active.badgeClass, /clinical-status--active/);
    assert.match(critical.badgeClass, /clinical-status--critical/);
    assert.ok(active.accentClass.length > 0);
  });
});
