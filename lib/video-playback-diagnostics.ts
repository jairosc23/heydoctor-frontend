import type { getLogger } from './logger';

type VideoLogger = ReturnType<typeof getLogger>;

export type VideoPlaybackRole = 'local' | 'remote';

function playErrorMeta(err: unknown): { errorName: string; errorMessage: string } {
  if (err instanceof DOMException) {
    return { errorName: err.name, errorMessage: err.message };
  }
  if (err instanceof Error) {
    return { errorName: err.name, errorMessage: err.message };
  }
  return { errorName: 'unknown', errorMessage: String(err) };
}

/**
 * Asigna srcObject y registra telemetría PHI-safe de reproducción.
 */
export function attachVideoPlaybackDiagnostics(
  el: HTMLVideoElement,
  stream: MediaStream | null,
  role: VideoPlaybackRole,
  log: VideoLogger,
): () => void {
  el.srcObject = stream;

  if (!stream) {
    return () => {
      el.srcObject = null;
    };
  }

  if (role === 'local') {
    el.muted = true;
  }

  const tryPlay = async (trigger: string) => {
    try {
      await el.play();
      log.info('video_play_success', {
        event: 'video_play_success',
        role,
        trigger,
        readyState: el.readyState,
        paused: el.paused,
      });
    } catch (err) {
      const { errorName, errorMessage } = playErrorMeta(err);
      log.warn('video_play_failed', {
        event: 'video_play_failed',
        role,
        trigger,
        readyState: el.readyState,
        paused: el.paused,
        errorName,
        errorMessage,
      });
    }
  };

  const onLoadedMetadata = () => {
    log.debug('video_loadedmetadata', {
      event: 'video_loadedmetadata',
      role,
      readyState: el.readyState,
    });
    void tryPlay('loadedmetadata');
  };

  const onCanPlay = () => {
    log.debug('video_canplay', {
      event: 'video_canplay',
      role,
      readyState: el.readyState,
    });
    void tryPlay('canplay');
  };

  const onPlaying = () => {
    log.debug('video_playing', {
      event: 'video_playing',
      role,
      readyState: el.readyState,
      paused: el.paused,
    });
  };

  el.addEventListener('loadedmetadata', onLoadedMetadata);
  el.addEventListener('canplay', onCanPlay);
  el.addEventListener('playing', onPlaying);

  void tryPlay('srcObject');

  return () => {
    el.removeEventListener('loadedmetadata', onLoadedMetadata);
    el.removeEventListener('canplay', onCanPlay);
    el.removeEventListener('playing', onPlaying);
  };
}

export function streamTrackCounts(stream: MediaStream | null): {
  audio: number;
  video: number;
} {
  if (!stream) {
    return { audio: 0, video: 0 };
  }
  return {
    audio: stream.getAudioTracks().length,
    video: stream.getVideoTracks().length,
  };
}
