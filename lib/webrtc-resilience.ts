'use client';

import {
  reportWebrtcFailure,
  reportWebrtcResilienceMetric,
  reportWebrtcState,
} from './webrtc-observability';
import { captureWebrtcBrowserDiagnostic } from './webrtc-browser-diagnostics';
import { logger } from './logger';
import { computeWebrtcReconnectDelay } from './webrtc-backoff';

export {
  computeWebrtcReconnectDelay,
  jitterWebrtcDelay,
} from './webrtc-backoff';

type MaybePromise<T> = T | Promise<T>;

export type WebrtcPeerId = string;

export type CallReconnectPhase =
  | 'stable'
  | 'reconnecting'
  | 'recovering_media';

export type WebrtcResilienceManagerOptions = {
  consultationId: string;
  backendOrigin: string;
  requestId?: string | null;
  mediaConstraints?: MediaStreamConstraints;
  stalePeerMs?: number;
  reconnectBaseMs?: number;
  reconnectMaxMs?: number;
  /** Mínimo entre ICE restarts consecutivos (evita tormentas). */
  minIceRestartIntervalMs?: number;
  /** Tras `disconnected`, esperar antes de reintentar ICE. */
  disconnectedGraceMs?: number;
  /** Máximo de ICE restarts por peer por sesión. */
  maxIceRestartsPerPeer?: number;
  iceRestartAllowed?: () => boolean;
  onSendOffer: (
    peerId: WebrtcPeerId,
    description: RTCSessionDescriptionInit,
  ) => MaybePromise<void>;
  onReconnectAttempt?: (peerId: WebrtcPeerId, attempt: number) => void;
  onReconnectSuccess?: (peerId: WebrtcPeerId) => void;
  onReconnectPhaseChange?: (phase: CallReconnectPhase) => void;
  onLocalStreamRecovered?: (stream: MediaStream) => void;
  onRequestMediaPlayback?: () => void;
  onZombiePeer?: (peerId: WebrtcPeerId) => void;
  onBrowserDiagnostic?: (reason: string) => void;
};

type PeerRuntime = {
  peer: RTCPeerConnection;
  lastSeenAt: number;
  reconnectAttempts: number;
  iceRestartCount: number;
  reconnectTimer: ReturnType<typeof setTimeout> | null;
  disconnectedTimer: ReturnType<typeof setTimeout> | null;
  staleTimer: ReturnType<typeof setInterval> | null;
  renegotiating: boolean;
  removeListeners: () => void;
};

const DEFAULT_STALE_PEER_MS = 45_000;
const DEFAULT_RECONNECT_BASE_MS = 1_500;
const DEFAULT_RECONNECT_MAX_MS = 18_000;
const DEFAULT_MIN_ICE_RESTART_INTERVAL_MS = 4_500;
const DEFAULT_DISCONNECTED_GRACE_MS = 5_500;
const DEFAULT_MAX_ICE_RESTARTS = 10;
const VISIBILITY_RECOVERY_DEBOUNCE_MS = 400;
const NETWORK_CHANGE_DEBOUNCE_MS = 800;

function backoffDelay(attempt: number, baseMs: number, maxMs: number): number {
  return computeWebrtcReconnectDelay(attempt, baseMs, maxMs);
}

function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop());
}

function replaceSenderTrack(
  peer: RTCPeerConnection,
  stream: MediaStream,
): void {
  for (const sender of peer.getSenders()) {
    const kind = sender.track?.kind;
    if (!kind) continue;
    const replacement = stream.getTracks().find((track) => track.kind === kind);
    if (replacement) {
      void sender.replaceTrack(replacement);
    }
  }
}

async function safePlay(element: HTMLMediaElement): Promise<void> {
  try {
    element.muted = element.dataset.webrtcRole === 'local';
    await element.play();
  } catch {
    /* Safari/iOS puede requerir gesto del usuario */
  }
}

/** Desbloquea audio remoto en Safari/iOS (AudioContext + .play() en <video>). */
export async function unlockWebrtcAutoplay(
  elements: Iterable<HTMLMediaElement>,
): Promise<void> {
  const audioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (audioContextClass) {
    const audioContext = new audioContextClass();
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    await audioContext.close();
  }

  await Promise.all(Array.from(elements, (element) => safePlay(element)));
}

