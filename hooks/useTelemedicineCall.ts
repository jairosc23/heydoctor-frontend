'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  deriveConnectionQuality,
  type ConnectionQuality,
} from '@/lib/webrtc-connection-quality';
import { fetchWebrtcIceServers } from '@/lib/fetch-webrtc-ice-servers';
import { requestRecordingStart, requestRecordingStop } from '@/lib/webrtc-recording-api';
import { sendCallMetrics } from '@/lib/send-webrtc-metrics';
import { ensureAccessToken, getAccessToken } from '@/lib/auth-client';
import { getLogger } from '@/lib/logger';
import { logLocalGetUserMediaOk } from '@/lib/video-playback-diagnostics';
import type { Socket } from 'socket.io-client';

const logVideo = getLogger('VIDEO');
import { io } from 'socket.io-client';
import {
  reportWebrtcFailure,
  reportWebrtcResilienceMetric,
  reportWebrtcState,
} from '@/lib/webrtc-observability';
import { mergeRemoteTrackEvent } from '@/lib/webrtc-remote-stream';
import { shouldInitiatorCreateOffer } from '@/lib/webrtc-negotiation-offer';

/** Production-oriented RTCPeerConnection defaults (broad browser support). */
export function createProRtcConfiguration(
  iceServers: RTCIceServer[],
): RTCConfiguration {
  return {
    iceServers,
    iceTransportPolicy: 'all',
    iceCandidatePoolSize: 8,
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };
}

export const DEFAULT_CALL_CONSTRAINTS: MediaStreamConstraints = {
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
  video: {
    width: { ideal: 1280, max: 1280 },
    height: { ideal: 720, max: 720 },
    frameRate: { ideal: 24, max: 30 },
    facingMode: 'user',
  },
};

/** Mensajes UX en español para fallos de WebRTC / getUserMedia / socket. */
export function humanizeCallError(err: unknown): string {
  if (err instanceof DOMException) {
    if (
      err.name === 'NotAllowedError' ||
      err.name === 'PermissionDeniedError'
    ) {
      return 'Permiso denegado: permite cámara y micrófono en el navegador y en los ajustes del sistema.';
    }
    if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      return 'No se encontró cámara o micrófono. Comprueba que estén conectados.';
    }
    if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
      return 'La cámara o el micrófono están en uso por otra aplicación.';
    }
    if (err.name === 'OverconstrainedError') {
      return 'El dispositivo no admite la configuración de vídeo solicitada.';
    }
    if (err.name === 'AbortError') {
      return 'Acceso a cámara o micrófono cancelado.';
    }
    return err.message || 'Error al acceder a cámara o micrófono.';
  }
  if (err instanceof Error) {
    const m = err.message.toLowerCase();
    if (m.includes('timeout')) {
      return 'Tiempo de espera agotado al unirse a la videollamada. Inténtalo de nuevo.';
    }
    if (
      m.includes('websocket') ||
      m.includes('xhr poll error') ||
      m.includes('network') ||
      m.includes('econnrefused')
    ) {
      return 'No se pudo conectar al servidor de videollamada. Comprueba tu red e inicia sesión de nuevo.';
    }
    return err.message;
  }
  return 'No se pudo iniciar la videollamada.';
}

type AdaptationTier = 0 | 1 | 2;

/** Bitrate / resolution ladder: higher index = more aggressive save for poor networks */
const VIDEO_TIERS: Array<{
  maxBitrate: number;
  maxFramerate: number;
  scaleResolutionDownBy: number;
}> = [
  { maxBitrate: 1_400_000, maxFramerate: 30, scaleResolutionDownBy: 1 },
  { maxBitrate: 550_000, maxFramerate: 24, scaleResolutionDownBy: 1.5 },
  { maxBitrate: 280_000, maxFramerate: 15, scaleResolutionDownBy: 2 },
];

const AUDIO_FLOOR_BITRATE = 32_000;

async function applyVideoTier(
  videoSender: RTCRtpSender | undefined,
  tier: AdaptationTier,
): Promise<void> {
  if (!videoSender) return;
  const params = videoSender.getParameters();
  if (!params.encodings || params.encodings.length === 0) {
    params.encodings = [{}];
  }

  const t = VIDEO_TIERS[tier];
  const next = params.encodings.map((enc) => ({
    ...enc,
    maxBitrate: t.maxBitrate,
    maxFramerate: t.maxFramerate,
    scaleResolutionDownBy: t.scaleResolutionDownBy,
  }));
  params.encodings = next;
  await videoSender.setParameters(params);
}

async function prioritizeAudioOverVideo(
  pc: RTCPeerConnection,
  videoTier: AdaptationTier,
): Promise<void> {
  const senders = pc.getSenders();
  const audioSender = senders.find((s) => s.track?.kind === 'audio');
  const videoSender = senders.find((s) => s.track?.kind === 'video');

  if (audioSender) {
    const p = audioSender.getParameters();
    const encodings =
      p.encodings?.length ? p.encodings : [{} as RTCRtpEncodingParameters];
    p.encodings = encodings.map((enc) => ({
      ...enc,
      priority: 'high',
      networkPriority: 'high',
      maxBitrate: Math.max(enc.maxBitrate ?? 64_000, AUDIO_FLOOR_BITRATE),
    }));
    try {
      await audioSender.setParameters(p);
    } catch {
      /* ignore if browser ignores priority fields */
    }
  }

  await applyVideoTier(videoSender, videoTier);
}

export type NetworkStatsSample = {
  timestamp: number;
  packetsLost: number;
  packetsSent: number;
  jitter: number;
  roundTripTime?: number;
  availableOutgoingBitrate?: number;
  bytesSent?: number;
};

