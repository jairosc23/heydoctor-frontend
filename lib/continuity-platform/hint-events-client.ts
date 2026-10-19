/**
 * PR-12 CCP Wave C3 — fire-and-forget Continuity hint events client.
 * Never blocks Panel / Composer / handoff UX.
 */

import { heydoctorApi } from "@/lib/heydoctor-api";

export const CCP_HINT_EVENTS_API_VERSION_V1 = "pr12-ccp-events-v1" as const;

export type ContinuityHintEventType =
  | "hint_expanded"
  | "handoff_requested"
  | "handoff_succeeded"
  | "handoff_failed";

export type ContinuityHintEventInput = {
  eventType: ContinuityHintEventType;
  patientId: string;
  encounterId?: string | null;
  hintId?: string | null;
  sourceKind?: string | null;
  handoffId?: string | null;
  resultCode?: string | null;
  occurredAt?: string;
};

const MAX_IN_FLIGHT = 3;
let inFlight = 0;

function newClientEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, "0").slice(-12)}`;
}

function isOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

async function postOnce(body: Record<string, unknown>): Promise<void> {
  await heydoctorApi.fetch("/continuity/hint-events", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Fire-and-forget emit. Drops if offline or >3 in-flight.
 * Single optional retry on network/5xx only.
 */
export function emitContinuityHintEvent(
  input: ContinuityHintEventInput,
): void {
  void emitContinuityHintEventInternal(input);
}

async function emitContinuityHintEventInternal(
  input: ContinuityHintEventInput,
): Promise<void> {
  if (isOffline()) return;
  if (inFlight >= MAX_IN_FLIGHT) return;

  const body = {
    apiVersion: CCP_HINT_EVENTS_API_VERSION_V1,
    clientEventId: newClientEventId(),
    eventType: input.eventType,
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    patientId: input.patientId,
    encounterId: input.encounterId ?? null,
    hintId: input.hintId ?? null,
    sourceKind: input.sourceKind ?? null,
    handoffId: input.handoffId ?? null,
    resultCode: input.resultCode ?? null,
  };

  inFlight += 1;
  try {
    try {
      await postOnce(body);
    } catch (err) {
      const status =
        err && typeof err === "object" && "status" in err
          ? Number((err as { status?: number }).status)
          : undefined;
      const retryable =
        status == null || status >= 500 || status === 0 || Number.isNaN(status);
      if (retryable && !isOffline()) {
        try {
          await postOnce(body);
        } catch {
          // swallow — never surface to UX
        }
      }
    }
  } finally {
    inFlight -= 1;
  }
}

/** Test helpers */
export function __hintEventsInFlightForTests(): number {
  return inFlight;
}

export function __resetHintEventsClientForTests(): void {
  inFlight = 0;
}
