import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import {
  buildInitialCloseHitlAudit,
  describeCloseHitlFlow,
  mapPreviewCandidateToSoapPatch,
  validatePreviewForPersistence,
} from "./close-hitl-execution";
import { buildPersistencePreview } from "./persistence-preview";
import {
  acceptReviewItem,
  discardReviewItem,
  editReviewItem,
  mergeReviewSelectionState,
} from "./review-selection";

const MODULE = path.resolve(import.meta.dirname, "close-hitl-execution.ts");
const UI = path.resolve(
  import.meta.dirname,
  "../../app/panel/consultas/[id]/_components/copilot/CopilotCloseExecution.tsx",
);

function readyPreview() {
  let state = mergeReviewSelectionState({
    sessionId: "sess-close",
    previous: null,
    interviewBatch: {
      sessionId: "sess-close",
      aiRunId: "run-1",
      promptVersion: "v1.0.0",
      assistiveOnlyNotice: null,
      suggestions: [
        {
          id: "q1",
          text: "¿Desde cuándo?",
          origin: "copilot",
          edited: false,
          aiRunId: "run-1",
        promptVersion: "v1.0.0",
        },
        {
          id: "q2",
          text: "Descartar esta",
          origin: "copilot",
          edited: false,
          aiRunId: "run-1",
        promptVersion: "v1.0.0",
        },
      ],
      generatedAt: new Date().toISOString(),
      readOnlyEmr: true,
      persistsToEmr: false,
    },
    insightsBatch: {
      sessionId: "sess-close",
      aiRunId: "run-2",
      promptVersion: "v1.0.0",
      assistiveOnlyNotice: null,
      insights: [
        {
          id: "i1",
          text: "Profundizar alarmas",
          origin: "copilot",
          aiRunId: "run-2",
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
  state = editReviewItem(state, "ci:i1", "Verificar signos de alarma neurológicos");
  state = discardReviewItem(state, "iq:q2");
  return buildPersistencePreview({
    reviewState: state,
    consultationId: "c-1",
  });
}

describe("EPIC-3 UC-04D close-hitl-execution", () => {
  it("documents H1→H2→H3→H4 hitl acts", () => {
    const flow = describeCloseHitlFlow();
    assert.equal(flow.h1, "review_ai");
    assert.equal(flow.h2, "approve_action");
    assert.equal(flow.h3, "governed_persistence");
    assert.equal(flow.h4, "sign_consultation");
  });

  it("gates persistence until no pending and has accepted/edited", () => {
    const pendingState = mergeReviewSelectionState({
      sessionId: "s",
      previous: null,
      interviewBatch: {
        sessionId: "s",
        aiRunId: "r",
        promptVersion: "v1.0.0",
        assistiveOnlyNotice: null,
        suggestions: [
          {
            id: "q1",
            text: "A",
            origin: "copilot",
            edited: false,
            aiRunId: "r",
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
    const pendingPreview = buildPersistencePreview({
      reviewState: pendingState,
      consultationId: "c",
    });
    assert.equal(validatePreviewForPersistence(pendingPreview).ok, false);

    const preview = readyPreview();
    const gate = validatePreviewForPersistence(preview);
    assert.equal(gate.ok, true);
    assert.equal(gate.candidateCount, 2);
  });

  it("maps only accepted/edited into SOAP notes patch (never diagnosis)", () => {
    const preview = readyPreview();
    const patch = mapPreviewCandidateToSoapPatch(preview, "Notas previas");
    assert.match(patch.notes, /Notas previas/);
    assert.match(patch.notes, /accepted/);
    assert.match(patch.notes, /edited/);
    assert.match(patch.notes, /¿Desde cuándo\?/);
    assert.match(patch.notes, /signos de alarma/);
    assert.equal(patch.notes.includes("Descartar esta"), false);
    assert.equal("diagnosis" in patch, false);
    assert.equal("treatment" in patch, false);

    const ids = preview.persistenceCandidate.items.map((i) => i.id);
    assert.ok(ids.includes("iq:q1"));
    assert.ok(ids.includes("ci:i1"));
    assert.ok(!ids.includes("iq:q2"));
  });

  it("builds audit trail excluding discarded/pending from candidate ids", () => {
    const preview = readyPreview();
    const audit = buildInitialCloseHitlAudit(preview);
    assert.deepEqual(audit.excludedDecisions, ["discarded", "pending"]);
    assert.ok(audit.candidateItemIds.includes("iq:q1"));
    assert.ok(audit.candidateItemIds.includes("ci:i1"));
    assert.ok(!audit.candidateItemIds.includes("iq:q2"));
    assert.ok(audit.aiRunIds.includes("run-1"));
  });

  it("UI surface avoids forbidden Daily Hub API tokens", () => {
    const src = fs.readFileSync(UI, "utf8");
    assert.equal(src.includes("governed-"), false);
    assert.equal(src.includes("/medical-copilot/session/"), false);
    assert.equal(src.includes("getConsultationAssist"), false);
  });

  it("execution module reuses existing writer + sign APIs", () => {
    const src = fs.readFileSync(MODULE, "utf8");
    assert.ok(src.includes("postMedicalCopilotGovernedSoapPersistenceExecution"));
    assert.ok(src.includes("approveMedicalCopilotAction"));
    assert.ok(src.includes("signConsultation"));
    assert.equal(src.includes("updateConsultation"), false);
    assert.equal(src.includes("getConsultationAssist"), false);
  });
});
