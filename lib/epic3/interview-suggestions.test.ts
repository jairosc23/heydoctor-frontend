import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import type { ClinicalFoundationBundle } from "@/lib/types/clinical-foundation";
import {
  buildInterviewAssistRequest,
  mapAssistToInterviewSuggestions,
} from "./interview-suggestions";
import type { PreVisitContextView } from "./pre-visit-context";
import { evaluatePreVisitQualitySignals } from "./pre-visit-quality-signals";

const MODULE = path.resolve(import.meta.dirname, "interview-suggestions.ts");
const SESSION_MODULE = path.resolve(
  import.meta.dirname,
  "interview-suggestions-session.ts",
);

function preVisitFixture(): PreVisitContextView {
  return {
    phase: "prep",
    motivo: "Control HTA",
    motivoSource: "foundation_reason",
    patient: {
      id: "p1",
      displayName: "Ana",
      documentLabel: null,
      birthDate: "1990-01-01",
      sex: "F",
      email: null,
    },
    encounter: {
      consultationId: "c1",
      status: "draft",
      statusLabel: "Borrador",
      isSigned: false,
      createdAt: null,
      updatedAt: null,
    },
    agenda: {
      appointmentId: null,
      reason: null,
      startsAt: null,
      status: null,
    },
    bundleHealth: null,
    foundationReady: true,
    foundationError: null,
    sessionId: "sess-1",
    sessionStatus: "ready",
    readOnly: true,
  };
}

describe("EPIC-3 UC-02B interview-suggestions", () => {
  it("builds assist request from prep + quality signals + foundation", () => {
    const foundation = {
      patient: { displayName: "Ana", id: "p1" },
      consultation: { reason: "Control HTA", status: "draft" },
      encounter: { chiefComplaint: null },
      memory: { activeConditions: [], currentMedications: [] },
      bundleHealth: { memoryLoaded: true },
    } as unknown as ClinicalFoundationBundle;
    const quality = evaluatePreVisitQualitySignals(null);
    const req = buildInterviewAssistRequest({
      preVisit: preVisitFixture(),
      qualitySignals: quality,
      foundation,
    });
    assert.match(req.notes ?? "", /UC-02B/);
    assert.match(req.notes ?? "", /PREGUNTAS/);
    assert.match(req.symptoms ?? "", /Quality Signals/);
    assert.equal(req.chiefComplaint, "Control HTA");
  });

  it("maps recommendations to editable Copilot suggestions without EMR flags", () => {
    const batch = mapAssistToInterviewSuggestions({
      sessionId: "sess-1",
      aiRunId: "run-abc",
      promptVersion: "v1.0.0",
      assistiveOnlyNotice: "Solo asistencia",
      recommendations: [
        "¿Desde cuándo tiene cifras altas de presión?",
        "Uso de antihipertensivos actuales",
      ],
    });
    assert.equal(batch.promptVersion, "v1.0.0");
    assert.equal(batch.persistsToEmr, false);
    assert.equal(batch.readOnlyEmr, true);
    assert.equal(batch.suggestions.length, 2);
    assert.ok(batch.suggestions.every((s) => s.origin === "copilot"));
    assert.equal(batch.suggestions[0]?.text.includes("presión"), true);
  });

  it("source modules never call EMR writers or governed persistence", () => {
    for (const file of [MODULE, SESSION_MODULE]) {
      const src = fs.readFileSync(file, "utf8");
      for (const token of [
        "updateConsultation",
        "governed-",
        "persistence-execution",
        "signConsultation",
        "PATCH ",
      ]) {
        assert.equal(
          src.includes(token),
          false,
          `${path.basename(file)} contains ${token}`,
        );
      }
    }
  });
});
