/**
 * CP-33 — Clinical Intelligence Adapter.
 * Consumes only Medical Copilot Facade API. No prompts, no local LLM, no EMR writes.
 */

import {
  AI_ASSIST_UNAVAILABLE_COPY,
  toAiClinicalUserMessage,
} from "@/lib/ai-clinical-errors";
import {
  createMedicalCopilotSession,
  getMedicalCopilotActions,
  getMedicalCopilotMemory,
  getMedicalCopilotSession,
  getMedicalCopilotTimeline,
  getMedicalCopilotWorkspace,
} from "../api";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotApiEnvelope,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "../types";
import {
  mapFacadeSnapshotToAnalysisResponse,
  type FacadeSnapshot,
} from "./mapper";
import type {
  ClinicalAnalysisError,
  ClinicalAnalysisRequest,
  ClinicalAnalysisResponse,
  ClinicalAnalysisResult,
} from "./types";

export type ClinicalIntelligenceFacadeClient = {
  createSession: typeof createMedicalCopilotSession;
  getSession: typeof getMedicalCopilotSession;
  getWorkspace: typeof getMedicalCopilotWorkspace;
  getTimeline: typeof getMedicalCopilotTimeline;
  getMemory: typeof getMedicalCopilotMemory;
  getActions: typeof getMedicalCopilotActions;
};

const DEFAULT_TIMEOUT_MS = 30_000;

const defaultClient: ClinicalIntelligenceFacadeClient = {
  createSession: createMedicalCopilotSession,
  getSession: getMedicalCopilotSession,
  getWorkspace: getMedicalCopilotWorkspace,
  getTimeline: getMedicalCopilotTimeline,
  getMemory: getMedicalCopilotMemory,
  getActions: getMedicalCopilotActions,
};

function createAnalysisId(): string {
  return `cia_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error("Clinical analysis timed out"), { code: "timeout" }));
    }, timeoutMs);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function toError(err: unknown): ClinicalAnalysisError {
  const technical =
    err instanceof Error ? err.message : typeof err === "string" ? err : null;
  if (technical) {
    console.warn("[clinical-intelligence-adapter]", technical);
  }

  const code =
    err && typeof err === "object" && "code" in err
      ? String((err as { code: unknown }).code)
      : null;

  if (code === "timeout") {
    return {
      code: "timeout",
      message: AI_ASSIST_UNAVAILABLE_COPY,
      details: technical,
    };
  }
  if (code === "facade") {
    return {
      code: "facade",
      message: toAiClinicalUserMessage(err, AI_ASSIST_UNAVAILABLE_COPY),
      details: technical,
    };
  }
  if (code === "invalid_request") {
    return {
      code: "invalid_request",
      message: toAiClinicalUserMessage(err, AI_ASSIST_UNAVAILABLE_COPY),
      details: technical,
    };
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return {
        code: "timeout",
        message: AI_ASSIST_UNAVAILABLE_COPY,
        details: technical,
      };
    }
    if (msg.includes("network") || msg.includes("fetch")) {
      return {
        code: "network",
        message: AI_ASSIST_UNAVAILABLE_COPY,
        details: technical,
      };
    }
    return {
      code: "unknown",
      message: toAiClinicalUserMessage(err, AI_ASSIST_UNAVAILABLE_COPY),
      details: technical,
    };
  }
  return {
    code: "unknown",
    message: AI_ASSIST_UNAVAILABLE_COPY,
    details: technical ?? String(err),
  };
}

function validateRequest(request: ClinicalAnalysisRequest): ClinicalAnalysisError | null {
  if (!request.consultationId?.trim()) {
    return {
      code: "invalid_request",
      message: "consultationId es requerido",
      details: null,
    };
  }
  if (!request.patientId?.trim()) {
    return {
      code: "invalid_request",
      message: "patientId es requerido",
      details: null,
    };
  }
  if (!request.sessionId?.trim()) {
    return {
      code: "invalid_request",
      message:
        "sessionId es requerido — Session Ownership: el Adapter no crea sesiones",
      details: null,
    };
  }
  return null;
}

export class ClinicalIntelligenceAdapter {
  private readonly client: ClinicalIntelligenceFacadeClient;

  constructor(client: ClinicalIntelligenceFacadeClient = defaultClient) {
    this.client = client;
  }

  /**
   * Requests a governed clinical analysis snapshot via Facade API only.
   * Does not generate prompts, run local AI, or persist clinical results.
   */
  async analyze(request: ClinicalAnalysisRequest): Promise<ClinicalAnalysisResult> {
    const invalid = validateRequest(request);
    if (invalid) return { ok: false, error: invalid };

    const timeoutMs = request.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    try {
      const response = await withTimeout(
        this.runAnalysis(request),
        timeoutMs,
      );
      return { ok: true, data: response };
    } catch (err) {
      return { ok: false, error: toError(err) };
    }
  }

  private async runAnalysis(
    request: ClinicalAnalysisRequest,
  ): Promise<ClinicalAnalysisResponse> {
    const sessionId = await this.resolveSessionId(request);
    const snapshot = await this.fetchSnapshot(sessionId);
    return mapFacadeSnapshotToAnalysisResponse(snapshot, createAnalysisId());
  }

  private async resolveSessionId(
    request: ClinicalAnalysisRequest,
  ): Promise<string> {
    const sessionId = request.sessionId?.trim();
    if (!sessionId) {
      throw Object.assign(
        new Error(
          "sessionId requerido — Session Ownership: Adapter no crea sesiones",
        ),
        { code: "invalid_request" },
      );
    }
    return sessionId;
  }

  private async fetchSnapshot(sessionId: string): Promise<FacadeSnapshot> {
    const [session, workspace, timeline, memory, actions] = await Promise.all([
      this.client.getSession(sessionId),
      this.client.getWorkspace(sessionId),
      this.client.getTimeline(sessionId),
      this.client.getMemory(sessionId),
      this.client.getActions(sessionId),
    ]);

    return {
      session: session as MedicalCopilotApiEnvelope<{
        session: MedicalCopilotSessionSummary;
      }>,
      workspace: workspace as MedicalCopilotApiEnvelope<{
        workspace: MedicalCopilotWorkspaceSummary;
      }>,
      timeline: timeline as MedicalCopilotApiEnvelope<{
        timeline: MedicalCopilotTimelineSummary;
      }>,
      memory: memory as MedicalCopilotApiEnvelope<{
        memory: MedicalCopilotMemorySummary;
      }>,
      actions: actions as MedicalCopilotApiEnvelope<{
        actions: MedicalCopilotActionSummary[];
      }>,
    };
  }
}

/** Default singleton for hooks / presentation layer. */
export const clinicalIntelligenceAdapter = new ClinicalIntelligenceAdapter();
