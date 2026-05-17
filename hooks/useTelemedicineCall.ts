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
import { captureWebrtcBrowserDiagnostic } from '@/lib/webrtc-browser-diagnostics';
import {
  unlockWebrtcAutoplay,
  WebrtcResilienceManager,
  type CallReconnectPhase,
} from '@/lib/webrtc-resilience';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

const RESILIENCE_PEER_ID = 'remote';

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
      return (
        'Tiempo de espera agotado al unirse a la videollamada (signaling). ' +
        'Comprueba en Network → WS que el socket a `…/webrtc` esté conectado, ' +
        'que el plan sea PRO y, con varias réplicas en Railway, Redis/sticky para Socket.IO. ' +
        'Si la red es restrictiva, configura TURN en el backend (WEBRTC_TURN_*).'
      );
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

const JOIN_CONSULTATION_ACK_MS = 45_000;

const WEBRTC_DEBUG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_WEBRTC_DEBUG === "1";

function webrtcLog(...args: unknown[]): void {
  if (WEBRTC_DEBUG && typeof console !== "undefined") {
    console.info("[heydoctor:webrtc]", ...args);
  }
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
  /** Safari/iOS: reintentar .play() en elementos de vídeo registrados por la UI. */
  onRequestMediaPlayback?: () => void;
};

