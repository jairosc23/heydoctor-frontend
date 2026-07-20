import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  acceptReviewItem,
  collectReviewSelectableItems,
  discardReviewItem,
  editReviewItem,
  mergeReviewSelectionState,
  REVIEW_OBSERVATIONAL_SECTION_IDS,
  REVIEW_SELECTABLE_SECTION_IDS,
  summarizeReviewSelection,
} from "./review-selection";
import type { PreVisitClinicalSnapshotView } from "./pre-visit-clinical-snapshot";

const MODULE = path.resolve(import.meta.dirname, "review-selection.ts");
const SESSION = path.resolve(
  import.meta.dirname,
  "review-selection-session.ts",
);
const UI = path.resolve(
  import.meta.dirname,
  "../../app/panel/consultas/[id]/_components/copilot/CopilotReviewSelectionLayer.tsx",
);

const snapshot: PreVisitClinicalSnapshotView = {
  title: "Pre-Visit Clinical Snapshot",
  patientLabel: "Paciente",
  foundationReady: true,
  evaluatedAt: new Date().toISOString(),
  readOnly: true,
  generative: false,
  persistsToEmr: false,
  sections: [
    {
      id: "problemas_activos",
      title: "Problemas activos",
      availability: "has_data",
      lines: [{ id: "1", text: "HTA" }],
      source: "memory.activeConditions",
    },
    {
      id: "alergias",
      title: "Alergias",
      availability: "unavailable",
      lines: [],
      source: "memory.allergies",
    },
  ],
};

describe("EPIC-3 UC-04B review-selection", () => {
  it("marks selectable vs observational Close sections", () => {
    assert.deepEqual([...REVIEW_SELECTABLE_SECTION_IDS], [
      "interview_questions",
      "clinical_insights",
      "clinical_snapshot",
    ]);
    assert.ok(REVIEW_OBSERVATIONAL_SECTION_IDS.includes("clinical_timeline"));
    assert.ok(REVIEW_OBSERVATIONAL_SECTION_IDS.includes("quality_signals"));
  });

  it("collects EPIC-3 items without inventing content", () => {
    const items = collectReviewSelectableItems({
      interviewBatch: {
        sessionId: "s1",
        aiRunId: "run-iq",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        suggestions: [
          {
            id: "q1",
            text: "¿Desde cuándo?",
            origin: "copilot",
            edited: false,
            aiRunId: "run-iq",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
      insightsBatch: {
        sessionId: "s1",
        aiRunId: "run-ci",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        insights: [
          {
            id: "i1",
            text: "Profundizar signos de alarma",
            origin: "copilot",
            aiRunId: "run-ci",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
      snapshot,
    });

    assert.equal(items.length, 3);
    assert.ok(items.some((i) => i.kind === "interview_question"));
    assert.ok(items.some((i) => i.kind === "clinical_insight"));
    assert.ok(items.some((i) => i.kind === "snapshot_section"));
    assert.ok(!items.some((i) => i.id.includes("alergias")));
  });

  it("applies accept / edit / discard only in session state", () => {
    let state = mergeReviewSelectionState({
      sessionId: "s1",
      previous: null,
      interviewBatch: {
        sessionId: "s1",
        aiRunId: "run-iq",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        suggestions: [
          {
            id: "q1",
            text: "¿Desde cuándo?",
            origin: "copilot",
            edited: false,
            aiRunId: "run-iq",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
      insightsBatch: null,
      snapshot: null,
    });

    const id = state.items[0]?.id;
    assert.ok(id);
    state = acceptReviewItem(state, id);
    assert.equal(state.items[0]?.decision, "accepted");
    assert.equal(state.persistsToEmr, false);

    state = editReviewItem(state, id, "¿Desde cuándo empezó el dolor?");
    assert.equal(state.items[0]?.decision, "edited");
    assert.equal(
      state.items[0]?.displayText,
      "¿Desde cuándo empezó el dolor?",
    );

    state = discardReviewItem(state, id);
    assert.equal(state.items[0]?.decision, "discarded");

    const summary = summarizeReviewSelection(state);
    assert.equal(summary.discarded, 1);
    assert.equal(summary.total, 1);
    assert.equal(state.generatesContent, false);
    assert.equal(state.runsGovernedPersistence, false);
    assert.equal(state.signsConsultation, false);
  });

  it("preserves prior decisions when merging session content", () => {
    const previous = mergeReviewSelectionState({
      sessionId: "s1",
      previous: null,
      interviewBatch: {
        sessionId: "s1",
        aiRunId: "run-iq",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        suggestions: [
          {
            id: "q1",
            text: "A",
            origin: "copilot",
            edited: false,
            aiRunId: "run-iq",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
      insightsBatch: null,
      snapshot: null,
    });
    const accepted = acceptReviewItem(previous, previous.items[0]!.id);
    const merged = mergeReviewSelectionState({
      sessionId: "s1",
      previous: accepted,
      interviewBatch: {
        sessionId: "s1",
        aiRunId: "run-iq",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        suggestions: [
          {
            id: "q1",
            text: "A",
            origin: "copilot",
            edited: false,
            aiRunId: "run-iq",
          promptVersion: "v1.0.0",
          },
          {
            id: "q2",
            text: "B",
            origin: "copilot",
            edited: false,
            aiRunId: "run-iq",
          promptVersion: "v1.0.0",
          },
        ],
        generatedAt: new Date().toISOString(),
        readOnlyEmr: true,
        persistsToEmr: false,
      },
      insightsBatch: null,
      snapshot: null,
    });
    assert.equal(merged.items.length, 2);
    assert.equal(
      merged.items.find((i) => i.id === "iq:q1")?.decision,
      "accepted",
    );
    assert.equal(
      merged.items.find((i) => i.id === "iq:q2")?.decision,
      "pending",
    );
  });

  it("module / session / UI never call EMR writers, AI generation, or governed persistence", () => {
    for (const file of [MODULE, SESSION, UI]) {
      assert.ok(fs.existsSync(file), `missing ${file}`);
      const src = fs.readFileSync(file, "utf8");
      for (const token of [
        "updateConsultation",
        "governed-",
        "persistence-execution",
        "signConsultation",
        "getConsultationAssist",
        "regenerate",
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
