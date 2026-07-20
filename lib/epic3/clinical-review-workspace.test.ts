import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  buildClinicalReviewWorkspaceMeta,
  CLINICAL_REVIEW_WORKSPACE_SECTIONS,
} from "./clinical-review-workspace";

const MODULE = path.resolve(
  import.meta.dirname,
  "clinical-review-workspace.ts",
);
const UI = path.resolve(
  import.meta.dirname,
  "../../app/panel/consultas/[id]/_components/copilot/CopilotClinicalReviewWorkspace.tsx",
);

describe("EPIC-3 UC-04A clinical-review-workspace", () => {
  it("orchestrates the seven Close-review surfaces from UC-01…UC-03C", () => {
    assert.equal(CLINICAL_REVIEW_WORKSPACE_SECTIONS.length, 7);
    const ids = CLINICAL_REVIEW_WORKSPACE_SECTIONS.map((s) => s.id);
    assert.deepEqual(ids, [
      "encounter_context",
      "clinical_snapshot",
      "quality_signals",
      "interview_questions",
      "clinical_insights",
      "documentation_quality",
      "clinical_timeline",
    ]);
  });

  it("builds review meta without EMR / SOAP / sign flags", () => {
    const meta = buildClinicalReviewWorkspaceMeta({
      sessionId: "sess-close-1",
      interviewBatch: {
        sessionId: "sess-close-1",
        aiRunId: "r1",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        suggestions: [
          {
            id: "q1",
            text: "Duración",
            origin: "copilot",
            edited: false,
            aiRunId: "r1",
          promptVersion: "v1.0.0",
          },
          {
            id: "q2",
            text: "Intensidad",
            origin: "copilot",
            edited: true,
            aiRunId: "r1",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
      insightsBatch: {
        sessionId: "sess-close-1",
        aiRunId: "r2",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        insights: [
          {
            id: "i1",
            text: "Profundizar alarma",
            origin: "copilot",
            aiRunId: "r2",
          promptVersion: "v1.0.0",
          },
          {
            id: "i2",
            text: "Descartado",
            origin: "copilot",
            discarded: true,
            aiRunId: "r2",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
    });

    assert.equal(meta.phase, "close");
    assert.equal(meta.persistsToEmr, false);
    assert.equal(meta.readOnlyEmr, true);
    assert.equal(meta.generatesSoap, false);
    assert.equal(meta.generatesSummary, false);
    assert.equal(meta.runsGovernedPersistence, false);
    assert.equal(meta.signsConsultation, false);
    assert.equal(meta.interviewFinal.active, 2);
    assert.equal(meta.interviewFinal.total, 2);
    assert.equal(meta.insightsReview.pending, 1);
    assert.equal(meta.insightsReview.discarded, 1);
  });

  it("module and UI orchestrator never call EMR writers or governed persistence", () => {
    for (const file of [MODULE, UI]) {
      assert.ok(fs.existsSync(file), `missing ${file}`);
      const src = fs.readFileSync(file, "utf8");
      for (const token of [
        "updateConsultation",
        "governed-",
        "persistence-execution",
        "signConsultation",
        "/consultations/",
        "getConsultationAssist",
      ]) {
        assert.equal(
          src.includes(token),
          false,
          `${path.basename(file)} contains ${token}`,
        );
      }
    }
  });

  it("UI reuses observational Copilot surfaces, UC-04B selection, UC-04C preview", () => {
    const src = fs.readFileSync(UI, "utf8");
    for (const name of [
      "CopilotPreVisitContext",
      "CopilotPreVisitClinicalSnapshot",
      "CopilotPreVisitQualitySignals",
      "CopilotReviewSelectionLayer",
      "CopilotPersistencePreview",
      "CopilotCloseExecution",
      "CopilotLiveDocumentationQuality",
      "CopilotLiveClinicalContextTimeline",
    ]) {
      assert.ok(src.includes(name), `missing reuse of ${name}`);
    }
    assert.equal(src.includes("getConsultationAssist"), false);
    assert.equal(src.includes("onInterviewRegenerate"), false);
    assert.equal(src.includes("governed-"), false);
  });
});
