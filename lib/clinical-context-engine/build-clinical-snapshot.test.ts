import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createEmptyEncounterMemory } from "@/lib/encounter/memory/create-encounter-memory";
import { buildClinicalSnapshot } from "./build-clinical-snapshot";
import {
  CLINICAL_CONTEXT_ENGINE_GOVERNANCE,
  CLINICAL_CONTEXT_ENGINE_VERSION,
} from "./types";

describe("Clinical Context Engine — buildClinicalSnapshot", () => {
  it("builds NON_AUTHORITY snapshot from Encounter Memory", () => {
    const memory = createEmptyEncounterMemory({
      consultationId: "c1",
      patientId: "p1",
    });
    memory.encounterStatus = "in_progress";
    memory.patientContext = { name: "Ana", age: 42, sex: "F" };
    memory.activeProblems = ["HTA"];
    memory.workflowPhase = "workspace_ready";
    memory.pendingActions = [{ id: "a1", status: "pending" }];

    const snapshot = buildClinicalSnapshot({
      memory,
      supplement: {
        medications: ["Losartán"],
        allergies: ["Penicilina"],
        consultationReason: "Control HTA",
        vitalSignsSummary: "PA 140/90",
      },
    });

    assert.equal(snapshot.version, CLINICAL_CONTEXT_ENGINE_VERSION);
    assert.equal(
      snapshot.authorityClass,
      CLINICAL_CONTEXT_ENGINE_GOVERNANCE.authorityClass,
    );
    assert.equal(snapshot.activeProblems[0], "HTA");
    assert.deepEqual(snapshot.medications, ["Losartán"]);
    assert.deepEqual(snapshot.allergies, ["Penicilina"]);
    assert.equal(snapshot.consultationReason, "Control HTA");
    assert.ok(snapshot.encounterSummary.includes("Ana"));
    assert.ok(snapshot.priorities.some((p) => p.id === "priority-pending-actions"));
    assert.equal(snapshot.missingCritical.length, 0);
  });

  it("surfaces gaps without inventing diagnoses", () => {
    const memory = createEmptyEncounterMemory({
      consultationId: "c2",
      patientId: "p2",
    });
    const snapshot = buildClinicalSnapshot({ memory });
    assert.ok(
      snapshot.missingCritical.some((g) => g.field === "encounter_status"),
    );
    assert.ok(
      snapshot.missingCritical.some((g) => g.field === "active_problems"),
    );
    assert.ok(!("diagnosis" in snapshot));
    assert.equal(
      CLINICAL_CONTEXT_ENGINE_GOVERNANCE.generatesDiagnosis,
      false,
    );
  });
});