export class WebrtcResilienceManager {
  private readonly peers = new Map<WebrtcPeerId, PeerRuntime>();
  private clientTraceId: string | undefined;
  private localStream: MediaStream | null = null;
  private pageVisibilityHandler: (() => void) | null = null;
  private visibilityDebounceTimer: ReturnType<typeof setTimeout> | null = null;
  private networkOnlineHandler: (() => void) | null = null;
  private networkOfflineHandler: (() => void) | null = null;
  private networkChangeHandler: (() => void) | null = null;
  private networkChangeDebounce: ReturnType<typeof setTimeout> | null = null;
  private disposed = false;
  private iceRestartCooldownUntil = 0;

  constructor(private readonly options: WebrtcResilienceManagerOptions) {
    this.clientTraceId = options.requestId ?? undefined;
  }

  setClientTraceId(traceId: string): void {
    this.clientTraceId = traceId;
  }

  private activeTraceId(): string | undefined {
    return this.clientTraceId ?? this.options.requestId ?? undefined;
  }

  attachPeer(peerId: WebrtcPeerId, peer: RTCPeerConnection): void {
    if (this.disposed) return;
    const existing = this.peers.get(peerId);
    if (existing?.peer === peer) {
      existing.lastSeenAt = Date.now();
      return;
    }
    this.cleanupPeer(peerId);

    const onIceState = (): void => {
      if (this.disposed || !this.isPeerUsable(peerId)) return;
      const state = peer.iceConnectionState;
      this.markPeerSeen(peerId);
      reportWebrtcState('webrtc_ice_state', {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        state,
      });

      if (state === 'connected' || state === 'completed') {
        this.clearDisconnectedGrace(peerId);
        void this.recordReconnectSuccess(peerId);
        return;
      }

      if (!this.mayRestartIce()) return;

      if (state === 'failed') {
        this.clearDisconnectedGrace(peerId);
        void this.restartIce(peerId, 'ice_failed');
        return;
      }

      if (state === 'disconnected') {
        this.armDisconnectedGrace(peerId, 'ice_disconnected');
      }
    };

    const onConnectionState = (): void => {
      if (this.disposed || !this.isPeerUsable(peerId)) return;
      const state = peer.connectionState;
      this.markPeerSeen(peerId);
      reportWebrtcState('webrtc_connection_state', {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        state,
      });

      if (state === 'connected') {
        this.clearDisconnectedGrace(peerId);
        void this.recordReconnectSuccess(peerId);
        return;
      }

      if (!this.mayRestartIce()) return;

      if (state === 'failed') {
        this.clearDisconnectedGrace(peerId);
        void this.restartIce(peerId, 'connection_failed');
        return;
      }

      if (state === 'disconnected') {
        this.armDisconnectedGrace(peerId, 'connection_disconnected');
      }
    };

    const onSignalingState = (): void => {
      if (this.disposed) return;
      reportWebrtcState('webrtc_signaling_state', {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        state: peer.signalingState,
      });
      if (peer.signalingState === 'closed') {
        this.handleZombiePeer(peerId, 'signaling_closed');
      }
    };

    peer.addEventListener('iceconnectionstatechange', onIceState);
    peer.addEventListener('connectionstatechange', onConnectionState);
    peer.addEventListener('signalingstatechange', onSignalingState);

    const staleTimer = setInterval(() => {
      const runtime = this.peers.get(peerId);
      if (!runtime || this.disposed) return;
      if (
        this.mayRestartIce() &&
        this.isPeerUsable(peerId) &&
        Date.now() - runtime.lastSeenAt >= this.stalePeerMs
      ) {
        this.scheduleReconnect(peerId, 'stale_peer');
      }
    }, Math.min(this.stalePeerMs, 15_000));

    this.peers.set(peerId, {
      peer,
      lastSeenAt: Date.now(),
      reconnectAttempts: 0,
      iceRestartCount: 0,
      reconnectTimer: null,
      disconnectedTimer: null,
      staleTimer,
      renegotiating: false,
      removeListeners: () => {
        peer.removeEventListener('iceconnectionstatechange', onIceState);
        peer.removeEventListener('connectionstatechange', onConnectionState);
        peer.removeEventListener('signalingstatechange', onSignalingState);
      },
    });
  }

  attachLocalStream(stream: MediaStream): void {
    if (this.disposed) return;
    if (this.localStream && this.localStream !== stream) {
      stopStream(this.localStream);
    }
    this.localStream = stream;
    for (const runtime of this.peers.values()) {
      if (this.isPeerUsableRuntime(runtime)) {
        replaceSenderTrack(runtime.peer, stream);
      }
    }
    this.options.onRequestMediaPlayback?.();
  }

  markPeerSeen(peerId: WebrtcPeerId): void {
    const runtime = this.peers.get(peerId);
    if (runtime) {
      runtime.lastSeenAt = Date.now();
    }
  }

