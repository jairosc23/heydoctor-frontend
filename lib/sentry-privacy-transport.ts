import type { Event, NodeOptions } from "@sentry/nextjs";
export type Transport = ReturnType<NonNullable<NodeOptions["transport"]>>;
export type Envelope = Parameters<Transport["send"]>[0];
import { sanitizeSentryEvent } from "./sentry-privacy-gate";

/** Last boundary before serialization: deny every non-error envelope item. */
export function sanitizeSentryEnvelope(envelope: Envelope): Envelope | null {
  const items: Array<
    [
      { type: "event" },
      ReturnType<typeof sanitizeSentryEvent> & {
        type: undefined;
        event_id: string;
      },
    ]
  > = [];
  for (const [header, value] of envelope[1]) {
    if (
      header.type !== "event" ||
      !value ||
      typeof value !== "object" ||
      Array.isArray(value)
    )
      continue;
    const payload = value as unknown as Record<string, unknown>;
    if (payload.type !== undefined) continue;
    const safe = sanitizeSentryEvent(payload as Event);
    if (!safe.event_id) continue;
    items.push([
      { type: "event" },
      { ...safe, type: undefined, event_id: safe.event_id },
    ]);
  }
  // SDK error envelopes contain one event (plus optional attachments). Reject
  // ambiguous or unknown shapes. Rebuild headers, never copy trace/SDK/context.
  return items.length === 1
    ? [
        { event_id: items[0][1].event_id, sent_at: new Date().toISOString() },
        items,
      ]
    : null;
}

export function withSentryPrivacyGate(delegate: Transport): Transport {
  return {
    send(envelope) {
      let safe: Envelope | null;
      try {
        safe = sanitizeSentryEnvelope(envelope);
      } catch {
        return Promise.resolve({});
      }
      return safe ? delegate.send(safe) : Promise.resolve({});
    },
    flush: (timeout) => delegate.flush(timeout),
  };
}
