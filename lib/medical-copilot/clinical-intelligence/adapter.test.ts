import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { MEDICAL_COPILOT_API_VERSION, MEDICAL_COPILOT_GOVERNANCE } from "../types";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotApiEnvelope,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "../types";
import { ClinicalIntelligenceAdapter } from "./adapter";
import { mapFacadeSnapshotToAnalysisResponse } from "./mapper";
import type { FacadeSnapshot } from "./mapper";

function envelope<T>(
  data: T,
  status: "ok" | "not_found" = "ok",
): MedicalCopilotApiEnvelope<T> {
  return {
    source: "medical_copilot_facade",
    apiVersion: MEDICAL_COPILOT_API_VERSION,
    status,
    data,
    governance: { ...MEDICAL_COPILOT_GOVERNANCE },
    reason: null,
    generatedAt: "2026-07-08T12:00:00.000Z",
  };
}

const session: MedicalCopilotSessionSummary = {
  sessionId: "sess_1",
  consultationId: "cons_1",
  patientId: "pat_1",
  status: "active",
};

const workspace: MedicalCopilotWorkspaceSummary = {
  workspaceId: "ws_1",
  sessionId: "sess_1",
  artifacts: [
    {
      artifactId: "art_1",
      artifactType: "note",
      status: "draft",
      version: 1,
    },
  ],
};

const timeline: MedicalCopilotTimelineSummary = {
  timelineId: "tl_1",
  sessionId: "sess_1",
  entries: [
    {
      timelineEntryId: "te_1",
      timestamp: "2026-07-08T12:00:00.000Z",
      eventType: "session_created",
      summary: "Sesión creada",
    },
  ],
};

const memory: MedicalCopilotMemorySummary = {
  memoryId: "mem_1",
  sessionId: "sess_1",
  entries: [
    {
      entryId: "me_1",
      timestamp: "2026-07-08T12:00:00.000Z",
      memoryType: "context",
      summary: "Contexto clínico",
    },
  ],
};

const actions: MedicalCopilotActionSummary[] = [
  {
    actionId: "act_1",
    actionType: "suggest_labs",
    status: "created",
    summary: "Considerar laboratorios",
    priority: "medium",
    requiresPhysicianApproval: true,
    skillId: "skill_labs",
    artifactId: null,
  },
];

function okSnapshot(): FacadeSnapshot {
  return {
    session: envelope({ session }),
    workspace: envelope({ workspace }),
    timeline: envelope({ timeline }),
    memory: envelope({ memory }),
    actions: envelope({ actions }),
  };
}

describe("ClinicalAnalysisMapper", () => {
  it("mapea snapshot Facade → ClinicalAnalysisResponse con HITL", () => {
    const mapped = mapFacadeSnapshotToAnalysisResponse(
      okSnapshot(),
      "cia_test",
      "2026-07-08T12:01:00.000Z",
    );

    assert.equal(mapped.analysisId, "cia_test");
    assert.equal(mapped.session.sessionId, "sess_1");
    assert.equal(mapped.status, "completed");
    assert.equal(mapped.actions.length, 1);
    assert.equal(mapped.actions[0]?.requiresPhysicianApproval, true);
    assert.ok(mapped.findings.length > 0);
    assert.ok(
      mapped.findings.every((f) => f.requiresPhysicianReview === true),
    );
    assert.equal(mapped.governance.requiresPhysicianReview, true);
    assert.equal(mapped.governance.executesAction, false);
    assert.equal(mapped.governance.autoPersistedToEmr, false);
    assert.equal(mapped.governance.source, "medical_copilot_facade");
    assert.equal(mapped.workspaceArtifactCount, 1);
    assert.equal(mapped.timelineEntryCount, 1);
    assert.equal(mapped.memoryEntryCount, 1);
  });

  it("marca partial cuando algún recurso no está ok", () => {
    const snap = okSnapshot();
    snap.memory = envelope({ memory }, "not_found");
    const mapped = mapFacadeSnapshotToAnalysisResponse(snap, "cia_partial");
    assert.equal(mapped.status, "partial");
    assert.ok(mapped.reason?.includes("parcial"));
  });
});

describe("ClinicalIntelligenceAdapter", () => {
  it("valida request inválido sin llamar Facade", async () => {
    let createCalled = 0;
    const adapter = new ClinicalIntelligenceAdapter({
      createSession: async () => {
        createCalled += 1;
        return envelope({
          session,
          workspace,
          memory,
          timeline,
        });
      },
      getSession: async () => envelope({ session }),
      getWorkspace: async () => envelope({ workspace }),
      getTimeline: async () => envelope({ timeline }),
      getMemory: async () => envelope({ memory }),
      getActions: async () => envelope({ actions }),
    });

    const result = await adapter.analyze({
      consultationId: "",
      patientId: "pat_1",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "invalid_request");
    }
    assert.equal(createCalled, 0);
  });

  it("reutiliza sessionId y mapea snapshot", async () => {
    const adapter = new ClinicalIntelligenceAdapter({
      createSession: async () =>
        envelope({
          session,
          workspace,
          memory,
          timeline,
        }),
      getSession: async () => envelope({ session }),
      getWorkspace: async () => envelope({ workspace }),
      getTimeline: async () => envelope({ timeline }),
      getMemory: async () => envelope({ memory }),
      getActions: async () => envelope({ actions }),
    });

    const result = await adapter.analyze({
      consultationId: "cons_1",
      patientId: "pat_1",
      sessionId: "sess_1",
    });

    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.session.sessionId, "sess_1");
      assert.equal(result.data.governance.requiresPhysicianReview, true);
      assert.equal(result.data.actions[0]?.actionId, "act_1");
    }
  });

  it("NO crea sesión cuando falta sessionId (Session Ownership)", async () => {
    let createCalled = 0;
    const adapter = new ClinicalIntelligenceAdapter({
      createSession: async (payload) => {
        createCalled += 1;
        return envelope({
          session,
          workspace,
          memory,
          timeline,
        });
      },
      getSession: async () => envelope({ session }),
      getWorkspace: async () => envelope({ workspace }),
      getTimeline: async () => envelope({ timeline }),
      getMemory: async () => envelope({ memory }),
      getActions: async () => envelope({ actions }),
    });

    const result = await adapter.analyze({
      consultationId: "cons_1",
      patientId: "pat_1",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "invalid_request");
      assert.ok(result.error.message.includes("sessionId"));
    }
    assert.equal(createCalled, 0);
  });

  it("expone timeout cuando la Facade no responde a tiempo", async () => {
    const adapter = new ClinicalIntelligenceAdapter({
      createSession: async () =>
        envelope({
          session,
          workspace,
          memory,
          timeline,
        }),
      getSession: () =>
        new Promise(() => {
          /* never resolves */
        }),
      getWorkspace: async () => envelope({ workspace }),
      getTimeline: async () => envelope({ timeline }),
      getMemory: async () => envelope({ memory }),
      getActions: async () => envelope({ actions }),
    });

    const result = await adapter.analyze({
      consultationId: "cons_1",
      patientId: "pat_1",
      sessionId: "sess_1",
      timeoutMs: 50,
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "timeout");
    }
  });
});