  /** Socket.IO transport volvió (Wi‑Fi ↔ 4G); no renegocia SDP completo. */
  handleTransportReconnected(): void {
    if (this.disposed || !this.mayRestartIce()) return;
    this.emitBrowserDiagnostic('socket_transport_reconnected');
    for (const peerId of this.peers.keys()) {
      if (this.isPeerUsable(peerId)) {
        this.scheduleReconnect(peerId, 'socket_reconnected');
      }
    }
  }

  async restartIce(peerId: WebrtcPeerId, reason: string): Promise<void> {
    if (this.disposed || !this.mayRestartIce()) return;

    const runtime = this.peers.get(peerId);
    if (!runtime || runtime.renegotiating || !this.isPeerUsableRuntime(runtime)) {
      if (runtime && !this.isPeerUsableRuntime(runtime)) {
        this.handleZombiePeer(peerId, 'restart_on_zombie');
      }
      return;
    }

    if (runtime.iceRestartCount >= this.maxIceRestartsPerPeer) {
      logger.warn('webrtc_ice_restart_cap', {
        consultationId: this.options.consultationId,
        count: runtime.iceRestartCount,
        reason,
      });
      return;
    }

    const now = Date.now();
    if (now < this.iceRestartCooldownUntil) {
      this.scheduleReconnect(peerId, 'ice_restart_cooldown');
      return;
    }

    if (runtime.peer.signalingState !== 'stable') {
      this.scheduleReconnect(peerId, 'renegotiation_not_stable');
      return;
    }

    runtime.renegotiating = true;
    runtime.iceRestartCount += 1;
    this.iceRestartCooldownUntil = now + this.minIceRestartIntervalMs;

    await reportWebrtcResilienceMetric('ice_restart_count', {
      backendOrigin: this.options.backendOrigin,
      consultationId: this.options.consultationId,
      requestId: this.options.requestId,
      count: runtime.iceRestartCount,
      reason,
    });

    try {
      runtime.peer.restartIce?.();
      const offer = await runtime.peer.createOffer({ iceRestart: true });
      await runtime.peer.setLocalDescription(offer);
      await this.options.onSendOffer(peerId, offer);
    } catch (error) {
      reportWebrtcFailure('webrtc_reconnect_failed', error, {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        reason,
      });
      this.scheduleReconnect(peerId, 'ice_restart_failed');
    } finally {
      runtime.renegotiating = false;
    }
  }

