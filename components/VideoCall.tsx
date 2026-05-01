"use client";

/**
 * Única implementación de videollamada UI de la app. Importar siempre desde
 * `@/components/VideoCall` (no duplicar este componente en otras rutas).
 */

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { ConnectionQualityBadge } from "@/components/ConnectionQualityBadge";
import { getBackendOrigin } from "@/lib/api-base";
import { logger } from "@/lib/logger";
import { useTelemedicineCall } from "@/hooks/useTelemedicineCall";
import { useIsMobile } from "@/lib/hooks/useIsMobile";

function safeVibrate(pattern?: number | number[]): void {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;
  try {
    navigator.vibrate(pattern ?? 35);
  } catch {
    /* ignorar: política del navegador o permisos */
  }
}

export type VideoCallProps = {
  consultationId: string;
  onEndCall: () => void;
  /**
   * Quien emite oferta tras `peer-joined`. Por defecto `true` para ambos lados:
   * solo quien ya estaba en sala recibe el evento y negocia.
   */
  isInitiator?: boolean;
  /**
   * Grabación local (WebM). Distinto de los stubs de API del hook.
   */
  enableCallRecording?: boolean;
  /** Nombre del participante remoto (p. ej. paciente) para el encabezado. */
  peerDisplayName?: string;
  /**
   * Navegación y título dentro de la propia llamada (barra flotante tipo Meet).
   * {@link TeleconsultaVideoSession} siempre lo rellena.
   */
  callChrome: VideoCallCallChrome;
};

export type VideoCallCallChrome = {
  backHref: string;
  backLabel: string;
  /** Si se omite, se arma con `peerDisplayName` o «Teleconsulta». */
  title?: string;
};

/** API imperativa cuando `enableCallRecording` es true (sin UI en el componente). */
export type VideoCallRecordingHandle = {
  startRecording: () => void;
  stopRecording: () => void;
};

function pickWebmMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "video/webm";
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
  ];
  for (const t of candidates) {
    if (MediaRecorder.isTypeSupported(t)) return t;
  }
  return "video/webm";
}

/**
 * WebRTC 1:1 sobre signaling Nest (`/webrtc`) vía {@link useTelemedicineCall}.
 */
export const VideoCall = forwardRef<
  VideoCallRecordingHandle,
  VideoCallProps