function parseOutboundVideoStats(
  report: RTCStatsReport,
): Partial<NetworkStatsSample> {
  let packetsLost = 0;
  let packetsSent = 0;
  let jitter = 0;
  let bytesSent = 0;
  let outboundVideoId: string | undefined;

  report.forEach((s) => {
    if (s.type === 'outbound-rtp' && 'kind' in s && s.kind === 'video') {
      outboundVideoId = s.id;
      const o = s as RTCOutboundRtpStreamStats & {
        packetsLost?: number;
        packetsSent?: number;
        bytesSent?: number;
        jitter?: number;
      };
      if (typeof o.packetsLost === 'number') packetsLost = o.packetsLost;
      if (typeof o.packetsSent === 'number') packetsSent = o.packetsSent;
      if (typeof o.bytesSent === 'number') bytesSent = o.bytesSent;
      if ('jitter' in o && typeof o.jitter === 'number') jitter = o.jitter;
    }
  });

  let roundTripTime: number | undefined;
  let availableOutgoingBitrate: number | undefined;

  if (outboundVideoId) {
    const ob = report.get(outboundVideoId);
    const rid =
      ob &&
      'remoteId' in ob &&
      typeof (ob as { remoteId?: string }).remoteId === 'string'
        ? (ob as { remoteId: string }).remoteId
        : undefined;
    if (rid) {
      const remote = report.get(rid);
      if (remote?.type === 'remote-inbound-rtp') {
        const r = remote as unknown as {
          packetsLost?: number;
          jitter?: number;
          roundTripTime?: number;
        };
        if (typeof r.packetsLost === 'number') packetsLost = r.packetsLost;
        if (typeof r.jitter === 'number') jitter = r.jitter;
        if (typeof r.roundTripTime === 'number') {
          roundTripTime = r.roundTripTime * 1000;
        }
      }
    }
  }

  report.forEach((s) => {
    if (s.type === 'candidate-pair' && 'state' in s) {
      const p = s as RTCIceCandidatePairStats;
      if (p.nominated === true && p.state === 'succeeded') {
        if (roundTripTime === undefined && typeof p.currentRoundTripTime === 'number') {
          roundTripTime = p.currentRoundTripTime * 1000;
        }
        if (typeof p.availableOutgoingBitrate === 'number') {
          availableOutgoingBitrate = p.availableOutgoingBitrate;
        }
      }
    }
  });

  return {
    timestamp: Date.now(),
    packetsLost,
    packetsSent,
    jitter,
    roundTripTime,
    availableOutgoingBitrate,
    bytesSent,
  };
}

/**
 * Poll getStats and move video quality tier up/down.
 * Prioritizes audio by lowering video before touching audio.
 */
export function createAdaptiveVideoMonitor(
  pc: RTCPeerConnection,
  getVideoSender: () => RTCRtpSender | undefined,
  options?: {
    intervalMs?: number;
    onTierChange?: (tier: AdaptationTier) => void;
    onStatsSample?: (payload: {
      snap: NetworkStatsSample & { outboundBitrateBps?: number };
      lossRatio: number;
    }) => void | Promise<void>;
  },
): () => void {
  const intervalMs = options?.intervalMs ?? 2500;
  let tier: AdaptationTier = 0;
  let prevLost = 0;
  let stableCycles = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let bitrateAcc = { lastBytes: 0, lastTs: 0 };

  const tick = async () => {
    try {
      const report = await pc.getStats();
      const snap = parseOutboundVideoStats(report);
      const lost = snap.packetsLost ?? 0;
      const sent = snap.packetsSent ?? 0;
      const deltaLost = lost - prevLost;
      const rtt = snap.roundTripTime;
      const outBr = snap.availableOutgoingBitrate;
      const bytes = snap.bytesSent ?? 0;

      let outboundBitrateBps: number | undefined;
      if (bitrateAcc.lastTs > 0) {
        const dt = (Date.now() - bitrateAcc.lastTs) / 1000;
        if (dt >= 0.2 && bytes >= bitrateAcc.lastBytes) {
          outboundBitrateBps = (8 * (bytes - bitrateAcc.lastBytes)) / dt;
        }
      }
      bitrateAcc = { lastBytes: bytes, lastTs: Date.now() };

      prevLost = lost;

      const lossRatio =
        sent + deltaLost > 0 ? deltaLost / (sent + deltaLost + 1) : 0;

      const fullSnap: NetworkStatsSample & {
        outboundBitrateBps?: number;
      } = {
        timestamp: snap.timestamp ?? Date.now(),
        packetsLost: lost,
        packetsSent: sent,
        jitter: snap.jitter ?? 0,
        roundTripTime: snap.roundTripTime,
        availableOutgoingBitrate: snap.availableOutgoingBitrate,
        bytesSent: snap.bytesSent,
        outboundBitrateBps,
      };

      await options?.onStatsSample?.({ snap: fullSnap, lossRatio });

      let downgrade = false;
      if (lossRatio > 0.08 && deltaLost > 2) downgrade = true;
      if (rtt !== undefined && rtt > 450) downgrade = true;
      if (outBr !== undefined && outBr < 250_000 && tier === 0) downgrade = true;

      if (downgrade && tier < 2) {
        tier = (tier + 1) as AdaptationTier;
        stableCycles = 0;
        await applyVideoTier(getVideoSender(), tier);
        options?.onTierChange?.(tier);
      } else if (
        !downgrade &&
        lossRatio < 0.02 &&
        (rtt === undefined || rtt < 200) &&
        (outBr === undefined || outBr > 600_000)
      ) {
        stableCycles += 1;
        if (stableCycles >= 4 && tier > 0) {
          tier = (tier - 1) as AdaptationTier;
          stableCycles = 0;
          await applyVideoTier(getVideoSender(), tier);
          options?.onTierChange?.(tier);
        }
      } else {
        stableCycles = 0;
      }
    } catch {
      /* ignore */
    }
  };

  timer = setInterval(() => void tick(), intervalMs);
  void tick();

  return () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
}

