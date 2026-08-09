import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  initialProfilePersistState,
  profilePersistButtonLabel,
  profilePersistLabel,
  reduceProfilePersist,
} from "./patient-profile-persist-fsm";

describe("profile persist FSM (PR-B)", () => {
  it("pending → saving → saved on first success", () => {
    let s = initialProfilePersistState();
    s = reduceProfilePersist(s, { type: "DIRTY" });
    assert.equal(s.phase, "pending");
    assert.equal(profilePersistLabel(s), "Cambios pendientes");
    s = reduceProfilePersist(s, { type: "SUBMIT" });
    assert.equal(s.phase, "saving");
    assert.equal(profilePersistLabel(s), "Guardando…");
    s = reduceProfilePersist(s, { type: "SUCCESS" });
    assert.equal(s.phase, "saved");
    assert.equal(s.hasPersistedOnce, true);
    assert.equal(profilePersistLabel(s), "Información guardada");
  });

  it("pending_again → updating → updated on later success", () => {
    let s = reduceProfilePersist(initialProfilePersistState(), {
      type: "SUCCESS",
    });
    s = reduceProfilePersist(s, { type: "DIRTY" });
    assert.equal(s.phase, "pending_again");
    s = reduceProfilePersist(s, { type: "SUBMIT" });
    assert.equal(s.phase, "updating");
    assert.equal(profilePersistLabel(s), "Actualizando…");
    s = reduceProfilePersist(s, { type: "SUCCESS" });
    assert.equal(s.phase, "updated");
    assert.equal(profilePersistLabel(s), "Información actualizada");
  });

  it("never marks success without SUCCESS event", () => {
    let s = reduceProfilePersist(initialProfilePersistState(), {
      type: "DIRTY",
    });
    s = reduceProfilePersist(s, { type: "SUBMIT" });
    assert.notEqual(s.phase, "saved");
    assert.notEqual(s.phase, "updated");
  });

  it("error → retry resumes saving/updating", () => {
    let s = reduceProfilePersist(initialProfilePersistState(), {
      type: "SUBMIT",
    });
    s = reduceProfilePersist(s, {
      type: "FAILURE",
      message: "Red no disponible",
    });
    assert.equal(s.phase, "error");
    assert.equal(profilePersistButtonLabel(s), "Reintentar");
    s = reduceProfilePersist(s, { type: "RETRY" });
    assert.equal(s.phase, "saving");
  });
});
