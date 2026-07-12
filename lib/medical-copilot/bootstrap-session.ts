/**
 * RC-2 — Bootstrap / restore Medical Copilot session (ownership SSOT).
 * Prefers owned sessionId (auth recovery) over createSession.
 * Never executes clinical actions.
 */

import {
  createMedicalCopilotSession,
  getMedicalCopilotActions,
  getMedicalCopilotMemory,
  getMedicalCopilotSession,
  getMedicalCopilotTimeline,
  getMedicalCopilotWorkspace,
} from "./api";
import {
  assertSingleSessionOwnership,
  getOwnedMedicalCopilotSessionId,
  rememberMedicalCopilotSessionOwnership,
  clearMedicalCopilotSessionOwnership,
} from "./session-ownership";
import type {
  MedicalCopilotActionSummary,
  MedicalCopilotMemorySummary,
  MedicalCopilotSessionSummary,
  MedicalCopilotTimelineSummary,
  MedicalCopilotWorkspaceSummary,
} from "./types";
import { envelopeIsOk } from "./view-model";

export type BootstrapPanels = {
  workspace: MedicalCopilotWorkspaceSummary | null;
  timeline: MedicalCopilotTimelineSummary | null;
  memory: MedicalCopilotMemorySummary | null;
  actions: MedicalCopilotActionSummary[];
};

export type BootstrapSuccess = {
  ok: true;
  session: MedicalCopilotSessionSummary;
  panels: BootstrapPanels;
  restored: boolean;
  duplicateAttempt: boolean;
};

export type BootstrapFailure = {
  ok: false;
  error: string;
  /** Auth-like failure — ownership retained for recovery. */
  authRequired: boolean;
  ownedSessionId: string | null;
};

export type BootstrapResult = BootstrapSuccess | BootstrapFailure;

export type BootstrapDeps = {
  createSession: typeof createMedicalCopilotSession;
  getSession: typeof getMedicalCopilotSession;
  getWorkspace: typeof getMedicalCopilotWorkspace;
  getTimeline: typeof getMedicalCopilotTimeline;
  getMemory: typeof getMedicalCopilotMemory;
  getActions: typeof getMedicalCopilotActions;
  storage?: Pick<Storage, "getItem" | "setItem" | "removeItem"> | null;
};

const defaultDeps: BootstrapDeps = {
  createSession: createMedicalCopilotSession,
  getSession: getMedicalCopilotSession,
  getWorkspace: getMedicalCopilotWorkspace,
  getTimeline: getMedicalCopilotTimeline,
  getMemory: getMedicalCopilotMemory,
  getActions: getMedicalCopilotActions,
};

function isAuthError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message.toLowerCase() : String(err);
  return (
    msg.includes("401") ||
    msg.includes("unauthorized") ||
    msg.includes("unauthenticated") ||
    msg.includes("jwt") ||
    msg.includes("token")
  );
}

async function fetchPanels(
  deps: BootstrapDeps,
  sessionId: string,
): Promise<BootstrapPanels> {
  const [workspaceRes, timelineRes, memoryRes, actionsRes] = await Promise.all([
    deps.getWorkspace(sessionId),
    deps.getTimeline(sessionId),
    deps.getMemory(sessionId),
    deps.getActions(sessionId),
  ]);
  return {
    workspace: envelopeIsOk(workspaceRes) ? workspaceRes.data.workspace : null,
    timeline: envelopeIsOk(timelineRes) ? timelineRes.data.timeline : null,
    memory: envelopeIsOk(memoryRes) ? memoryRes.data.memory : null,
    actions: envelopeIsOk(actionsRes) ? (actionsRes.data.actions ?? []) : [],
  };
}

export async function bootstrapMedicalCopilotSession(
  input: {
    consultationId: string;
    patientId: string;
    appointmentId?: string | null;
  },
  deps: BootstrapDeps = defaultDeps,
): Promise<BootstrapResult> {
  const owned = getOwnedMedicalCopilotSessionId(
    input.consultationId,
    deps.storage,
  );

  try {
    if (owned) {
      const sessionRes = await deps.getSession(owned);
      if (envelopeIsOk(sessionRes) && sessionRes.data.session?.sessionId) {
        const session = sessionRes.data.session;
        const ownership = assertSingleSessionOwnership(
          input.consultationId,
          session.sessionId,
          deps.storage,
        );
        const panels = await fetchPanels(deps, ownership.sessionId);
        rememberMedicalCopilotSessionOwnership(
          input.consultationId,
          ownership.sessionId,
          deps.storage,
        );
        return {
          ok: true,
          session: { ...session, sessionId: ownership.sessionId },
          panels,
          restored: true,
          duplicateAttempt: ownership.duplicateAttempt,
        };
      }
      // Owned id stale / not found → clear and fall through to create once.
      if (sessionRes.status === "not_found") {
        clearMedicalCopilotSessionOwnership(
          input.consultationId,
          deps.storage,
        );
      } else {
        throw new Error(sessionRes.reason || "No se pudo restaurar la sesión");
      }
    }

    const created = await deps.createSession({
      consultationId: input.consultationId,
      patientId: input.patientId,
      appointmentId: input.appointmentId ?? undefined,
    });
    if (!envelopeIsOk(created) || !created.data.session?.sessionId) {
      throw new Error(created.reason || "No se pudo crear la sesión");
    }

    const ownership = assertSingleSessionOwnership(
      input.consultationId,
      created.data.session.sessionId,
      deps.storage,
    );
    // If a concurrent owner won, restore that instead of the newly created id.
    const sessionId = ownership.sessionId;
    let session = created.data.session;
    if (sessionId !== created.data.session.sessionId) {
      const ownedRes = await deps.getSession(sessionId);
      if (!envelopeIsOk(ownedRes) || !ownedRes.data.session) {
        throw new Error("No se pudo resolver session ownership");
      }
      session = ownedRes.data.session;
    }

    const panels = await fetchPanels(deps, sessionId);
    rememberMedicalCopilotSessionOwnership(
      input.consultationId,
      sessionId,
      deps.storage,
    );

    return {
      ok: true,
      session: { ...session, sessionId },
      panels: {
        workspace: panels.workspace ?? created.data.workspace ?? null,
        timeline: panels.timeline ?? created.data.timeline ?? null,
        memory: panels.memory ?? created.data.memory ?? null,
        actions: panels.actions,
      },
      restored: false,
      duplicateAttempt: ownership.duplicateAttempt,
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
      authRequired: isAuthError(err),
      ownedSessionId: getOwnedMedicalCopilotSessionId(
        input.consultationId,
        deps.storage,
      ),
    };
  }
}