export type UseTelemedicineCallOptions = {
  consultationId: string;
  /** Emite la oferta inicial y, por defecto, los ICE restart (evita glare en 1:1). */
  isInitiator: boolean;
  /** Origen del API, p.ej. https://xxx.up.railway.app */
  backendOrigin: string;
  /** Socket.IO path if no estándar (Nest default: /socket.io) */
  socketPath?: string;
  /** Si ya tienes un socket al namespace /webrtc, pásalo y no se creará otro */
  externalSocket?: Socket | null;
  mediaConstraints?: MediaStreamConstraints;
  /** Solo el lado iniciador ejecuta ICE restart automático */
  iceRestartInitiatorOnly?: boolean;
  disconnectedIceRestartMs?: number;
  onError?: (message: string) => void;
  onConnectionState?: (state: RTCPeerConnectionState) => void;
  onIceConnectionState?: (state: RTCIceConnectionState) => void;
  onRemoteUserId?: (userId: string | null) => void;
  onVideoTierChange?: (tier: AdaptationTier) => void;
  /** default true — POST /api/webrtc/metrics cada ~7.5s (ticks de 2.5s × 3) */
  sendCallMetricsToBackend?: boolean;
  /** Invitado: omitir `ensureAccessToken` antes de abrir el socket (cookies / refresh no aplican). */
  guestCall?: boolean;
};

export type UseTelemedicineCallResult = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | null;
  iceConnectionState: RTCIceConnectionState | null;
  videoTier: AdaptationTier;
  connectionQuality: ConnectionQuality | null;
  /** Vídeo detenido en envío por política de red (audio activo). */
  videoSuspendedForNetwork: boolean;
  /** True mientras el vídeo enviado es pantalla compartida (`getDisplayMedia`). */
  screenSharing: boolean;
  /** `getDisplayMedia` disponible (p. ej. no en muchos móviles / iOS). */
  canShareScreen: boolean;
  /** Diagnóstico: contadores y timestamps (sin tokens/cookies). */
  diagnostics: {
    reconnectAttempts: number;
    iceRestartCount: number;
    lastIceFailureReason: string | null;
    lastDisconnectAtMs: number | null;
    lastPacketLossRatio: number | null;
    lastStatsAtMs: number | null;
    lastLocalVideoEndedAtMs: number | null;
    lastRemoteVideoEndedAtMs: number | null;
  };
  /** Lista de dispositivos (si el navegador lo permite). */
  listDevices: () => Promise<{
    microphones: MediaDeviceInfo[];
    cameras: MediaDeviceInfo[];
    speakers: MediaDeviceInfo[];
  }>;
  /** Cambia micrófono/cámara sin reiniciar llamada. */
  switchMicrophone: (deviceId: string) => Promise<void>;
  switchCamera: (deviceId: string) => Promise<void>;
  /** Recuperación explícita de cámara (iOS/Safari background). */
  recoverCamera: () => Promise<void>;
  startCall: () => Promise<void>;
  endCall: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  startRecording: (userConsent: boolean) => Promise<void>;
  stopRecording: (userConsent: boolean) => Promise<void>;
};

/**
 * Hook de videollamada 1:1 compatible con el gateway Nest:
 * join-consultation, offer, answer, ice-candidate (Socket.IO namespace /webrtc).
 */
