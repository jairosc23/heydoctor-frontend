/**
 * Protocol-safe queue for trickle ICE received before setRemoteDescription.
 * All entries are local to one PeerConnection and never persisted or logged.
 */
export const MAX_PENDING_REMOTE_ICE_CANDIDATES = 128;

export function matchesRemoteIceGeneration(
  candidate: RTCIceCandidateInit,
  remoteDescription: RTCSessionDescriptionInit,
): boolean {
  const generation = candidate.usernameFragment;
  if (!generation) return true;
  const remoteGenerations = new Set(
    [...(remoteDescription.sdp ?? "").matchAll(/^a=ice-ufrag:([^\r\n]+)/gm)].map(
      (match) => match[1].trim(),
    ),
  );
  // Legacy SDP may omit ufrag: let the browser validate the candidate.
  return remoteGenerations.size === 0 || remoteGenerations.has(generation);
}

export class RemoteIceCandidateQueue {
  private pending: RTCIceCandidateInit[] = [];

  enqueue(candidate: RTCIceCandidateInit): void {
    // Bound memory under hostile or failing signaling; avoid unbounded queues.
    if (this.pending.length >= MAX_PENDING_REMOTE_ICE_CANDIDATES) {
      this.pending.shift();
    }
    this.pending.push(candidate);
  }

  drain(remoteDescription: RTCSessionDescriptionInit | null): RTCIceCandidateInit[] {
    if (!remoteDescription) return [];
    const ready: RTCIceCandidateInit[] = [];
    const waiting: RTCIceCandidateInit[] = [];
    for (const candidate of this.pending) {
      if (matchesRemoteIceGeneration(candidate, remoteDescription)) {
        ready.push(candidate);
      } else {
        // Preserve next-generation candidates until a matching ICE restart SDP.
        waiting.push(candidate);
      }
    }
    this.pending = waiting;
    return ready;
  }

  clear(): void {
    this.pending = [];
  }

  get size(): number {
    return this.pending.length;
  }
}
