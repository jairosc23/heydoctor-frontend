"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
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

  const [status, setStatus] = useState<string>("Preparando cámara…");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  /**
   * `isFullscreen` activa el layout fullscreen (mismo estilo que móvil) en
   * cualquier breakpoint. En móvil el layout ya es fullscreen por defecto.
   *
   * `controlsVisible` controla la visibilidad de los overlays flotantes en
   * cualquier modo fullscreen (móvil o desktop): tap simple lo alterna para
   * crear modo inmersivo tipo Meet/WhatsApp. Las transiciones se hacen con
   * opacity + transform en CSS, no desmontando los nodos (UX más fluida).
   */
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

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
    startCall,
    endCall,
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
   * En móvil bloqueamos el scroll del documento mientras la videollamada está
   * activa (el layout es fullscreen `position: fixed`). Restauramos al
   * desmontar para no afectar al resto del panel.
   */
  useEffect(() => {
    if (!isMobile || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isMobile]);

  /**
   * Fallback robusto para Safari iOS < 15.4 (sin soporte de `dvh`) y para
   * recalcular tras rotación / aparición del teclado virtual: actualiza la
   * variable CSS `--app-vh` con `window.innerHeight` real. El layout móvil
   * usa `var(--app-vh, 100dvh)` con fallback final a `100vh`.
   */
  useEffect(() => {
    if (!isMobile || typeof window === "undefined") return;

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
  }, [isMobile]);

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

  useEffect(() => {
    if (error) {
      return;
    }
    if (!localStream) {
      setStatus("Preparando cámara…");
      return;
    }
    const hasRemote =
      !!remoteStream && remoteStream.getTracks().some((t) => t.readyState === "live");
    if (connectionState === "connected" && hasRemote) {
      setStatus("En llamada");
      return;
    }
    if (
      connectionState === "connecting" ||
      iceConnectionState === "checking" ||
      iceConnectionState === "connected"
    ) {
      if (!hasRemote) {
        setStatus("Conectando medios…");
        return;
      }
    }
    if (iceConnectionState === "disconnected" || connectionState === "disconnected") {
      setStatus("Conexión inestable…");
      return;
    }
    setStatus("Esperando participante…");
  }, [
    localStream,
    remoteStream,
    connectionState,
    iceConnectionState,
    error,
  ]);

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
    if (!mediaReady || !(isMobile || isFullscreen)) {
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
    isMobile,
    isFullscreen,
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
    if (isMobile || isFullscreen) showControlsWithAutoHide();
    const stream = localStream;
    const audio = stream?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMicOn(audio.enabled);
    }
  };

  const toggleCam = () => {
    if (isMobile || isFullscreen) showControlsWithAutoHide();
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

  /**
   * Gesture handling sobre el video remoto en modo fullscreen:
   * - **Tap/click simple** → alterna la visibilidad de los overlays
   *   (modo inmersivo: vista limpia ↔ vista con controles).
   * - **Doble tap/click** → alterna fullscreen (entrar/salir).
   *
   * Usamos un `setTimeout` con ventana de 260 ms: el primer tap arma el
   * timer, un segundo tap dentro de la ventana lo cancela y dispara el
   * fullscreen toggle. La latencia perceptible (~260 ms) es estándar y
   * preferible a disparar simple+doble en cascada.
   */
  const tapTimeoutRef = useRef<number | null>(null);
  const clearTapTimeout = () => {
    if (tapTimeoutRef.current !== null) {
      window.clearTimeout(tapTimeoutRef.current);
      tapTimeoutRef.current = null;
    }
  };
  useEffect(() => () => clearTapTimeout(), []);

  const handleRemoteTap = useCallback(() => {
    if (tapTimeoutRef.current !== null) {
      clearTapTimeout();
      setIsFullscreen((v) => !v);
      return;
    }
    tapTimeoutRef.current = window.setTimeout(() => {
      tapTimeoutRef.current = null;
      if (isMobile || isFullscreen) {
        showControlsWithAutoHide();
      } else {
        setControlsVisible((v) => !v);
      }
    }, 260);
  }, [isFullscreen, isMobile, showControlsWithAutoHide]);

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
   * Layout fullscreen reutilizable: se usa siempre en móvil y también en
   * desktop cuando `isFullscreen` está activo. Los overlays se mantienen
   * montados y se ocultan vía opacity/transform/pointer-events para que la
   * transición sea fluida (220 ms ease) en cualquier breakpoint.
   */
  const overlayHiddenStyle: React.CSSProperties = controlsVisible
    ? { opacity: 1, pointerEvents: "auto" }
    : { opacity: 0, pointerEvents: "none" };
  const topBarTransform = controlsVisible
    ? "translateY(0)"
    : "translateY(-8px)";
  const bottomBarTransform = controlsVisible
    ? "translateY(0)"
    : "translateY(12px)";

  const renderFullscreenLayout = () => (
    <div
      ref={mobileShellRef}
      data-call-recording={isRecording ? "true" : "false"}
      data-call-variant={isMobile ? "mobile" : "desktop-fullscreen"}
      data-controls-visible={controlsVisible ? "true" : "false"}
      style={mobileShellStyle}
      role="dialog"
      aria-label="Videollamada"
    >
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        onClick={handleRemoteTap}
        style={mobileRemoteVideoStyle}
      />

      <div style={mobileSelfViewStyle}>
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: "scaleX(-1)",
          }}
        />
      </div>

      <div
        style={{
          ...mobileTopBarStyle,
          ...overlayHiddenStyle,
          transform: topBarTransform,
        }}
        aria-hidden={!controlsVisible}
      >
        <span style={mobileStatusPillStyle}>{status}</span>
        <ConnectionQualityBadge quality={connectionQuality} showWhenIdle />
        {!isMobile && (
          <button
            type="button"
            onClick={() => {
              showControlsWithAutoHide();
              setIsFullscreen(false);
            }}
            aria-label="Salir de pantalla completa"
            style={fullscreenCloseBtnStyle}
          >
            <span aria-hidden style={{ fontSize: 16, fontWeight: 700 }}>
              ×
            </span>
          </button>
        )}
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
          onClick={toggleMic}
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
        <button
          type="button"
          onClick={toggleCam}
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
        {!isMobile && (
          <button
            type="button"
            onClick={() => {
              showControlsWithAutoHide();
              setIsFullscreen(false);
            }}
            aria-label="Salir de pantalla completa"
            tabIndex={controlsVisible ? 0 : -1}
            style={mobileCircleBtnStyle}
          >
            <span aria-hidden style={{ fontSize: 22 }}>
              ⤡
            </span>
          </button>
        )}
        <button
          type="button"
          onClick={handleEnd}
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
          /**
           * Pequeño delay al aparecer para no competir con la transición
           * de salida de los overlays; al volver, el hint debe desvanecer
           * inmediatamente.
           */
          transitionDelay: controlsVisible ? "0ms" : "260ms",
        }}
      >
        Toca para mostrar controles · doble toque: pantalla completa
      </span>
    </div>
  );

  if (isMobile || isFullscreen) {
    return renderFullscreenLayout();
  }

  return (
    <div
      data-call-recording={isRecording ? "true" : "false"}
      data-call-variant="desktop"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 360,
        background: "#0f172a",
        borderRadius: 12,
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div style={{ flex: 1, position: "relative", minHeight: 200 }}>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          onDoubleClick={() => setIsFullscreen(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#000",
            cursor: "zoom-in",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            width: 140,
            maxWidth: "36%",
            aspectRatio: "4/3",
            borderRadius: 8,
            overflow: "hidden",
            border: "2px solid rgba(255,255,255,0.3)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            zIndex: 1,
          }}
        >
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transform: "scaleX(-1)",
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            color: "#e2e8f0",
            fontSize: 13,
            background: "rgba(0,0,0,0.45)",
            padding: "6px 10px",
            borderRadius: 8,
            zIndex: 2,
            maxWidth: "min(280px, 55%)",
          }}
        >
          {status}
        </div>
        <div
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            zIndex: 2,
            maxWidth: "min(220px, 52%)",
            pointerEvents: "none",
          }}
        >
          <ConnectionQualityBadge quality={connectionQuality} showWhenIdle />
        </div>
      </div>

      {error && mediaReady && (
        <div
          style={{
            padding: "8px 12px",
            background: "#7f1d1d",
            color: "#fecaca",
            fontSize: 12,
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          justifyContent: "center",
          alignItems: "center",
          padding: 14,
          background: "rgba(15,23,42,0.95)",
          borderTop: "1px solid #334155",
        }}
      >
        <button
          type="button"
          onClick={toggleMic}
          style={btnStyle}
          aria-pressed={!micOn}
        >
          {micOn ? "Silenciar" : "Activar mic"}
        </button>
        <button
          type="button"
          onClick={toggleCam}
          style={btnStyle}
          aria-pressed={!camOn}
        >
          {camOn ? "Apagar cámara" : "Encender cámara"}
        </button>
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          aria-label="Activar pantalla completa"
          style={btnStyle}
        >
          ⛶ Pantalla completa
        </button>
        <button
          type="button"
          onClick={handleEnd}
          style={{
            ...btnStyle,
            background: "#dc2626",
            color: "#fff",
            borderColor: "#b91c1c",
          }}
        >
          Finalizar
        </button>
      </div>
    </div>
  );
});