export function useTelemedicineCall(
  options: UseTelemedicineCallOptions,
): UseTelemedicineCallResult {
  const {
    consultationId,
    isInitiator,
    backendOrigin,
    socketPath = '/socket.io',
    externalSocket = null,
    mediaConstraints = DEFAULT_CALL_CONSTRAINTS,
    iceRestartInitiatorOnly = true,
    disconnectedIceRestartMs = 8000,
    onError,
    onConnectionState,
    onIceConnectionState,
    onRemoteUserId,
    onVideoTierChange,
    sendCallMetricsToBackend = true,
    guestCall = false,
  } = options;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState | null>(null);
  const [videoTier, setVideoTier] = useState<AdaptationTier>(0);
  const [connectionQuality, setConnectionQuality] = useState<
    ConnectionQuality | null
  >(null);
  const [videoSuspendedForNetwork, setVideoSuspendedForNetwork] =
    useState(false);
  const [screenSharing, setScreenSharing] = useState(false);

  const canShareScreen = useMemo(
    () =>
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      'getDisplayMedia' in navigator.mediaDevices,
    [],
  );

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const ownSocketRef = useRef(false);
  const stopStatsRef = useRef<(() => void) | null>(null);
  const videoTierRef = useRef<AdaptationTier>(0);
  const remoteIdRef = useRef<string | null>(null);
  const roomPeerCountRef = useRef(1);
  const makingOfferRef = useRef(false);
  const iceRestartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const disconnectedSinceRef = useRef<number | null>(null);
  const disconnectedPollRef = useRef<number | null>(null);

  const remoteStreamRef = useRef<MediaStream | null>(null);
  const iceConnectionStateRef = useRef<RTCIceConnectionState | null>(null);
  const reconnectingIceRef = useRef(false);
  const capturedVideoTrackRef = useRef<MediaStreamTrack | null>(null);
  const screenShareTrackRef = useRef<MediaStreamTrack | null>(null);
  const videoSuspendedByPolicyRef = useRef(false);
  const metricsSamplesRef = useRef(0);
  const poorNetworkStreakRef = useRef(0);
  const goodNetworkStreakRef = useRef(0);
  const lastQualityInputsRef = useRef<Parameters<
    typeof deriveConnectionQuality
  >[0] | null>(null);

  const reconnectAttemptsRef = useRef(0);
  const iceRestartCountRef = useRef(0);
  const lastIceFailureReasonRef = useRef<string | null>(null);
  const lastDisconnectAtMsRef = useRef<number | null>(null);
  const lastPacketLossRatioRef = useRef<number | null>(null);
  const lastStatsAtMsRef = useRef<number | null>(null);
  const lastLocalVideoEndedAtMsRef = useRef<number | null>(null);
  const lastRemoteVideoEndedAtMsRef = useRef<number | null>(null);
  const lastCameraRecoverAtMsRef = useRef<number>(0);
  const activeCameraDeviceIdRef = useRef<string | null>(null);
  const activeMicDeviceIdRef = useRef<string | null>(null);
  /** T0 para trazas temporales de join-consultation (PHI-safe). */
  const joinConsultationEmitAtMsRef = useRef<number | null>(null);

  useEffect(() => {
    videoTierRef.current = videoTier;
  }, [videoTier]);

  // DEV-only: emit passive snapshot for diagnostics panel (no tokens/cookies).
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (typeof window === 'undefined') return;
    try {
      window.dispatchEvent(
        new CustomEvent('heydoctor:webrtc-state', {
          detail: {
            connectionState: connectionState ?? null,
            iceConnectionState: iceConnectionState ?? null,
            quality: connectionQuality ?? null,
            reconnecting: reconnectingIceRef.current ?? null,
            roomPeerCount: roomPeerCountRef.current,
            localStreamPresent: Boolean(localStream),
            remoteStreamPresent: Boolean(remoteStream),
            localAudioTracks: localStream?.getAudioTracks().length ?? 0,
            localVideoTracks: localStream?.getVideoTracks().length ?? 0,
            remoteAudioTracks: remoteStream?.getAudioTracks().length ?? 0,
            remoteVideoTracks: remoteStream?.getVideoTracks().length ?? 0,
          },
        }),
      );
    } catch {
      /* noop */
    }
  }, [
    connectionState,
    iceConnectionState,
    connectionQuality,
    localStream,
    remoteStream,
  ]);

  const detachMonitor = useCallback(() => {
    if (stopStatsRef.current) {
      stopStatsRef.current();
      stopStatsRef.current = null;
    }
    if (iceRestartTimerRef.current) {
      clearTimeout(iceRestartTimerRef.current);
      iceRestartTimerRef.current = null;
    }
    if (disconnectedPollRef.current) {
      clearInterval(disconnectedPollRef.current);
      disconnectedPollRef.current = null;
    }
  }, []);

  const runIceRestart = useCallback(async () => {
    const pc = pcRef.current;
    if (!pc || makingOfferRef.current) return;
    if (iceRestartInitiatorOnly && !isInitiator) return;
    if (pc.signalingState !== 'stable') return;

    reconnectingIceRef.current = true;
    setConnectionQuality('reconnecting');

    reconnectAttemptsRef.current += 1;
    iceRestartCountRef.current += 1;
    void reportWebrtcResilienceMetric('reconnect_attempts', {
      backendOrigin,
      consultationId,
      reason: lastIceFailureReasonRef.current ?? 'ice_restart',
      count: 1,
    });
    void reportWebrtcResilienceMetric('ice_restart_count', {
      backendOrigin,
      consultationId,
      reason: lastIceFailureReasonRef.current ?? 'ice_restart',
      count: 1,
    });

    makingOfferRef.current = true;
    try {
      const offer = await pc.createOffer({ iceRestart: true });
      await pc.setLocalDescription(offer);
      socketRef.current?.emit('offer', {
        consultationId,
        sdp: pc.localDescription,
      });
    } catch (e) {
      reportWebrtcFailure(
        'webrtc_reconnect_failed',
        e,
        {
          backendOrigin,
          consultationId,
          state: pc.iceConnectionState ?? null,
          reason: 'ice_restart_offer_failed',
        },
      );
      onError?.((e as Error).message);
    } finally {
      makingOfferRef.current = false;
    }
  }, [
    backendOrigin,
    consultationId,
    iceRestartInitiatorOnly,
    isInitiator,
    onError,
  ]);

  const scheduleIceRestartDebounced = useCallback(() => {
    if (iceRestartTimerRef.current) return;
    iceRestartTimerRef.current = setTimeout(() => {
      iceRestartTimerRef.current = null;
      void runIceRestart();
    }, 1500);
  }, [runIceRestart]);

  const createInitialOfferIfNeeded = useCallback(
    async (reason: string) => {
      const pc = pcRef.current;
      const socket = socketRef.current;
      if (!pc || !socket) return;

      const mayOffer = shouldInitiatorCreateOffer({
        isInitiator,
        peerCount: roomPeerCountRef.current,
        remoteIdPresent: Boolean(remoteIdRef.current),
        signalingState: pc.signalingState,
        hasLocalOffer: pc.localDescription?.type === 'offer',
        makingOffer: makingOfferRef.current,
      });
      if (!mayOffer) return;

      makingOfferRef.current = true;
      try {
        logVideo.info('webrtc_create_offer', {
          event: 'webrtc_create_offer',
          reason,
          consultationId,
          roomPeerCount: roomPeerCountRef.current,
          remoteIdPresent: Boolean(remoteIdRef.current),
        });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('offer', {
          consultationId,
          sdp: pc.localDescription,
        });
      } catch (e) {
        onError?.((e as Error).message);
      } finally {
        makingOfferRef.current = false;
      }
    },
    [consultationId, isInitiator, onError],
  );

  const wirePeerConnection = useCallback(
    (pc: RTCPeerConnection) => {
      pc.onsignalingstatechange = () => {
        if (pc.signalingState === 'stable') {
          void prioritizeAudioOverVideo(pc, videoTierRef.current);
        }
      };

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        setConnectionState(s);
        onConnectionState?.(s);
        reportWebrtcState('webrtc_connection_state', {
          backendOrigin,
          consultationId,
          state: s,
        });
        if (s === 'failed') {
          lastIceFailureReasonRef.current = 'connection_failed';
          scheduleIceRestartDebounced();
        }
      };

      pc.oniceconnectionstatechange = () => {
        const s = pc.iceConnectionState;
        iceConnectionStateRef.current = s;
        setIceConnectionState(s);
        onIceConnectionState?.(s);
        reportWebrtcState('webrtc_ice_state', {
          backendOrigin,
          consultationId,
          state: s,
        });

        if (s === 'connected' || s === 'completed') {
          reconnectingIceRef.current = false;
          void reportWebrtcResilienceMetric('reconnect_success', {
            backendOrigin,
            consultationId,
            reason: lastIceFailureReasonRef.current ?? 'connected',
            count: 1,
          });
          const last = lastQualityInputsRef.current;
          if (last) {
            setConnectionQuality(
              deriveConnectionQuality({
                ...last,
                reconnecting: false,
                iceConnectionState: s,
              }),
            );
          }
        }

        if (s === 'failed' || s === 'disconnected') {
          lastDisconnectAtMsRef.current =
            s === 'disconnected' ? (lastDisconnectAtMsRef.current ?? Date.now()) : Date.now();
          const last = lastQualityInputsRef.current;
          setConnectionQuality(
            deriveConnectionQuality({
              reconnecting: reconnectingIceRef.current,
              iceConnectionState: s,
              lossRatio: last?.lossRatio ?? 0,
              rttMs: last?.rttMs,
              outboundBitrateBps: last?.outboundBitrateBps,
              videoSuspendedForNetwork: last?.videoSuspendedForNetwork ?? false,
            }),
          );
        }

        if (s === 'failed') {
          lastIceFailureReasonRef.current = 'ice_failed';
          reportWebrtcFailure(
            'webrtc_ice_failed',
            new Error('ice_failed'),
            {
              backendOrigin,
              consultationId,
              state: s,
              reason: 'ice_failed',
            },
          );
          scheduleIceRestartDebounced();
        } else if (s === 'disconnected') {
          disconnectedSinceRef.current = disconnectedSinceRef.current ?? Date.now();
        } else {
          disconnectedSinceRef.current = null;
        }
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) return;
        socketRef.current.emit('ice-candidate', {
          consultationId,
          candidate: event.candidate.toJSON(),
        });
      };

      pc.ontrack = (ev) => {
        const { stream, snapshot } = mergeRemoteTrackEvent(
          remoteStreamRef.current,
          ev,
        );
        logVideo.info('webrtc_ontrack', {
          event: 'webrtc_ontrack',
          consultationId,
          ...snapshot,
        });
        if (ev.track?.kind === 'video') {
          ev.track.addEventListener(
            'ended',
            () => {
              lastRemoteVideoEndedAtMsRef.current = Date.now();
              reportWebrtcFailure(
                'webrtc_signaling_failed',
                new Error('remote_video_track_ended'),
                {
                  backendOrigin,
                  consultationId,
                  reason: 'remote_video_track_ended',
                },
              );
            },
            { once: true },
          );
        }
        remoteStreamRef.current = stream;
        setRemoteStream(stream);
      };

      if (disconnectedPollRef.current) {
        clearInterval(disconnectedPollRef.current);
      }
      disconnectedPollRef.current = window.setInterval(() => {
        if (pc.iceConnectionState !== 'disconnected') return;
        const since = disconnectedSinceRef.current;
        if (
          since &&
          Date.now() - since > disconnectedIceRestartMs &&
          (isInitiator || !iceRestartInitiatorOnly)
        ) {
          disconnectedSinceRef.current = null;
          void runIceRestart();
        }
      }, 2000);
    },
    [
      backendOrigin,
      consultationId,
      disconnectedIceRestartMs,
      iceRestartInitiatorOnly,
      isInitiator,
      onConnectionState,
      onIceConnectionState,
      runIceRestart,
      scheduleIceRestartDebounced,
    ],
  );

  const listDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return { microphones: [], cameras: [], speakers: [] };
    }
    const devices = await navigator.mediaDevices.enumerateDevices();
    return {
      microphones: devices.filter((d) => d.kind === 'audioinput'),
      cameras: devices.filter((d) => d.kind === 'videoinput'),
      speakers: devices.filter((d) => d.kind === 'audiooutput'),
    };
  }, []);

  const switchMicrophone = useCallback(async (deviceId: string) => {
    const pc = pcRef.current;
    const current = localStream;
    if (!pc || !current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
      video: false,
    });
    const track = stream.getAudioTracks()[0];
    if (!track) return;
    const sender = pc.getSenders().find((s) => s.track?.kind === 'audio');
    try {
      await sender?.replaceTrack(track);
    } catch {
      /* ignore */
    }
    for (const t of current.getAudioTracks()) {
      try {
        t.stop();
      } catch {
        /* ignore */
      }
      current.removeTrack(t);
    }
    current.addTrack(track);
    activeMicDeviceIdRef.current = deviceId;
    setLocalStream(new MediaStream(current.getTracks()));
  }, [localStream]);

  const switchCamera = useCallback(async (deviceId: string) => {
    const pc = pcRef.current;
    const current = localStream;
    if (!pc || !current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: { deviceId: { exact: deviceId } },
    });
    const track = stream.getVideoTracks()[0];
    if (!track) return;
    const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
    try {
      await sender?.replaceTrack(track);
      await prioritizeAudioOverVideo(pc, videoTierRef.current);
    } catch {
      /* ignore */
    }
    for (const t of current.getVideoTracks()) {
      try {
        t.stop();
      } catch {
        /* ignore */
      }
      current.removeTrack(t);
    }
    current.addTrack(track);
    capturedVideoTrackRef.current = track;
    activeCameraDeviceIdRef.current = deviceId;
    setLocalStream(new MediaStream(current.getTracks()));
  }, [localStream]);

  const recoverCamera = useCallback(async () => {
    const now = Date.now();
    if (now - lastCameraRecoverAtMsRef.current < 2500) return;
    lastCameraRecoverAtMsRef.current = now;
    const pc = pcRef.current;
    const current = localStream;
    if (!pc || !current) return;
    const ended = current.getVideoTracks().some((t) => t.readyState === 'ended');
    if (!ended) return;
    lastLocalVideoEndedAtMsRef.current = now;
    try {
      const preferred = activeCameraDeviceIdRef.current;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: preferred ? { deviceId: { exact: preferred } } : mediaConstraints.video ?? true,
      });
      const track = stream.getVideoTracks()[0];
      if (!track) return;
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      await sender?.replaceTrack(track);
      for (const t of current.getVideoTracks()) {
        try {
          t.stop();
        } catch {
          /* ignore */
        }
        current.removeTrack(t);
      }
      current.addTrack(track);
      capturedVideoTrackRef.current = track;
      setLocalStream(new MediaStream(current.getTracks()));
      await reportWebrtcResilienceMetric('media_recovery_failures', {
        backendOrigin,
        consultationId,
        reason: 'camera_recovered',
        count: 0,
      });
    } catch (e) {
      await reportWebrtcResilienceMetric('media_recovery_failures', {
        backendOrigin,
        consultationId,
        reason: 'camera_recovery_failed',
        count: 1,
      });
      reportWebrtcFailure(
        'webrtc_reconnect_failed',
        e,
        { backendOrigin, consultationId, reason: 'camera_recovery_failed' },
      );
    }
  }, [backendOrigin, consultationId, localStream, mediaConstraints.video]);

  const attachSignalingHandlers = useCallback(
    (socket: Socket, pc: RTCPeerConnection) => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('peer-joined');
      socket.off('peer-left');
      socket.off('room-state');

      socket.on(
        'room-state',
        ({
          peerCount,
          consultationId: roomConsultationId,
        }: {
          peerCount?: number;
          consultationId?: string;
        }) => {
          if (
            roomConsultationId &&
            roomConsultationId !== consultationId
          ) {
            return;
          }
          if (typeof peerCount === 'number') {
            roomPeerCountRef.current = peerCount;
            const emitAt = joinConsultationEmitAtMsRef.current;
            logVideo.info('join_consultation_room_state', {
              event: 'join_consultation_room_state',
              consultationId,
              peerCount,
              socketId: socketRef.current?.id ?? null,
              roomStateLatencyMs:
                emitAt != null ? Date.now() - emitAt : null,
            });
            logVideo.info('webrtc_room_state', {
              event: 'webrtc_room_state',
              consultationId,
              peerCount,
            });
          }
          if (typeof peerCount === 'number' && peerCount > 1 && isInitiator) {
            void createInitialOfferIfNeeded('room_state');
          }
        },
      );

      socket.on('peer-joined', async ({ userId }: { userId: string }) => {
        remoteIdRef.current = userId;
        onRemoteUserId?.(userId);
        logVideo.info('webrtc_peer_joined', {
          event: 'webrtc_peer_joined',
          consultationId,
          remoteIdPresent: true,
        });
        await createInitialOfferIfNeeded('peer_joined');
      });

      socket.on(
        'offer',
        async ({
          sdp,
          fromUserId,
        }: {
          sdp: RTCSessionDescriptionInit;
          fromUserId: string;
        }) => {
          remoteIdRef.current = fromUserId;
          onRemoteUserId?.(fromUserId);
          logVideo.info('webrtc_offer_received', {
            event: 'webrtc_offer_received',
            consultationId,
            signalingState: pc.signalingState,
          });
          try {
            if (sdp.type === 'offer') {
              if (pc.signalingState !== 'stable') {
                await Promise.all([
                  pc.setLocalDescription({ type: 'rollback' }),
                ]).catch(() => undefined);
              }
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
              logVideo.info('webrtc_set_remote_description', {
                event: 'webrtc_set_remote_description',
                consultationId,
                type: 'offer',
              });
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              logVideo.info('webrtc_create_answer', {
                event: 'webrtc_create_answer',
                consultationId,
              });
              socket.emit('answer', {
                consultationId,
                sdp: pc.localDescription,
              });
            }
          } catch (e) {
            onError?.((e as Error).message);
          }
        },
      );

      socket.on(
        'answer',
        async ({
          sdp,
        }: {
          sdp: RTCSessionDescriptionInit;
          fromUserId: string;
        }) => {
          logVideo.info('webrtc_answer_received', {
            event: 'webrtc_answer_received',
            consultationId,
            signalingState: pc.signalingState,
          });
          try {
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
              logVideo.info('webrtc_set_remote_description', {
                event: 'webrtc_set_remote_description',
                consultationId,
                type: 'answer',
              });
            }
          } catch (e) {
            onError?.((e as Error).message);
          }
        },
      );

      socket.on(
        'ice-candidate',
        async ({
          candidate,
        }: {
          candidate: RTCIceCandidateInit;
          fromUserId: string;
        }) => {
          try {
            if (candidate && pc.remoteDescription) {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          } catch {
            /* ignore stale candidates */
          }
        },
      );

      socket.on('peer-left', () => {
        remoteIdRef.current = null;
        onRemoteUserId?.(null);
      });
    },
    [consultationId, createInitialOfferIfNeeded, isInitiator, onError, onRemoteUserId],
  );

  const endCall = useCallback(() => {
    detachMonitor();
    reconnectingIceRef.current = false;
    videoSuspendedByPolicyRef.current = false;
    roomPeerCountRef.current = 1;
    try {
      screenShareTrackRef.current?.stop();
    } catch {
      /* ignore */
    }
    screenShareTrackRef.current = null;
    setScreenSharing(false);
    capturedVideoTrackRef.current = null;
    metricsSamplesRef.current = 0;
    poorNetworkStreakRef.current = 0;
    goodNetworkStreakRef.current = 0;
    lastQualityInputsRef.current = null;
    iceConnectionStateRef.current = null;
    setConnectionQuality(null);
    setVideoSuspendedForNetwork(false);
    try {
      pcRef.current?.getSenders().forEach((s) => s.track?.stop());
      pcRef.current?.close();
    } catch {
      /* ignore */
    }
    pcRef.current = null;
    remoteStreamRef.current = null;
    setRemoteStream(null);

    const sock = socketRef.current;
    if (sock?.connected) {
      sock.emit('leave', { consultationId });
    }
    if (ownSocketRef.current && sock) {
      sock.disconnect();
    }
    socketRef.current = null;
    ownSocketRef.current = false;
    joinConsultationEmitAtMsRef.current = null;

    setLocalStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
    setConnectionState(null);
    setIceConnectionState(null);
    setVideoTier(0);
    videoTierRef.current = 0;
  }, [consultationId, detachMonitor]);

  const stopScreenShare = useCallback(async () => {
    const st = screenShareTrackRef.current;
    screenShareTrackRef.current = null;
    try {
      st?.stop();
    } catch {
      /* ignore */
    }
    setScreenSharing(false);
    const pc = pcRef.current;
    const videoSender = pc?.getSenders().find((s) => s.track?.kind === 'video');
    if (!videoSender) return;
    const cam = capturedVideoTrackRef.current;
    try {
      if (videoSuspendedByPolicyRef.current) {
        await videoSender.replaceTrack(null);
      } else if (cam) {
        await videoSender.replaceTrack(cam);
        if (pc) await prioritizeAudioOverVideo(pc, videoTierRef.current);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const startScreenShare = useCallback(async () => {
    if (!canShareScreen) {
      return;
    }
    const pc = pcRef.current;
    if (!pc) return;
    const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video');
    if (!videoSender) return;
    try {
      const dm = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      const track = dm.getVideoTracks()[0];
      if (!track) return;
      try {
        screenShareTrackRef.current?.stop();
      } catch {
        /* ignore */
      }
      screenShareTrackRef.current = track;
      await videoSender.replaceTrack(track);
      setScreenSharing(true);
      track.addEventListener('ended', () => {
        void stopScreenShare();
      });
      await prioritizeAudioOverVideo(pc, videoTierRef.current);
    } catch (err) {
      logVideo.warn('screen share failed', {
        event: 'screen_share_failed',
        error: err instanceof Error ? err.message : String(err),
      });
      const denied =
        err instanceof DOMException &&
        (err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError');
      onError?.(
        denied
          ? 'Permiso denegado para compartir pantalla.'
          : humanizeCallError(err),
      );
    }
  }, [canShareScreen, onError, stopScreenShare]);

  const startRecording = useCallback(
    async (userConsent: boolean) => {
      await requestRecordingStart({
        backendOrigin,
        consultationId,
        userConsent,
      });
    },
    [backendOrigin, consultationId],
  );

  const stopRecording = useCallback(
    async (userConsent: boolean) => {
      await requestRecordingStop({
        backendOrigin,
        consultationId,
        userConsent,
      });
    },
    [backendOrigin, consultationId],
  );

  const startCall = useCallback(async () => {
    endCall();
    remoteIdRef.current = null;
    roomPeerCountRef.current = 1;
    onRemoteUserId?.(null);

    let socket: Socket;
    if (!externalSocket) {
      if (!guestCall) {
        const sessionOk = await ensureAccessToken();
        if (!sessionOk) {
          const msg = 'Inicia sesión para usar la videollamada.';
          onError?.(msg);
          throw new Error(msg);
        }
      }
      const origin = backendOrigin.replace(/\/$/, '');
      const mem = getAccessToken()?.trim();
      socket = io(`${origin}/webrtc`, {
        path: socketPath,
        transports: ['websocket', 'polling'],
        withCredentials: true,
        autoConnect: true,
        auth: mem ? { token: mem } : {},
      });
      ownSocketRef.current = true;
    } else {
      socket = externalSocket;
      ownSocketRef.current = false;
    }

    socketRef.current = socket;

    try {
      await new Promise<void>((resolve, reject) => {
        if (socket.connected) {
          resolve();
          return;
        }
        socket.once('connect', () => resolve());
        socket.once('connect_error', (err) => reject(err));
      });

      const iceServers = await fetchWebrtcIceServers({
        backendOrigin,
        consultationId,
      });

      const pc = new RTCPeerConnection(createProRtcConfiguration(iceServers));
      pcRef.current = pc;
      wirePeerConnection(pc);

      const stream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints,
      );
      logLocalGetUserMediaOk(stream, logVideo);
      setLocalStream(stream);

      capturedVideoTrackRef.current = stream.getVideoTracks()[0] ?? null;
      const initialVideo = stream.getVideoTracks()[0] ?? null;
      if (initialVideo) {
        try {
          const settings = initialVideo.getSettings?.();
          if (settings?.deviceId) {
            activeCameraDeviceIdRef.current = settings.deviceId;
          }
        } catch {
          /* ignore */
        }
        initialVideo.addEventListener(
          'ended',
          () => {
            lastLocalVideoEndedAtMsRef.current = Date.now();
            // Best-effort recovery for iOS/Safari after background.
            void recoverCamera();
          },
          { once: true },
        );
      }
      const initialAudio = stream.getAudioTracks()[0] ?? null;
      if (initialAudio) {
        try {
          const settings = initialAudio.getSettings?.();
          if (settings?.deviceId) {
            activeMicDeviceIdRef.current = settings.deviceId;
          }
        } catch {
          /* ignore */
        }
      }
      videoSuspendedByPolicyRef.current = false;
      setVideoSuspendedForNetwork(false);
      metricsSamplesRef.current = 0;
      poorNetworkStreakRef.current = 0;
      goodNetworkStreakRef.current = 0;
      setConnectionQuality('good');

      for (const track of stream.getAudioTracks()) {
        pc.addTrack(track, stream);
      }
      for (const track of stream.getVideoTracks()) {
        pc.addTrack(track, stream);
      }

      await prioritizeAudioOverVideo(pc, videoTierRef.current);

      attachSignalingHandlers(socket, pc);

      const joinEmitAtMs = Date.now();
      joinConsultationEmitAtMsRef.current = joinEmitAtMs;
      logVideo.info('join_consultation_emit', {
        event: 'join_consultation_emit',
        consultationId,
        socketId: socket.id ?? null,
        socketConnected: socket.connected,
        emitAtMs: joinEmitAtMs,
      });

      await new Promise<void>((resolve, reject) => {
        socket
          .timeout(20_000)
          .emit(
            'join-consultation',
            { consultationId },
            (err: Error | null, ack: unknown) => {
              const ackAtMs = Date.now();
              const ackLatencyMs = ackAtMs - joinEmitAtMs;
              const traceId =
                ack &&
                typeof ack === 'object' &&
                'traceId' in ack &&
                typeof (ack as { traceId?: unknown }).traceId === 'string'
                  ? (ack as { traceId: string }).traceId
                  : null;

              if (err) {
                logVideo.warn('join_consultation_ack', {
                  event: 'join_consultation_ack',
                  success: false,
                  consultationId,
                  socketId: socket.id ?? null,
                  emitAtMs: joinEmitAtMs,
                  ackAtMs,
                  ackLatencyMs,
                  timedOut: err.message
                    .toLowerCase()
                    .includes('timed out'),
                  errorName: err.name,
                  errorMessage: err.message,
                });
                reject(err);
                return;
              }
              logVideo.info('join_consultation_ack', {
                event: 'join_consultation_ack',
                success: true,
                consultationId,
                socketId: socket.id ?? null,
                emitAtMs: joinEmitAtMs,
                ackAtMs,
                ackLatencyMs,
                traceId,
              });
              if (
                ack &&
                typeof ack === 'object' &&
                'ok' in ack &&
                (ack as { ok?: boolean }).ok !== true
              ) {
                reject(
                  new Error(
                    'No se pudo unir a la sala de videollamada (rechazado por el servidor).',
                  ),
                );
                return;
              }
              resolve();
            },
          );
      });

      stopStatsRef.current = createAdaptiveVideoMonitor(
        pc,
        () => pc.getSenders().find((s) => s.track?.kind === 'video'),
        {
          intervalMs: 2500,
          onTierChange: (tier) => {
            setVideoTier(tier);
            onVideoTierChange?.(tier);
          },
          onStatsSample: async ({ snap, lossRatio }) => {
            lastPacketLossRatioRef.current = lossRatio;
            lastStatsAtMsRef.current = Date.now();
            const qualityInputs = {
              reconnecting: reconnectingIceRef.current,
              iceConnectionState: iceConnectionStateRef.current,
              lossRatio,
              rttMs: snap.roundTripTime,
              outboundBitrateBps: snap.outboundBitrateBps,
              videoSuspendedForNetwork: videoSuspendedByPolicyRef.current,
            };
            lastQualityInputsRef.current = qualityInputs;
            setConnectionQuality(deriveConnectionQuality(qualityInputs));

            const lowBitrate =
              snap.outboundBitrateBps !== undefined &&
              snap.outboundBitrateBps > 0 &&
              snap.outboundBitrateBps < 100_000;

            if (lossRatio > 0.12 || lowBitrate) {
              poorNetworkStreakRef.current += 1;
              goodNetworkStreakRef.current = 0;
            } else {
              poorNetworkStreakRef.current = 0;
            }

            if (
              lossRatio < 0.02 &&
              (snap.roundTripTime === undefined || snap.roundTripTime < 280)
            ) {
              goodNetworkStreakRef.current += 1;
            } else {
              goodNetworkStreakRef.current = 0;
            }

            const videoSender = pc
              .getSenders()
              .find((s) => s.track?.kind === 'video');

            if (
              poorNetworkStreakRef.current >= 2 &&
              !videoSuspendedByPolicyRef.current &&
              capturedVideoTrackRef.current &&
              videoSender
            ) {
              videoSuspendedByPolicyRef.current = true;
              setVideoSuspendedForNetwork(true);
              try {
                await videoSender.replaceTrack(null);
              } catch {
                /* ignore */
              }
            }

            if (
              goodNetworkStreakRef.current >= 4 &&
              videoSuspendedByPolicyRef.current &&
              capturedVideoTrackRef.current &&
              videoSender
            ) {
              videoSuspendedByPolicyRef.current = false;
              setVideoSuspendedForNetwork(false);
              goodNetworkStreakRef.current = 0;
              try {
                await videoSender.replaceTrack(capturedVideoTrackRef.current);
                await prioritizeAudioOverVideo(pc, videoTierRef.current);
              } catch {
                /* ignore */
              }
            }

            if (sendCallMetricsToBackend) {
              metricsSamplesRef.current += 1;
              if (metricsSamplesRef.current >= 3) {
                metricsSamplesRef.current = 0;
                void sendCallMetrics({
                  backendOrigin,
                  consultationId,
                  rtt: snap.roundTripTime,
                  packetsLost: snap.packetsLost,
                  bitrate: snap.outboundBitrateBps,
                  jitter: snap.jitter,
                  packetLossRatio: lossRatio,
                }).catch(() => {
                  /* no UX spam */
                });
              }
            }
          },
        },
      );

      if (
        isInitiator &&
        (remoteIdRef.current || roomPeerCountRef.current > 1)
      ) {
        await createInitialOfferIfNeeded('start_call_peer_present');
      }
    } catch (e) {
      const msg = humanizeCallError(e);
      onError?.(msg);
      endCall();
      throw new Error(msg);
    }

  }, [
    attachSignalingHandlers,
    backendOrigin,
    consultationId,
    createInitialOfferIfNeeded,
    endCall,
    externalSocket,
    isInitiator,
    mediaConstraints,
    onError,
    onRemoteUserId,
    onVideoTierChange,
    sendCallMetricsToBackend,
    guestCall,
    socketPath,
    wirePeerConnection,
  ]);

  useEffect(() => {
    const onVisibility = () => {
      if (
        document.visibilityState === 'visible' &&
        (pcRef.current?.iceConnectionState === 'disconnected' ||
          pcRef.current?.connectionState === 'disconnected')
      ) {
        void runIceRestart();
      }
      if (document.visibilityState === 'visible') {
        void recoverCamera();
      }
    };
    const onOnline = () => {
      const pc = pcRef.current;
      if (
        pc &&
        (pc.iceConnectionState === 'disconnected' ||
          pc.iceConnectionState === 'failed' ||
          pc.connectionState === 'disconnected' ||
          pc.connectionState === 'failed')
      ) {
        void runIceRestart();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('online', onOnline);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('online', onOnline);
    };
  }, [runIceRestart, recoverCamera]);

  useEffect(() => () => endCall(), [endCall]);

  return {
    localStream,
    remoteStream,
    connectionState,
    iceConnectionState,
    videoTier,
    connectionQuality,
    videoSuspendedForNetwork,
    screenSharing,
    canShareScreen,
    diagnostics: {
      reconnectAttempts: reconnectAttemptsRef.current,
      iceRestartCount: iceRestartCountRef.current,
      lastIceFailureReason: lastIceFailureReasonRef.current,
      lastDisconnectAtMs: lastDisconnectAtMsRef.current,
      lastPacketLossRatio: lastPacketLossRatioRef.current,
      lastStatsAtMs: lastStatsAtMsRef.current,
      lastLocalVideoEndedAtMs: lastLocalVideoEndedAtMsRef.current,
      lastRemoteVideoEndedAtMs: lastRemoteVideoEndedAtMsRef.current,
    },
    listDevices,
    switchMicrophone,
    switchCamera,
    recoverCamera,
    startCall,
    endCall,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
  };
}
