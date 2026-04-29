"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
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
      window.clearTimeout(controlsHideTimerRef.current);
      controlsHideTimerRef.current = null;
    }
  }, []);

  const showControlsWithAutoHide = useCallback(() => {
    setControlsVisible(true);
    clearControlsHideTimer();
    controlsHideTimerRef.current = window.setTimeout(() => {
      controlsHideTimerRef.current = null;
      setControlsVisible(false);
    }, 2500);
  }, [clearControlsHideTimer]);

  const clearControlsHideTimer = useCallback(() => {
    if (controlsHideTimerRef.current !== null) {
      window.clearTimeout(controlsHideTimerRef.current);
      controlsHideTimerRef.current = null;
    }
  }, []);

  const showControlsWithAutoHide = useCallback(() => {
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

  const canShareScreen = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return typeof navigator.mediaDevices?.getDisplayMedia === 'function';
  }, []);

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

  const callStatusLabel = useMemo(() => {
    if (error) {
      return "Esperando al otro participante…";
    }
    if (!localStream) {
      return "Esperando al otro participante…";
    }
    const hasRemote =
      !!remoteStream &&
      remoteStream.getTracks().some((t) => t.readyState === "live");
    if (connectionState === "connected" && hasRemote) {
      return "Paciente conectado";
    }
    return "Esperando al otro participante…";
  }, [localStream, remoteStream, connectionState, error]);

  const hasRemoteLive = useMemo(
    () =>
      !!remoteStream &&
      remoteStream.getTracks().some((t) => t.readyState === "live"),
    [remoteStream],
  );

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
      if (
        typeof document !== "undefined" &&
        mobileShellRef.current &&
        document.fullscreenElement === mobileShellRef.current
      ) {
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
   * Meet / WhatsApp: capa fija única; vídeos en grid (desktop) o remoto + PiP (móvil).
   */
  const overlayHiddenStyle: React.CSSProperties = controlsVisible
    ? { opacity: 1, pointerEvents: "auto" as const }
    : { opacity: 0, pointerEvents: "none" as const };
  const topBarTransform = controlsVisible
    ? "translateY(0)"
    : "translateY(-8px)";
  const bottomBarTransform = controlsVisible
    ? "translateY(0)"
    : "translateY(12px)";

  const localVideoEl = (
    <video
      ref={localVideoRef}
      autoPlay
      playsInline
      muted
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        transform: "scaleX(-1)",
      }}
    />
  );

  const remoteVideoEl = (
    <video
      ref={remoteVideoRef}
      autoPlay
      playsInline
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        background: "#000",
      }}
    />
  );

  const renderCallLayout = () => (
    <div
      ref={mobileShellRef}
      data-call-recording={isRecording ? "true" : "false"}
      data-call-variant={isMobile ? "mobile" : "desktop-meet"}
      data-controls-visible={controlsVisible ? "true" : "false"}
      style={mobileShellStyle}
      role="dialog"
      aria-label="Videollamada"
    >
      {isMobile ? (
        <>
          <div
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
            onClick={handleSurfaceTap}
            role="presentation"
          >
            {remoteVideoEl}
          </div>
          <div style={mobileSelfViewStyle} onClick={handleSurfaceTap}>
            {localVideoEl}
          </div>
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
            padding:
              "max(env(safe-area-inset-top), 12px) max(env(safe-area-inset-right), 12px) max(env(safe-area-inset-bottom), 88px) max(env(safe-area-inset-left), 12px)",
            boxSizing: "border-box",
          }}
          onClick={handleSurfaceTap}
          role="presentation"
        >
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "#000",
              minHeight: 0,
            }}
          >
            {localVideoEl}
          </div>
          <div
            style={{
              position: "relative",
              borderRadius: 12,
              overflow: "hidden",
              background: "#000",
              minHeight: 0,
            }}
          >
            {remoteVideoEl}
            {!hasRemoteLive && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: 15,
                  fontWeight: 500,
                  background: "#0f172a",
                  pointerEvents: "none",
                }}
              >
                Esperando…
              </div>
            )}
          </div>
        </div>
      )}

      {chatPanelOpen ? (
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
              borderRadius: 10,
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
      ) : null}

      <div
        style={{
          ...mobileTopBarStyle,
          ...overlayHiddenStyle,
          transform: topBarTransform,
        }}
        aria-hidden={!controlsVisible}
      >
        <span style={mobileStatusPillStyle}>
          <span key={callStatusLabel} className="call-status-enter inline-block">
            {callStatusLabel}
          </span>
        </span>
        <div style={{ pointerEvents: "none" }}>
          <ConnectionQualityBadge quality={connectionQuality} showWhenIdle />
        </div>
      </div>

      {error && mediaReady && (
        <div style={mobileErrorBannerStyle} role="alert">
          {error}
        </div>
      )}

      <div
        style={{
          ...mobileControlsBarStyle,
          ...overlayHiddenStyle,
          transform: bottomBarTransform,
        }}
        aria-hidden={!controlsVisible}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleCam();
          }}
          className="premium-tap"
          aria-pressed={!camOn}
          aria-label={camOn ? "Apagar cámara" : "Encender cámara"}
          tabIndex={controlsVisible ? 0 : -1}
          style={
            camOn
              ? mobileCircleBtnStyle
              : { ...mobileCircleBtnStyle, ...mobileCircleBtnOffStyle }
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
          className="premium-tap"
          aria-pressed={!micOn}
          aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
          tabIndex={controlsVisible ? 0 : -1}
          style={
            micOn
              ? mobileCircleBtnStyle
              : { ...mobileCircleBtnStyle, ...mobileCircleBtnOffStyle }
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
            className="premium-tap"
            aria-pressed={screenSharing}
            aria-label={
              screenSharing ? "Dejar de compartir pantalla" : "Compartir pantalla"
            }
            tabIndex={controlsVisible ? 0 : -1}
            style={
              screenSharing
                ? { ...mobileCircleBtnStyle, background: "rgba(59,130,246,0.45)" }
                : mobileCircleBtnStyle
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
          className="premium-tap"
          aria-pressed={chatPanelOpen}
          aria-label="Chat"
          tabIndex={controlsVisible ? 0 : -1}
          style={mobileCircleBtnStyle}
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
          className="premium-tap"
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
      </div>

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
    </div>
  );

  return renderCallLayout();
});

