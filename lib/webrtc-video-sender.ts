/** Keep a stable video RTP sender when bandwidth policy temporarily detaches its track. */
export function resolveRetainedVideoSender<T extends { track: { kind: string } | null }>(
  senders: readonly T[],
  retained: T | null,
): T | null {
  if (retained && senders.includes(retained)) return retained;
  return senders.find((sender) => sender.track?.kind === "video") ?? null;
}
