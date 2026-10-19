import assert from "node:assert/strict";
import { mapHitlDecisionTrail } from "./hitl-decision-trail";

assert.equal(mapHitlDecisionTrail(null), null);

const trail = mapHitlDecisionTrail({
  sessionId: "s1",
  decisions: [
    {
      actionId: "a1",
      sessionId: "s1",
      decision: "approved",
      actorUserId: "doc",
      decidedAt: "2026-07-18T00:00:00.000Z",
      hasReason: false,
      auditRecorded: true,
    },
  ],
  approvedCount: 1,
  rejectedCount: 0,
  pendingActionCount: 0,
  persistGate: "allow",
  requiresPhysicianReview: true,
  executesAction: false,
  autoPersistedToEmr: false,
});

assert.ok(trail);
assert.equal(trail.approvedCount, 1);
assert.equal(trail.persistGate, "allow");
assert.equal(trail.executesAction, false);

console.log("hitl-decision-trail.test.ts: ok");