VideoCall.displayName = "VideoCall";

/* ───────────────────────── Meet / WhatsApp layout ───────────────────────── */

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

const mobileShellStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "var(--app-vh, 100dvh)",
  minHeight: "var(--app-vh, 100dvh)",
  maxHeight: "var(--app-vh, 100dvh)",
  background: "#0b1120",
  overflow: "hidden",
  zIndex: 9999,
  touchAction: "manipulation",
};

const mobileSelfViewStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 100,
  right: 16,
  width: 96,
  height: 128,
  borderRadius: 12,
  overflow: "hidden",
  border: "2px solid rgba(255,255,255,0.35)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
  zIndex: 2,
  background: "#000",
};

const mobileTopBarStyle: React.CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  padding: "max(env(safe-area-inset-top), 12px) 12px 12px",
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)",
  zIndex: 3,
  transition: "opacity 220ms ease, transform 220ms ease",
  willChange: "opacity, transform",
};

const mobileStatusPillStyle: React.CSSProperties = {
  color: "#e2e8f0",
  fontSize: 12,
  background: "rgba(15,23,42,0.55)",
  padding: "4px 10px",
  borderRadius: 999,
  maxWidth: "60%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
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
  zIndex: 4,
  textAlign: "center",
};

const mobileControlsBarStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  flexWrap: "wrap",
  gap: 14,
  padding:
    "12px 12px max(calc(env(safe-area-inset-bottom) + 8px), 16px)",
  background:
    "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
  zIndex: 3,
  transition: "opacity 220ms ease, transform 220ms ease",
  willChange: "opacity, transform",
};

const immersiveHintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "max(calc(env(safe-area-inset-bottom) + 96px), 104px)",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: 11,
  color: "rgba(255,255,255,0.55)",
  background: "rgba(0,0,0,0.35)",
  padding: "5px 12px",
  borderRadius: 999,
  zIndex: 4,
  pointerEvents: "none",
  whiteSpace: "nowrap",
  transition: "opacity 220ms ease",
};

const mobileCircleBtnStyle: React.CSSProperties = {
  width: 56,
  height: 56,
  minWidth: 56,
  minHeight: 56,
  borderRadius: "50%",
  border: "none",
  background: "rgba(255,255,255,0.18)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  backdropFilter: "blur(6px)",
  WebkitBackdropFilter: "blur(6px)",
};

const mobileCircleBtnOffStyle: React.CSSProperties = {
  background: "rgba(220,38,38,0.85)",
};

const mobileHangupBtnStyle: React.CSSProperties = {
  ...mobileCircleBtnStyle,
  width: 58,
  height: 58,
  minWidth: 58,
  minHeight: 58,
  background: "#ef4444",
  boxShadow: "0 6px 20px rgba(239,68,68,0.45)",
};
