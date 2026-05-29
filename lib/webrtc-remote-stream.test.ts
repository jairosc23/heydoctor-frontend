import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';

class MockMediaStream {
  private tracks: MediaStreamTrack[] = [];

  addTrack(track: MediaStreamTrack): void {
    if (!this.tracks.includes(track)) {
      this.tracks.push(track);
    }
  }

  getTracks(): MediaStreamTrack[] {
    return [...this.tracks];
  }

  getAudioTracks(): MediaStreamTrack[] {
    return this.tracks.filter((t) => t.kind === 'audio');
  }

  getVideoTracks(): MediaStreamTrack[] {
    return this.tracks.filter((t) => t.kind === 'video');
  }
}

(
  globalThis as unknown as { MediaStream: new () => MockMediaStream }
).MediaStream = MockMediaStream as unknown as new () => MockMediaStream;

type MergeFn = typeof import('./webrtc-remote-stream').mergeRemoteTrackEvent;
let mergeRemoteTrackEvent: MergeFn;

before(async () => {
  ({ mergeRemoteTrackEvent } = await import('./webrtc-remote-stream.js'));
});

function fakeTrack(kind: 'audio' | 'video', id: string): MediaStreamTrack {
  return { kind, id, readyState: 'live' } as MediaStreamTrack;
}

function fakeStream(tracks: MediaStreamTrack[]): MediaStream {
  return { getTracks: () => tracks } as MediaStream;
}

function fakeEvent(
  track: MediaStreamTrack,
  streams: MediaStream[],
): RTCTrackEvent {
  return { track, streams } as unknown as RTCTrackEvent;
}

describe('mergeRemoteTrackEvent', () => {
  it('accumulates video then audio on separate streams', () => {
    const videoTrack = fakeTrack('video', 'v1');
    const audioTrack = fakeTrack('audio', 'a1');

    const first = mergeRemoteTrackEvent(
      null,
      fakeEvent(videoTrack, [fakeStream([videoTrack])]),
    );
    assert.equal(first.snapshot.videoTrackCount, 1);
    assert.equal(first.snapshot.audioTrackCount, 0);

    const second = mergeRemoteTrackEvent(
      first.stream,
      fakeEvent(audioTrack, [fakeStream([audioTrack])]),
    );
    assert.equal(second.snapshot.videoTrackCount, 1);
    assert.equal(second.snapshot.audioTrackCount, 1);
    assert.equal(second.stream.getVideoTracks().length, 1);
    assert.equal(second.stream.getAudioTracks().length, 1);
  });

  it('accumulates audio then video (audio → video order)', () => {
    const audioTrack = fakeTrack('audio', 'a1');
    const videoTrack = fakeTrack('video', 'v1');

    const first = mergeRemoteTrackEvent(
      null,
      fakeEvent(audioTrack, [fakeStream([audioTrack])]),
    );
    const second = mergeRemoteTrackEvent(
      first.stream,
      fakeEvent(videoTrack, [fakeStream([videoTrack])]),
    );

    assert.equal(second.stream.getAudioTracks().length, 1);
    assert.equal(second.stream.getVideoTracks().length, 1);
  });

  it('does not duplicate tracks on repeated events', () => {
    const track = fakeTrack('video', 'v1');
    const stream = fakeStream([track]);
    const first = mergeRemoteTrackEvent(null, fakeEvent(track, [stream]));
    const second = mergeRemoteTrackEvent(
      first.stream,
      fakeEvent(track, [stream]),
    );
    assert.equal(second.stream.getTracks().length, 1);
  });
});