VideoCall.displayName = "VideoCall";

const btnStyle: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 8,
  border: "1px solid #475569",
  background: "#1e293b",
  color: "#f1f5f9",
  cursor: "pointer",
  fontSize: 13,
};

/* ───────────────────────── Mobile fullscreen layout ───────────────────────── */

const mobileShellStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  /**
   * Cascada de fallbacks: en navegadores que no entiendan `var()` cae a `100vh`
   * (Safari iOS < 15.4). En navegadores modernos `--app-vh` (recalculada por
   * el efecto de `VideoCall`) gana, y si no se ha establecido todavía usan
   * `100dvh`. El navegador descarta los valores que no entiende.
   */
  height: "100vh",
  minHeight: "var(--app-vh, 100dvh)",
  maxHeight: "var(--app-vh, 100dvh)",
  background: "#000",
  overflow: "hidden",
  zIndex: 50,
  touchAction: "manipulation",
};

const mobileRemoteVideoStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  background: "#000",
};

const mobileSelfViewStyle: React.CSSProperties = {
  position: "absolute",
  bottom: 110,
  right: 12,
  width: 96,
  height: 128,
  borderRadius: 14,
  overflow: "hidden",
  border: "2px solid rgba(255,255,255,0.35)",
  boxShadow: "0 6px 24px rgba(0,0,0,0.55)",
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
  padding: "max(env(safe-area-inset-top), 12px) 12px 8px",
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)",
  zIndex: 3,
  /**
   * Transición de modo inmersivo. `pointer-events` se sobrescribe inline
   * cuando los controles están ocultos. La barra siempre permite que el
   * tap pase al video debajo (los botones internos sí reciben pointer).
   */
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
  gap: 18,
  padding: "16px 16px max(env(safe-area-inset-bottom), 16px)",
  background:
    "linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0) 100%)",
  zIndex: 3,
  transition: "opacity 220ms ease, transform 220ms ease",
  willChange: "opacity, transform",
};

const immersiveHintStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "max(env(safe-area-inset-bottom), 16px)",
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
  width: 60,
  height: 60,
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
  width: 68,
  height: 68,
  background: "#dc2626",
  boxShadow: "0 6px 20px rgba(220,38,38,0.55)",
};

const fullscreenCloseBtnStyle: React.CSSProperties = {
  pointerEvents: "auto",
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "none",
  background: "rgba(15,23,42,0.7)",
  color: "#fff",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  marginLeft: "auto",
};
