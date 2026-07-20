import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { acceptReviewItem, editReviewItem, discardReviewItem, mergeReviewSelectionState } from "./review-selection";
import { buildPersistencePreview } from "./persistence-preview";

const MODULE = path.resolve(import.meta.dirname, "persistence-preview.ts");
const UI = path.resolve(
  import.meta.dirname,
  "../../app/panel/consultas/[id]/_components/copilot/CopilotPersistencePreview.tsx",
);

function seedState() {
  let state = mergeReviewSelectionState({
    sessionId: "sess-pp",
    previous: null,
    interviewBatch: {
      sessionId: "sess-pp",
      aiRunId: "run-iq-1",
      promptVersion: "v1.0.0",
      assistiveOnlyNotice: null,
      suggestions: [
        {
          id: "q1",
          text: "¿Desde cuándo?",
          origin: "copilot",
          edited: false,
          aiRunId: "run-iq-1",
        promptVersion: "v1.0.0",
        },
        {
          id: "q2",
          text: "¿Intensidad?",
          origin: "copilot",
          edited: false,
          aiRunId: "run-iq-1",
        promptVersion: "v1.0.0",
        },
      ],
      generatedAt: new Date().toISOString(),
      readOnlyEmr: true,
      persistsToEmr: false,
    },
    insightsBatch: {
      sessionId: "sess-pp",
      aiRunId: "run-ci-1",
      promptVersion: "v1.0.0",
      assistiveOnlyNotice: null,
      insights: [
        {
          id: "i1",
          text: "Profundizar alarmas",
          origin: "copilot",
          aiRunId: "run-ci-1",
        promptVersion: "v1.0.0",
        },
      ],
      generatedAt: new Date().toISOString(),
      readOnlyEmr: true,
      persistsToEmr: false,
    },
    snapshot: null,
  });
  state = acceptReviewItem(state, "iq:q1");
  state = editReviewItem(state, "iq:q2", "¿Qué intensidad del 1 al 10?");
  state = discardReviewItem(state, "ci:i1");
  return state;
}

describe("EPIC-3 UC-04C persistence-preview", () => {
  it("builds preview_only payload from accepted/edited blocks only", () => {
    const preview = buildPersistencePreview({
      reviewState: seedState(),
      consultationId: "c-1",
      foundationProvenance: [
        {
          id: "prov-1",
          kind: "clinical_memory",
          label: "Memory",
        },
      ],
      promptVersionByAiRunId: { "run-iq-1": "assist-v3" },
      generatedAt: "2026-07-19T21:00:00.000Z",
    });

    assert.equal(preview.schemaVersion, "1.0.0");
    assert.equal(preview.requestedAction, "preview_only");
    assert.equal(preview.consultationId, "c-1");
    assert.equal(preview.summary.accepted, 1);
    assert.equal(preview.summary.edited, 1);
    assert.equal(preview.summary.discarded, 1);
    assert.equal(preview.summary.selectedForPersistence, 2);
    assert.equal(preview.persistenceCandidate.itemCount, 2);
    assert.ok(
      preview.persistenceCandidate.items.every(
        (i) => i.decision === "accepted" || i.decision === "edited",
      ),
    );
    assert.ok(!preview.persistenceCandidate.items.some((i) => i.id === "ci:i1"));
    assert.equal(
      preview.blocks.find((b) => b.id === "iq:q1")?.promptVersion,
      "v1.0.0",
    );
    assert.equal(
      preview.blocks.find((b) => b.id === "iq:q1")?.h1Status,
      "approved",
    );
    assert.equal(preview.governance.persistsToEmr, false);
    assert.equal(preview.governance.writeExecuted, false);
    assert.equal(preview.governance.runsGovernedPersistence, false);
    assert.equal(preview.hitl.h2Status, "not_executed");
    assert.equal(preview.hitl.h3Status, "preview_only_not_executed");
    assert.equal(preview.readOnly, true);
  });

  it("exposes discarded blocks in preview list but not in candidate payload", () => {
    const preview = buildPersistencePreview({ reviewState: seedState() });
    const discarded = preview.blocks.filter((b) => b.decision === "discarded");
    assert.equal(discarded.length, 1);
    assert.equal(discarded[0]?.includedInPersistencePayload, false);
  });

  it("module and UI never execute persistence or call AI assist", () => {
    for (const file of [MODULE, UI]) {
      assert.ok(fs.existsSync(file), `missing ${file}`);
      const src = fs.readFileSync(file, "utf8");
      for (const token of [
        "updateConsultation",
        "persistence-execution",
        "signConsultation",
        "getConsultationAssist",
        "getGovernedPersistencePreview",
        "/medical-copilot/session/",
      ]) {
        assert.equal(
          src.includes(token),
          false,
          `${path.basename(file)} contains ${token}`,
        );
      }
      // Daily Hub forbid token (hyphen form) must not appear in UI surface
      if (file === UI) {
        assert.equal(src.includes("governed-"), false);
      }
    }
  });
});