  async recoverLocalMedia(reason: string): Promise<MediaStream | null> {
    if (this.disposed) return null;
    this.setReconnectPhase('recovering_media');
    this.emitBrowserDiagnostic(`media_recovery_${reason}`);

    if (!navigator.mediaDevices?.getUserMedia || !this.options.mediaConstraints) {
      await reportWebrtcResilienceMetric('media_recovery_failures', {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        reason: 'get_user_media_unavailable',
      });
      this.setReconnectPhase('stable');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        this.options.mediaConstraints,
      );
      this.attachLocalStream(stream);
      this.options.onLocalStreamRecovered?.(stream);
      this.options.onRequestMediaPlayback?.();
      this.setReconnectPhase('stable');
      return stream;
    } catch (error) {
      await reportWebrtcResilienceMetric('media_recovery_failures', {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        reason,
      });
      reportWebrtcFailure('webrtc_reconnect_failed', error, {
        backendOrigin: this.options.backendOrigin,
        consultationId: this.options.consultationId,
        requestId: this.activeTraceId(),
        reason,
      });
      this.setReconnectPhase('reconnecting');
      return null;
    }
  }

  attachPageVisibilityRecovery(): void {
    if (this.pageVisibilityHandler || typeof document === 'undefined') {
      return;
    }
    this.pageVisibilityHandler = () => {
      if (document.visibilityState !== 'visible' || this.disposed) {
        return;
      }
      if (this.visibilityDebounceTimer) {
        clearTimeout(this.visibilityDebounceTimer);
      }
      this.visibilityDebounceTimer = setTimeout(() => {
        this.visibilityDebounceTimer = null;
        void this.recoverLocalMedia('page_visible');
        if (this.mayRestartIce()) {
          for (const peerId of this.peers.keys()) {
            if (this.isPeerUsable(peerId)) {
              this.scheduleReconnect(peerId, 'page_visible');
            }
          }
        }
      }, VISIBILITY_RECOVERY_DEBOUNCE_MS);
    };
    document.addEventListener('visibilitychange', this.pageVisibilityHandler);
  }

  attachNetworkRecovery(): void {
    if (typeof window === 'undefined') return;
    if (this.networkOnlineHandler) return;

    this.networkOnlineHandler = () => {
      if (this.disposed) return;
      this.emitBrowserDiagnostic('network_online');
      if (!this.mayRestartIce()) return;
      for (const peerId of this.peers.keys()) {
        if (this.isPeerUsable(peerId)) {
          this.scheduleReconnect(peerId, 'network_online');
        }
      }
    };

    this.networkOfflineHandler = () => {
      if (this.disposed) return;
      this.emitBrowserDiagnostic('network_offline');
      this.setReconnectPhase('reconnecting');
      for (const runtime of this.peers.values()) {
        if (runtime.reconnectTimer) {
          clearTimeout(runtime.reconnectTimer);
          runtime.reconnectTimer = null;
        }
      }
    };

    this.networkChangeHandler = () => {
      if (this.disposed) return;
      if (this.networkChangeDebounce) {
        clearTimeout(this.networkChangeDebounce);
      }
      this.networkChangeDebounce = setTimeout(() => {
        this.networkChangeDebounce = null;
        this.emitBrowserDiagnostic('network_type_change');
        void this.recoverLocalMedia('network_change');
        if (this.mayRestartIce()) {
          for (const peerId of this.peers.keys()) {
            if (this.isPeerUsable(peerId)) {
              this.scheduleReconnect(peerId, 'network_change');
            }
          }
        }
      }, NETWORK_CHANGE_DEBOUNCE_MS);
    };

    window.addEventListener('online', this.networkOnlineHandler);
    window.addEventListener('offline', this.networkOfflineHandler);

    const conn = (
      navigator as Navigator & {
        connection?: { addEventListener?: (t: string, l: () => void) => void };
      }
    ).connection;
    conn?.addEventListener?.('change', this.networkChangeHandler);
  }

  cleanupPeer(peerId: WebrtcPeerId): void {
    const runtime = this.peers.get(peerId);
    if (!runtime) return;
    runtime.removeListeners();
    if (runtime.reconnectTimer) clearTimeout(runtime.reconnectTimer);
    if (runtime.disconnectedTimer) clearTimeout(runtime.disconnectedTimer);
    if (runtime.staleTimer) clearInterval(runtime.staleTimer);
    try {
      if (runtime.peer.signalingState !== 'closed') {
        runtime.peer.close();
      }
    } catch {
      /* ignore */
    }
    this.peers.delete(peerId);
  }

  cleanupAll(): void {
    this.disposed = true;
    if (this.visibilityDebounceTimer) {
      clearTimeout(this.visibilityDebounceTimer);
      this.visibilityDebounceTimer = null;
    }
    if (this.networkChangeDebounce) {
      clearTimeout(this.networkChangeDebounce);
      this.networkChangeDebounce = null;
    }
    for (const peerId of Array.from(this.peers.keys())) {
      this.cleanupPeer(peerId);
    }
    stopStream(this.localStream);
    this.localStream = null;
    if (this.pageVisibilityHandler) {
      document.removeEventListener('visibilitychange', this.pageVisibilityHandler);
      this.pageVisibilityHandler = null;
    }
    if (typeof window !== 'undefined') {
      if (this.networkOnlineHandler) {
        window.removeEventListener('online', this.networkOnlineHandler);
        this.networkOnlineHandler = null;
      }
      if (this.networkOfflineHandler) {
        window.removeEventListener('offline', this.networkOfflineHandler);
        this.networkOfflineHandler = null;
      }
      const conn = (
        navigator as Navigator & {
          connection?: {
            removeEventListener?: (t: string, l: () => void) => void;
          };
        }
      ).connection;
      if (this.networkChangeHandler) {
        conn?.removeEventListener?.('change', this.networkChangeHandler);
        this.networkChangeHandler = null;
      }
    }
    this.setReconnectPhase('stable');
  }

  private armDisconnectedGrace(peerId: WebrtcPeerId, reason: string): void {
    const runtime = this.peers.get(peerId);
    if (!runtime || runtime.disconnectedTimer || !this.mayRestartIce()) {
      return;
    }
    runtime.disconnectedTimer = setTimeout(() => {
      runtime.disconnectedTimer = null;
      if (!this.isPeerUsable(peerId)) return;
      const ice = runtime.peer.iceConnectionState;
      const conn = runtime.peer.connectionState;
      if (ice === 'disconnected' || conn === 'disconnected') {
        this.scheduleReconnect(peerId, reason);
      }
    }, this.disconnectedGraceMs);
  }

  private clearDisconnectedGrace(peerId: WebrtcPeerId): void {
    const runtime = this.peers.get(peerId);
    if (!runtime?.disconnectedTimer) return;
    clearTimeout(runtime.disconnectedTimer);
    runtime.disconnectedTimer = null;
  }

  private isPeerUsable(peerId: WebrtcPeerId): boolean {
    const runtime = this.peers.get(peerId);
    return runtime ? this.isPeerUsableRuntime(runtime) : false;
  }

  private isPeerUsableRuntime(runtime: PeerRuntime): boolean {
    return (
      runtime.peer.signalingState !== 'closed' &&
      runtime.peer.connectionState !== 'closed'
    );
  }

  private handleZombiePeer(peerId: WebrtcPeerId, reason: string): void {
    logger.warn('webrtc_zombie_peer', {
      consultationId: this.options.consultationId,
      reason,
    });
    this.cleanupPeer(peerId);
    this.options.onZombiePeer?.(peerId);
  }

  private emitBrowserDiagnostic(reason: string): void {
    const snapshot = captureWebrtcBrowserDiagnostic(
      this.options.consultationId,
      reason,
    );
    if (process.env.NEXT_PUBLIC_WEBRTC_DEBUG === '1') {
      logger.log('webrtc_browser_snapshot', snapshot);
    }
    this.options.onBrowserDiagnostic?.(reason);
  }

  private setReconnectPhase(phase: CallReconnectPhase): void {
    this.options.onReconnectPhaseChange?.(phase);
  }

  private mayRestartIce(): boolean {
    return !this.disposed && (this.options.iceRestartAllowed?.() ?? true);
  }

  private scheduleReconnect(peerId: WebrtcPeerId, reason: string): void {
    if (!this.mayRestartIce() || !this.isPeerUsable(peerId)) {
      return;
    }
    const runtime = this.peers.get(peerId);
    if (!runtime || runtime.reconnectTimer || runtime.renegotiating) {
      return;
    }

    runtime.reconnectAttempts += 1;
    const attempt = runtime.reconnectAttempts;
    this.setReconnectPhase('reconnecting');
    this.options.onReconnectAttempt?.(peerId, attempt);
    void reportWebrtcResilienceMetric('reconnect_attempts', {
      backendOrigin: this.options.backendOrigin,
      consultationId: this.options.consultationId,
      requestId: this.options.requestId,
      count: attempt,
      reason,
    });

    runtime.reconnectTimer = setTimeout(() => {
      const current = this.peers.get(peerId);
      if (!current) return;
      current.reconnectTimer = null;
      void this.restartIce(peerId, reason);
    }, backoffDelay(attempt, this.reconnectBaseMs, this.reconnectMaxMs));
  }

  private async recordReconnectSuccess(peerId: WebrtcPeerId): Promise<void> {
    const runtime = this.peers.get(peerId);
    if (!runtime) return;

    if (runtime.reconnectTimer) {
      clearTimeout(runtime.reconnectTimer);
      runtime.reconnectTimer = null;
    }
    this.clearDisconnectedGrace(peerId);

    if (runtime.reconnectAttempts === 0) {
      this.setReconnectPhase('stable');
      return;
    }

    runtime.reconnectAttempts = 0;
    this.setReconnectPhase('stable');
    this.options.onReconnectSuccess?.(peerId);
    await reportWebrtcResilienceMetric('reconnect_success', {
      backendOrigin: this.options.backendOrigin,
      consultationId: this.options.consultationId,
      requestId: this.options.requestId,
    });
  }

  private get stalePeerMs(): number {
    return this.options.stalePeerMs ?? DEFAULT_STALE_PEER_MS;
  }

  private get reconnectBaseMs(): number {
    return this.options.reconnectBaseMs ?? DEFAULT_RECONNECT_BASE_MS;
  }

  private get reconnectMaxMs(): number {
    return this.options.reconnectMaxMs ?? DEFAULT_RECONNECT_MAX_MS;
  }

  private get minIceRestartIntervalMs(): number {
    return (
      this.options.minIceRestartIntervalMs ?? DEFAULT_MIN_ICE_RESTART_INTERVAL_MS
    );
  }

  private get disconnectedGraceMs(): number {
    return this.options.disconnectedGraceMs ?? DEFAULT_DISCONNECTED_GRACE_MS;
  }

  private get maxIceRestartsPerPeer(): number {
    return this.options.maxIceRestartsPerPeer ?? DEFAULT_MAX_ICE_RESTARTS;
  }
}