export type UseTelemedicineCallResult = {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  connectionState: RTCPeerConnectionState | null;
  iceConnectionState: RTCIceConnectionState | null;
  reconnectPhase: CallReconnectPhase;
  videoTier: AdaptationTier;
  connectionQuality: ConnectionQuality | null;
  /** Vídeo detenido en envío por política de red (audio activo). */
  videoSuspendedForNetwork: boolean;
  /** True mientras el vídeo enviado es pantalla compartida (`getDisplayMedia`). */
  screenSharing: boolean;
  /** `getDisplayMedia` disponible (p. ej. no en muchos móviles / iOS). */
  canShareScreen: boolean;
  startCall: () => Promise<void>;
  endCall: () => void;
  startScreenShare: () => Promise<void>;
  stopScreenShare: () => Promise<void>;
  startRecording: (userConsent: boolean) => Promise<void>;
  stopRecording: (userConsent: boolean) => Promise<void>;
  /** Desbloquea reproducción remota (Safari/iOS) tras gesto del usuario. */
  unlockMediaPlayback: (elements: Iterable<HTMLMediaElement>) => Promise<void>;
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
    onRequestMediaPlayback,
  } = options;

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] =
    useState<RTCPeerConnectionState | null>(null);
  const [iceConnectionState, setIceConnectionState] =
    useState<RTCIceConnectionState | null>(null);
  const [reconnectPhase, setReconnectPhase] =
    useState<CallReconnectPhase>('stable');
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
  const makingOfferRef = useRef(false);
  const resilienceRef = useRef<WebrtcResilienceManager | null>(null);
  const socketHadConnectedRef = useRef(false);

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

  useEffect(() => {
    videoTierRef.current = videoTier;
  }, [videoTier]);

  const detachMonitor = useCallback(() => {
    if (stopStatsRef.current) {
      stopStatsRef.current();
      stopStatsRef.current = null;
    }
  }, []);

  const mayRunIceRestart = useCallback(
    () => isInitiator || !iceRestartInitiatorOnly,
    [iceRestartInitiatorOnly, isInitiator],
  );

  const logBrowserDiagnostic = useCallback(
    (reason: string) => {
      const snapshot = captureWebrtcBrowserDiagnostic(consultationId, reason);
      webrtcLog('browser_snapshot', snapshot);
    },
    [consultationId],
  );

  const createResilienceManager = useCallback(() => {
    const manager = new WebrtcResilienceManager({
      consultationId,
      backendOrigin,
      mediaConstraints,
      stalePeerMs: disconnectedIceRestartMs + 37_000,
      disconnectedGraceMs: disconnectedIceRestartMs,
      iceRestartAllowed: mayRunIceRestart,
      onSendOffer: (_peerId, description) => {
        if (
          !pcRef.current ||
          pcRef.current.signalingState === 'closed' ||
          pcRef.current.connectionState === 'closed'
        ) {
          return;
        }
        socketRef.current?.emit('offer', {
          consultationId,
          sdp: pcRef.current.localDescription ?? description,
        });
      },
      onReconnectPhaseChange: (phase) => {
        setReconnectPhase(phase);
      },
      onReconnectAttempt: () => {
        reconnectingIceRef.current = true;
        setConnectionQuality('reconnecting');
      },
      onReconnectSuccess: () => {
        reconnectingIceRef.current = false;
      },
      onLocalStreamRecovered: (stream) => {
        setLocalStream(stream);
        capturedVideoTrackRef.current = stream.getVideoTracks()[0] ?? null;
        videoSuspendedByPolicyRef.current = false;
        setVideoSuspendedForNetwork(false);
      },
      onBrowserDiagnostic: logBrowserDiagnostic,
      onRequestMediaPlayback,
      onZombiePeer: () => {
        webrtcLog('zombie_peer_detected');
      },
    });
    manager.attachPageVisibilityRecovery();
    manager.attachNetworkRecovery();
    return manager;
  }, [
    backendOrigin,
    consultationId,
    disconnectedIceRestartMs,
    logBrowserDiagnostic,
    mayRunIceRestart,
    mediaConstraints,
    onRequestMediaPlayback,
  ]);

  const unlockMediaPlayback = useCallback(
    (elements: Iterable<HTMLMediaElement>) => unlockWebrtcAutoplay(elements),
    [],
  );

  const wirePeerConnection = useCallback(
    (pc: RTCPeerConnection) => {
      pc.onsignalingstatechange = () => {
        webrtcLog("signalingState", pc.signalingState);
        if (pc.signalingState === 'stable') {
          void prioritizeAudioOverVideo(pc, videoTierRef.current);
        }
      };

      pc.onconnectionstatechange = () => {
        const s = pc.connectionState;
        webrtcLog("connectionState", s);
        setConnectionState(s);
        onConnectionState?.(s);
      };

      pc.oniceconnectionstatechange = () => {
        const s = pc.iceConnectionState;
        webrtcLog("iceConnectionState", s, "gathering:", pc.iceGatheringState);
        iceConnectionStateRef.current = s;
        setIceConnectionState(s);
        onIceConnectionState?.(s);

        if (s === 'connected' || s === 'completed') {
          reconnectingIceRef.current = false;
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
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) return;
        socketRef.current.emit('ice-candidate', {
          consultationId,
          candidate: event.candidate.toJSON(),
        });
      };

      pc.ontrack = (ev) => {
        const [first] = ev.streams;
        const next =
          remoteStreamRef.current ??
          new MediaStream();
        if (ev.track && !next.getTracks().includes(ev.track)) {
          next.addTrack(ev.track);
        }
        remoteStreamRef.current = first ?? next;
        setRemoteStream(remoteStreamRef.current);
      };

    },
    [consultationId, onConnectionState, onIceConnectionState],
  );

  const attachSignalingHandlers = useCallback(
    (socket: Socket, pc: RTCPeerConnection) => {
      socket.off('offer');
      socket.off('answer');
      socket.off('ice-candidate');
      socket.off('peer-joined');
      socket.off('peer-left');

      socket.on('peer-joined', async ({ userId }: { userId: string }) => {
        webrtcLog("event peer-joined", userId);
        remoteIdRef.current = userId;
        onRemoteUserId?.(userId);
        if (!isInitiator || makingOfferRef.current) return;
        if (pc.signalingState !== 'stable') return;
        makingOfferRef.current = true;
        try {
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
          try {
            if (sdp.type === 'offer') {
              if (pc.signalingState !== 'stable') {
                await Promise.all([
                  pc.setLocalDescription({ type: 'rollback' }),
                ]).catch(() => undefined);
              }
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
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
          try {
            if (pc.signalingState === 'have-local-offer') {
              await pc.setRemoteDescription(new RTCSessionDescription(sdp));
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
              resilienceRef.current?.markPeerSeen(RESILIENCE_PEER_ID);
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
    [consultationId, isInitiator, onError, onRemoteUserId],
  );

  const endCall = useCallback(() => {
    detachMonitor();
    resilienceRef.current?.cleanupAll();
    resilienceRef.current = null;
    socketHadConnectedRef.current = false;
    reconnectingIceRef.current = false;
    setReconnectPhase('stable');
    videoSuspendedByPolicyRef.current = false;
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
    const pc = pcRef.current;
    pcRef.current = null;
    if (pc && pc.signalingState !== 'closed') {
      try {
        pc.getSenders().forEach((s) => s.track?.stop());
        pc.close();
      } catch {
        /* ignore */
      }
    }
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
      console.warn('[heydoctor] screen share failed', err);
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
    onRemoteUserId?.(null);

    let socket: Socket;
    if (!externalSocket) {
      if (!guestCall) {
        let sessionOk = false;
        try {
          sessionOk = await ensureAccessToken();
        } catch {
          sessionOk = false;
        }
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
        reconnectionAttempts: 8,
        reconnectionDelayMax: 10_000,
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
          webrtcLog("socket already connected", socket.id);
          resolve();
          return;
        }
        socket.on('connect', () => {
          webrtcLog(
            "socket connect",
            socket.id,
            "transport",
            socket.io.engine?.transport?.name,
          );
          if (socketHadConnectedRef.current) {
            resilienceRef.current?.handleTransportReconnected();
          }
          socketHadConnectedRef.current = true;
        });
        socket.once('connect', () => resolve());
        socket.once('connect_error', (err) => reject(err));
      });

      const iceServers = await fetchWebrtcIceServers({
        backendOrigin,
        consultationId,
      });
      webrtcLog("ICE servers count", iceServers?.length ?? 0);

      const pc = new RTCPeerConnection(createProRtcConfiguration(iceServers));
      pcRef.current = pc;
      wirePeerConnection(pc);

      resilienceRef.current?.cleanupAll();
      resilienceRef.current = createResilienceManager();
      resilienceRef.current.attachPeer(RESILIENCE_PEER_ID, pc);
      logBrowserDiagnostic('call_started');

      const stream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints,
      );
      resilienceRef.current.attachLocalStream(stream);
      setLocalStream(stream);

      capturedVideoTrackRef.current = stream.getVideoTracks()[0] ?? null;
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

      await new Promise<void>((resolve, reject) => {
        webrtcLog(
          "emit join-consultation",
          consultationId,
          `ackDeadlineMs=${JOIN_CONSULTATION_ACK_MS}`,
        );
        socket
          .timeout(JOIN_CONSULTATION_ACK_MS)
          .emit(
            'join-consultation',
            { consultationId },
            (err: Error | null, ack: unknown) => {
              if (err) {
                webrtcLog("join-consultation ack error", err);
                reject(err);
                return;
              }
              webrtcLog("join-consultation ack ok", ack);
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

      if (isInitiator && remoteIdRef.current) {
        /* peer already in room */
        makingOfferRef.current = true;
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', {
            consultationId,
            sdp: pc.localDescription,
          });
        } finally {
          makingOfferRef.current = false;
        }
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
    createResilienceManager,
    logBrowserDiagnostic,
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

  useEffect(() => () => endCall(), [endCall]);

  return {
    localStream,
    remoteStream,
    connectionState,
    iceConnectionState,
    reconnectPhase,
    videoTier,
    connectionQuality,
    videoSuspendedForNetwork,
    screenSharing,
    canShareScreen,
    startCall,
    endCall,
    startScreenShare,
    stopScreenShare,
    startRecording,
    stopRecording,
    unlockMediaPlayback,
  };
}
