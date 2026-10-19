/**
 * Ensambla tracks remotos en un único MediaStream (PHI-safe, sin SDP).
 */

export type RemoteTrackMergeSnapshot = {
  trackKind: string;
  incomingStreamCount: number;
  audioTrackCount: number;
  videoTrackCount: number;
};

export function mergeRemoteTrackEvent(
  current: MediaStream | null,
  ev: RTCTrackEvent,
): { stream: MediaStream; snapshot: RemoteTrackMergeSnapshot } {
  const accumulated = current ?? new MediaStream();

  const mergeTrack = (track: MediaStreamTrack) => {
    if (!accumulated.getTracks().includes(track)) {
      accumulated.addTrack(track);
    }
  };

  if (ev.track) {
    mergeTrack(ev.track);
  }

  for (const stream of ev.streams) {
    for (const track of stream.getTracks()) {
      mergeTrack(track);
    }
  }

  const audioTrackCount = accumulated
    .getTracks()
    .filter((t) => t.kind === 'audio').length;
  const videoTrackCount = accumulated
    .getTracks()
    .filter((t) => t.kind === 'video').length;

  return {
    stream: accumulated,
    snapshot: {
      trackKind: ev.track?.kind ?? 'unknown',
      incomingStreamCount: ev.streams.length,
      audioTrackCount,
      videoTrackCount,
    },
  };
}