>(function VideoCall(
  {
    consultationId,
    onEndCall,
    isInitiator = true,
    enableCallRecording = false,
    peerDisplayName,
    callChrome,
  },
  ref
) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const mountedRef = useRef(true);

  const isMobile = useIsMobile();
  const mobileShellRef = useRef<HTMLDivElement>(null);
  const controlsHideTimerRef = useRef<number | null>(null);
  const prevInCallRef = useRef(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

  const clearControlsHideTimer = useCallback(() => {
    if (controlsHideTimerRef.current !== null) {
      clearTimeout(controlsHideTimerRef.current);
      controlsHideTimerRef.current = null;
    }
  }, []);

  const showControlsWithAutoHide = useCallback(() => {
    if (typeof window === "undefined") return;
    setControlsVisible(true);
    clearControlsHideTimer();
    controlsHideTimerRef.current = window.setTimeout(() => {
      controlsHideTimerRef.current = null;
      setControlsVisible(false);
    }, 2500);
  }, [clearControlsHideTimer]);

  const {
    localStream,
    remoteStream,
    connectionQuality,
    connectionState,
    iceConnectionState,
    screenSharing,
    canShareScreen,
    startCall,
    endCall,
    startScreenShare,
    stopScreenShare,
  } = useTelemedicineCall({
    consultationId,
    isInitiator,
    backendOrigin: getBackendOrigin(),
    socketPath: "/socket.io",
    onError: (message) => setError(message),
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log({
        quality: connectionQuality,
      });
    }
  }, [connectionQuality]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const stopMediaRecorderIfActive = useCallback(() => {
    const r = mediaRecorderRef.current;
    if (r && (r.state === "recording" || r.state === "paused")) {
      try {
        r.stop();
      } catch {
        /* ya inactivo */
      }
    }
  }, []);

  const startRecordingInternal = useCallback(() => {
    if (!enableCallRecording) return;
    const existing = mediaRecorderRef.current;
    if (existing && existing.state === "recording") return;

    const local = localStreamRef.current;
    if (!local) {
      logger.warn("[VideoCall] recording: sin stream local");
      return;
    }
    const remote = remoteStreamRef.current;
    const combined = new MediaStream([
      ...local.getTracks(),
      ...(remote?.getTracks() ?? []),
    ]);

    recordingChunksRef.current = [];
    const mimeType = pickWebmMimeType();
    let recorder: MediaRecorder;
    try {
      recorder = MediaRecorder.isTypeSupported(mimeType)
        ? new MediaRecorder(combined, { mimeType })
        : new MediaRecorder(combined);
    } catch (e) {
      logger.warn("[VideoCall] MediaRecorder no disponible", e);
      return;
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data?.size > 0) {
        recordingChunksRef.current.push(ev.data);
      }
    };

    recorder.onerror = (ev) => {
      logger.error("[VideoCall] MediaRecorder error", ev);
    };

    recorder.onstop = () => {
      const chunks = recordingChunksRef.current;
      recordingChunksRef.current = [];
      const blobType = recorder.mimeType || "video/webm";
      const blob = new Blob(chunks, { type: blobType });

      if (mountedRef.current && typeof document !== "undefined") {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `heydoctor-call-${consultationId}-${Date.now()}.webm`;
        a.rel = "noopener";
        a.click();
        URL.revokeObjectURL(url);
      }
      mediaRecorderRef.current = null;
      if (mountedRef.current) {
        setIsRecording(false);
      }
    };

    mediaRecorderRef.current = recorder;
    recorder.start(1000);
    setIsRecording(true);
  }, [consultationId, enableCallRecording]);

  const stopRecordingInternal = useCallback(() => {
    if (!enableCallRecording) return;
    stopMediaRecorderIfActive();
  }, [enableCallRecording, stopMediaRecorderIfActive]);

  useImperativeHandle(
    ref,
    () => ({
      startRecording: () => {
        if (!enableCallRecording) return;
        startRecordingInternal();
      },
      stopRecording: () => {
        if (!enableCallRecording) return;
        stopRecordingInternal();
      },
    }),
    [enableCallRecording, startRecordingInternal, stopRecordingInternal]
  );

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setMediaReady(false);
    void (async () => {
      try {
        await startCall();
        if (!cancelled) {
          setMediaReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "No se pudo acceder a cámara o micrófono"
          );
        }
      }
    })();
    return () => {
      cancelled = true;
      endCall();
    };
    // Solo reiniciar sesión cuando cambia la consulta.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startCall/endCall dependen de muchos refs internos del hook
  }, [consultationId]);

  /**
   * Scroll del documento bloqueado mientras la llamada está activa (capa fixed).
   */
  useEffect(() => {
    if (typeof document === "undefined" || !mediaReady) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mediaReady]);

  /**
   * `--app-vh` como fallback junto a `100dvh` (Safari iOS, barras dinámicas).
   */
  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = document.documentElement;
    const previous = root.style.getPropertyValue("--app-vh");

    const setVh = () => {
      root.style.setProperty("--app-vh", `${window.innerHeight}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    document.addEventListener("visibilitychange", setVh);

    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
      document.removeEventListener("visibilitychange", setVh);
      if (previous) {
        root.style.setProperty("--app-vh", previous);
      } else {
        root.style.removeProperty("--app-vh");
      }
    };
  }, []);

  useEffect(() => {
    localStreamRef.current = localStream;
    const el = localVideoRef.current;
    if (el) {
      el.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    remoteStreamRef.current = remoteStream;
    const el = remoteVideoRef.current;
    if (el) {
      el.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const hasRemoteLive = useMemo(
    () =>
      !!remoteStream &&
      remoteStream.getTracks().some((t) => t.readyState === "live"),
    [remoteStream],
  );

  const isConnectingPhase = useMemo(() => {
    if (hasRemoteLive) return false;
    if (connectionState === "connecting") return true;
    if (iceConnectionState === "checking") return true;
    if (
      remoteStream &&
      !remoteStream.getTracks().some((t) => t.readyState === "live")
    ) {
      return true;
    }
    return false;
  }, [hasRemoteLive, connectionState, iceConnectionState, remoteStream]);

  const remoteOverlayMessage = isConnectingPhase
    ? "Conectando…"
    : "Esperando al otro participante…";

  const statusPillLabel = hasRemoteLive
    ? "En llamada"
    : isConnectingPhase
      ? "Conectando"
      : "Esperando";

  const statusPillAccent = useMemo(() => {
    if (hasRemoteLive) {
      return {
        borderColor: "rgba(45, 212, 191, 0.45)",
        background: "rgba(13, 148, 136, 0.42)",
        color: "#ecfdf5",
      };
    }
    if (isConnectingPhase) {
      return {
        borderColor: "rgba(251, 191, 36, 0.55)",
        background: "rgba(146, 64, 14, 0.38)",
        color: "#fffbeb",
      };
    }
    return {
      borderColor: "rgba(148, 163, 184, 0.4)",
      background: "rgba(30, 41, 59, 0.75)",
      color: "#f1f5f9",
    };
  }, [hasRemoteLive, isConnectingPhase]);

  const displayTitle =
    callChrome.title?.trim() ||
    (peerDisplayName?.trim()
      ? `Teleconsulta · ${peerDisplayName.trim()}`
      : "Teleconsulta");

  useEffect(() => {
    const hasRemote =
      !!remoteStream &&
      remoteStream.getTracks().some((t) => t.readyState === "live");
    const inCall = connectionState === "connected" && hasRemote && !error;
    if (inCall && !prevInCallRef.current) {
      safeVibrate([35, 40, 35]);
    } else if (
      !inCall &&
      prevInCallRef.current &&
      (connectionState === "disconnected" ||
        connectionState === "failed" ||
        iceConnectionState === "disconnected" ||
        iceConnectionState === "failed")
    ) {
      safeVibrate(55);
    }
    prevInCallRef.current = inCall;
  }, [connectionState, iceConnectionState, remoteStream, error]);

  useEffect(() => {
    if (!mediaReady) {
      clearControlsHideTimer();
      return;
    }
    showControlsWithAutoHide();
    return () => {
      clearControlsHideTimer();
    };
  }, [
    consultationId,
    mediaReady,
    showControlsWithAutoHide,
    clearControlsHideTimer,
  ]);

  useEffect(() => {
    if (!isMobile || !mediaReady || typeof document === "undefined") {
      return;
    }
    if (typeof window === "undefined") {
      return;
    }
    const node = mobileShellRef.current;
    if (!node?.requestFullscreen) {
      return;
    }

    let cancelled = false;
    const tid = window.setTimeout(() => {
      if (cancelled) return;
      void (async () => {
        try {
          if (document.fullscreenElement == null) {
            await node.requestFullscreen({ navigationUI: "hide" });
          }
        } catch {
          /* sin gesto o política del navegador */
        }
      })();
    }, 500);

    return () => {
      cancelled = true;
      window.clearTimeout(tid);
      if (document.fullscreenElement === node) {
        void document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [isMobile, mediaReady, consultationId]);

  useEffect(() => {
    return () => {
      clearControlsHideTimer();
      if (typeof document === "undefined") return;
      const nodes = [mobileShellRef.current].filter(Boolean) as HTMLDivElement[];
      const fs = document.fullscreenElement;
      if (fs && nodes.includes(fs as HTMLDivElement)) {
        void document.exitFullscreen?.().catch(() => {});
      }
    };
  }, [clearControlsHideTimer]);

  const toggleMic = () => {
    if (mediaReady) showControlsWithAutoHide();
    const stream = localStream;
    const audio = stream?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMicOn(audio.enabled);
    }
  };

  const toggleCam = () => {
    if (mediaReady) showControlsWithAutoHide();
    const stream = localStream;
    const video = stream?.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setCamOn(video.enabled);
    }
  };

  const handleEnd = () => {
    clearControlsHideTimer();
    stopMediaRecorderIfActive();
    endCall();
    onEndCall();
  };

  const handleSurfaceTap = useCallback(() => {
    if (mediaReady) {
      showControlsWithAutoHide();
    }
  }, [mediaReady, showControlsWithAutoHide]);

  const handleToggleScreenShare = useCallback(() => {
    if (!canShareScreen) return;
    if (mediaReady) showControlsWithAutoHide();
    if (screenSharing) {
      void stopScreenShare();
    } else {
      void startScreenShare();
    }
  }, [
    canShareScreen,
    mediaReady,
    screenSharing,
    showControlsWithAutoHide,
    startScreenShare,
    stopScreenShare,
  ]);

  const handleChatToggle = useCallback(() => {
    if (mediaReady) showControlsWithAutoHide();
    setChatPanelOpen((v) => !v);
  }, [mediaReady, showControlsWithAutoHide]);

  const renderDockButtons = () => (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleCam();
        }}
        className="videocall-dock-btn premium-tap"
        aria-pressed={!camOn}
        aria-label={camOn ? "Apagar cámara" : "Encender cámara"}
        tabIndex={controlsVisible ? 0 : -1}
        style={
          camOn
            ? { ...mobileDockBtnBase, ...dockBtnActiveStyle }
            : { ...mobileDockBtnBase, ...dockBtnMutedStyle }
        }
      >
        <span aria-hidden style={{ fontSize: 22 }}>
          {camOn ? "📷" : "📵"}
        </span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleMic();
        }}
        className="videocall-dock-btn premium-tap"
        aria-pressed={!micOn}
        aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
        tabIndex={controlsVisible ? 0 : -1}
        style={
          micOn
            ? { ...mobileDockBtnBase, ...dockBtnActiveStyle }
            : { ...mobileDockBtnBase, ...dockBtnMutedStyle }
        }
      >
        <span aria-hidden style={{ fontSize: 22 }}>
          {micOn ? "🎤" : "🔇"}
        </span>
      </button>
      {canShareScreen ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleScreenShare();
          }}
          className="videocall-dock-btn premium-tap"
          aria-pressed={screenSharing}
          aria-label={
            screenSharing ? "Dejar de compartir pantalla" : "Compartir pantalla"
          }
          tabIndex={controlsVisible ? 0 : -1}
          style={
            screenSharing
              ? { ...mobileDockBtnBase, ...screenShareActiveBtnStyle }
              : { ...mobileDockBtnBase, ...dockBtnActiveStyle }
          }
        >
          <span aria-hidden style={{ fontSize: 22 }}>
            🖥️
          </span>
        </button>
      ) : null}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleChatToggle();
        }}
        className="videocall-dock-btn premium-tap"
        aria-pressed={chatPanelOpen}
        aria-label="Chat"
        tabIndex={controlsVisible ? 0 : -1}
        style={{ ...mobileDockBtnBase, ...dockBtnActiveStyle }}
      >
        <span aria-hidden style={{ fontSize: 22 }}>
          💬
        </span>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleEnd();
        }}
        className="videocall-dock-btn premium-tap"
        aria-label="Finalizar llamada"
        tabIndex={controlsVisible ? 0 : -1}
        style={mobileHangupBtnStyle}
      >
        <span
          aria-hidden
          style={{
            fontSize: 26,
            transform: "rotate(135deg)",
            display: "inline-block",
          }}
        >
          📞
        </span>
      </button>
    </>
  );

  if (!mediaReady && error) {
    return (
      <div style={{ padding: 24, color: "#b91c1c" }}>
        <p>{error}</p>
        <button type="button" onClick={onEndCall} style={{ marginTop: 12 }}>
          Volver
        </button>
      </div>
    );
  }

  /**
   * Barra flotante tipo Meet + grid dual a pantalla completa (una sola raíz visual).
   */
  const overlayHiddenStyle: React.CSSProperties = controlsVisible
    ? { opacity: 1, pointerEvents: "auto" as const }
    : { opacity: 0, pointerEvents: "none" as const };
  const topBarTransform = controlsVisible
    ? "translateY(0)"
    : "translateY(-10px)";
  const bottomBarTransform = controlsVisible
    ? "translateY(0)"
    : "translateY(16px)";

  const localVideoEl = (
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      style={{
        ...videoCoverBase,
        transform: "translate(-50%, -50%) scaleX(-1)",
      }}
    />
  );

  const remoteVideoEl = (
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      style={{
        ...videoCoverBase,
        transform: "translate(-50%, -50%)",
      }}
    />
  );

  const chatPanelEl = chatPanelOpen ? (
    <div
      style={chatSidePanelStyle}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Chat de consulta"
    >
      <p style={{ margin: 0, fontSize: 14, color: "#e2e8f0", lineHeight: 1.5 }}>
        Para escribir al paciente usa el chat en la ficha de la consulta en el
        panel.
      </p>
      <button
        type="button"
        className="premium-tap"
        onClick={() => setChatPanelOpen(false)}
        style={{
          marginTop: 16,
          padding: "10px 16px",
          borderRadius: 12,
          border: "none",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Cerrar
      </button>
    </div>
  ) : null;

  const errorBannerEl =
    error && mediaReady ? (
      <div style={mobileErrorBannerStyle} role="alert">
        {error}
      </div>
    ) : null;

  const immersiveHintEl = (
    <span
      aria-hidden
      data-immersive-hint="true"
      style={{
        ...immersiveHintStyle,
        opacity: controlsVisible ? 0 : 1,
        transitionDelay: controlsVisible ? "0ms" : "260ms",
      }}
    >
      Toca para mostrar controles
    </span>
  );

  return (
    <div
      ref={mobileShellRef}
      data-call-recording={isRecording ? "true" : "false"}
      data-call-variant="meet-immersive"
      data-controls-visible={controlsVisible ? "true" : "false"}
      style={mobileShellStyle}
      role="dialog"
      aria-label="Videollamada"
    >
      <div
        style={meetStageStyle}
        onClick={handleSurfaceTap}
        role="presentation"
      >
        <div
          style={{
            ...meetGridStyle,
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gridTemplateRows: isMobile ? "1fr 1fr" : "1fr",
          }}
        >
          <div style={meetTileStyle}>
            <div style={meetTileInnerStyle}>
              {localVideoEl}
              {!camOn ? (
                <div style={pipCameraOffOverlayStyle}>
                  <span style={pipCameraOffIconStyle} aria-hidden>
                    📷
                  </span>
                  <span style={pipCameraOffLabelStyle}>Cámara apagada</span>
                </div>
              ) : null}
            </div>
          </div>

          <div style={meetTileStyle}>
            <div style={meetTileInnerStyle}>
              {remoteVideoEl}
              {!hasRemoteLive && (
                <div style={remoteWaitingOverlayStyle}>
                  <p
                    key={remoteOverlayMessage}
                    className="videocall-remote-overlay-text call-status-enter"
                    style={remoteWaitingTextStyle}
                  >
                    {remoteOverlayMessage}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div
          style={{
            ...meetFloatingTopBarStyle,
            ...overlayHiddenStyle,
            transform: topBarTransform,
          }}
          aria-hidden={!controlsVisible}
        >
          <Link
            href={callChrome.backHref}
            style={meetBackLinkStyle}
            className="premium-tap"
          >
            ← {callChrome.backLabel}
          </Link>
          <h1 style={meetTitleStyle}>{displayTitle}</h1>
          <div style={meetTopBarRightClusterStyle}>
            <span
              key={statusPillLabel}
              style={{
                ...mobileStatusPillStyle,
                ...statusPillAccent,
              }}
              className="call-status-enter"
            >
              {statusPillLabel}
            </span>
            <div style={{ pointerEvents: "none" }}>
              <ConnectionQualityBadge
                quality={connectionQuality}
                showWhenIdle
              />
            </div>
          </div>
        </div>

        {chatPanelEl}
        {errorBannerEl}

        <div
          style={{
            ...floatingControlsDockStyle,
            ...overlayHiddenStyle,
            transform: bottomBarTransform,
          }}
          aria-hidden={!controlsVisible}
        >
          <div style={floatingControlsRowStyle}>{renderDockButtons()}</div>
        </div>

        {immersiveHintEl}
      </div>
    </div>
  );
});

VideoCall.displayName = "VideoCall";

/* ─── Estilos auxiliares (panel lateral chat, grid Meet, controles) ─── */

const chatSidePanelStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  right: 0,
  bottom: 0,
  width: "min(360px, 92vw)",
  zIndex: 20,
  padding: "max(env(safe-area-inset-top), 20px) 20px max(env(safe-area-inset-bottom), 20px)",
  boxSizing: "border-box",
  background: "rgba(11,17,32,0.94)",
  borderLeft: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
};

/** Escenario único: grid edge-to-edge bajo la barra flotante. */
const meetStageStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  touchAction: "manipulation",
  background: "#000",
};

const meetGridStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "grid",
  gap: 0,
  boxSizing: "border-box",
  width: "100%",
  height: "100%",
  minHeight: 0,
};

const meetTileStyle: React.CSSProperties = {
  position: "relative",
  minHeight: 0,
  overflow: "hidden",
  background: "#000",
};

const meetTileInnerStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "#000",
};

const meetFloatingTopBarStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 6,
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "max(env(safe-area-inset-top), 10px) 14px 12px",
  boxSizing: "border-box",
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  transition:
    "opacity 260ms ease, transform 260ms cubic-bezier(0.4, 0, 0.2, 1)",
  willChange: "opacity, transform",
};

const meetBackLinkStyle: React.CSSProperties = {
  fontFamily: '"Open Sans", Georgia, "Times New Roman", serif',
  fontSize: 15,
  fontWeight: 600,
  color: "#e2e8f0",
  textDecoration: "none",
  flexShrink: 0,
  whiteSpace: "nowrap",
  textShadow: "0 1px 6px rgba(0,0,0,0.5)",
};

const meetTitleStyle: React.CSSProperties = {
  flex: 1,
  margin: 0,
  minWidth: 0,
  fontFamily: '"Open Sans", Georgia, "Times New Roman", serif',
  fontSize: 16,
  fontWeight: 600,
  color: "#f8fafc",
  textAlign: "center",
  lineHeight: 1.3,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  textShadow: "0 1px 8px rgba(0,0,0,0.55)",
};

const meetTopBarRightClusterStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  flexShrink: 0,
};

/** Raíz única de la llamada: fullscreen viewport, por encima del resto de la app. */
const mobileShellStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100dvh",
  minHeight: "100dvh",
  maxHeight: "100dvh",
  margin: 0,
  padding: 0,
  background: "#000",
  overflow: "hidden",
  zIndex: 2147483000,
  touchAction: "manipulation",
  boxSizing: "border-box",
};

/** Recorte “cover” centrado: sin letterboxing en contenedores de cualquier ratio. */
const videoCoverBase: React.CSSProperties = {
  position: "absolute",
  left: "50%",
  top: "50%",
  width: "100%",
  height: "100%",
  minWidth: "100%",
  minHeight: "100%",
  objectFit: "cover",
  backgroundColor: "#000",
};

const remoteWaitingOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px 32px",
  background: "radial-gradient(ellipse at center, rgba(15,23,42,0.5) 0%, rgba(0,0,0,0.75) 100%)",
  pointerEvents: "none",
  transition: "opacity 380ms ease",
};

const remoteWaitingTextStyle: React.CSSProperties = {
  margin: 0,
  color: "rgba(255,255,255,0.85)",
  fontSize: 17,
  fontWeight: 600,
  letterSpacing: "0.01em",
  lineHeight: 1.45,
  textAlign: "center",
  maxWidth: 320,
  textShadow: "0 2px 12px rgba(0,0,0,0.45)",
};

const pipCameraOffOverlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  background: "linear-gradient(180deg, rgba(15,23,42,0.92) 0%, rgba(0,0,0,0.88) 100%)",
  pointerEvents: "none",
  transition: "opacity 220ms ease",
};

const pipCameraOffIconStyle: React.CSSProperties = {
  fontSize: 28,
  opacity: 0.92,
  filter: "grayscale(0.2)",
};

const pipCameraOffLabelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  color: "rgba(248,250,252,0.72)",
};

const mobileStatusPillStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.14)",
  padding: "7px 14px",
  borderRadius: 999,
  maxWidth: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
};

const mobileErrorBannerStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 220,
  left: 12,
  right: 12,
  padding: "8px 12px",
  background: "rgba(127,29,29,0.92)",
  color: "#fecaca",
  fontSize: 12,
  borderRadius: 10,
  zIndex: 6,
  textAlign: "center",
};

const floatingControlsDockStyle: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 5,
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-end",
  padding:
    "0 16px max(calc(env(safe-area-inset-bottom) + 24px), 24px)",
  pointerEvents: "none",
  background:
    "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0) 56%)",
  transition:
    "opacity 260ms ease, transform 260ms cubic-bezier(0.4, 0, 0.2, 1)",
  willChange: "opacity, transform",
};

/** Botonera inferior sin contenedor pill oscuro (solo fila de círculos). */
const floatingControlsRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  pointerEvents: "auto",
  padding: 0,
  background: "transparent",
  border: "none",
  boxShadow: "none",
};

const immersiveHintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "max(calc(env(safe-area-inset-bottom) + 120px), 128px)",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 11,
  color: "rgba(255,255,255,0.62)",
  background: "rgba(0,0,0,0.45)",
  backdropFilter: "blur(8px)",
  WebkitBackdropFilter: "blur(8px)",
  padding: "6px 14px",
  borderRadius: 999,
  zIndex: 4,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  transition: "opacity 240ms ease",
  border: "1px solid rgba(255,255,255,0.08)",
};

const mobileDockBtnBase: React.CSSProperties = {
  width: 52,
  height: 52,
  minWidth: 52,
  minHeight: 52,
  borderRadius: "50%",
  border: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  color: "#fff",
};

const dockBtnActiveStyle: React.CSSProperties = {
  background: "rgba(13, 148, 136, 0.88)",
  boxShadow: "0 2px 16px rgba(13, 148, 136, 0.38)",
};

const dockBtnMutedStyle: React.CSSProperties = {
  background: "rgba(220, 38, 38, 0.9)",
  boxShadow: "0 2px 14px rgba(220, 38, 38, 0.35)",
};

const screenShareActiveBtnStyle: React.CSSProperties = {
  background: "rgba(37, 99, 235, 0.88)",
  boxShadow: "0 0 0 2px rgba(96, 165, 250, 0.42)",
};

const mobileHangupBtnStyle: React.CSSProperties = {
  ...mobileDockBtnBase,
  width: 56,
  height: 56,
  minWidth: 56,
  minHeight: 56,
  background: "linear-gradient(180deg, #fb7185 0%, #dc2626 100%)",
  boxShadow: "0 8px 24px rgba(220,38,38,0.48)",
};
