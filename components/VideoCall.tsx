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
import { useAuth } from "@/lib/context/AuthContext";
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
   * Invitado: no exigir sesión AuthContext ni `ensureAccessToken` antes del socket WebRTC.
   */
  guestCall?: boolean;
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
    guestCall = false,
    callChrome,
  },
  ref
) {
  const { user, loading } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const mountedRef = useRef(true);

  const isMobile = useIsMobile();
  const mobileShellRef = useRef<HTMLDivElement>(null);
  const prevInCallRef = useRef(false);

  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [chatPanelOpen, setChatPanelOpen] = useState(false);

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
    guestCall,
    onError: (message) => setError(message),
  });

  useEffect(() => {
    let cancelled = false;
    setError(null);
    setMediaReady(false);

    if (!guestCall) {
      if (loading) {
        return () => {
          cancelled = true;
          endCall();
        };
      }
      if (!user) {
        return () => {
          cancelled = true;
          endCall();
        };
      }
    }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- startCall/endCall dependen de muchos refs internos del hook
  }, [consultationId, guestCall, loading, user]);

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
    ? "Conectando..."
    : "Esperando al otro participante...";

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
      if (typeof document === "undefined") return;
      const nodes = [mobileShellRef.current].filter(Boolean) as HTMLDivElement[];
      const fs = document.fullscreenElement;
      if (fs && nodes.includes(fs as HTMLDivElement)) {
        void document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  const toggleMic = () => {
    const stream = localStream;
    const audio = stream?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMicOn(audio.enabled);
    }
  };

  const toggleCam = () => {
    const stream = localStream;
    const video = stream?.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setCamOn(video.enabled);
    }
  };

  const handleEnd = () => {
    stopMediaRecorderIfActive();
    endCall();
    onEndCall();
  };

  const handleToggleScreenShare = useCallback(() => {
    if (!canShareScreen) return;
    if (screenSharing) {
      void stopScreenShare();
    } else {
      void startScreenShare();
    }
  }, [canShareScreen, screenSharing, startScreenShare, stopScreenShare]);

  const handleChatToggle = useCallback(() => {
    setChatPanelOpen((v) => !v);
  }, []);

  const dockBtnClass =
    "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md shrink-0 premium-tap";

  if (!guestCall && loading) {
    return null;
  }
  if (!guestCall && !user) {
    return null;
  }

  if (!mediaReady && !error) {
    return (
      <div
        className="fixed inset-0 z-[2147483000] flex items-center justify-center bg-[#0B0F14] text-gray-400 overflow-hidden"
        aria-busy="true"
      >
        <p className="m-0">Preparando…</p>
      </div>
    );
  }

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
      <div
        className="absolute left-3 right-3 top-[max(env(safe-area-inset-top),68px)] z-[7] rounded-lg bg-red-900/90 px-3 py-2 text-center text-xs text-red-100"
        role="alert"
      >
        {error}
      </div>
    ) : null;

  const videoCornerLabelClass =
    "pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/60 px-3 py-1 text-sm font-medium text-white";

  return (
    <div
      ref={mobileShellRef}
      data-call-recording={isRecording ? "true" : "false"}
      data-call-variant="structured-fullscreen"
      className="fixed inset-0 z-[2147483000] flex flex-col overflow-hidden bg-[#0B0F14]"
      role="dialog"
      aria-label="Videollamada"
      style={{
        height: "100dvh",
        minHeight: "100dvh",
        maxHeight: "100dvh",
        width: "100vw",
        touchAction: "manipulation",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 pt-[max(env(safe-area-inset-top),12px)]">
        <Link
          href={callChrome.backHref}
          className="premium-tap shrink-0 text-[15px] font-semibold text-emerald-600 no-underline"
        >
          ← {callChrome.backLabel}
        </Link>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          <h1 className="m-0 min-w-0 truncate text-right text-[15px] font-semibold text-emerald-600">
            {displayTitle}
          </h1>
          <div className="pointer-events-none shrink-0">
            <ConnectionQualityBadge
              quality={connectionQuality}
              showWhenIdle
            />
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:flex-row">
          <div className="relative min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover [transform:scaleX(-1)]"
            />
            <span className={videoCornerLabelClass}>Tú</span>
            {!camOn ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-gradient-to-b from-slate-900/90 to-black/90">
                <span className="text-[28px] opacity-90" aria-hidden>
                  📷
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-200/70">
                  Cámara apagada
                </span>
              </div>
            ) : null}
          </div>

          <div className="relative flex min-h-0 flex-1 overflow-hidden rounded-2xl bg-black">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-cover"
            />
            {!hasRemoteLive ? (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-8 text-center text-gray-400">
                <p
                  key={remoteOverlayMessage}
                  className="call-status-enter videocall-remote-overlay-text m-0 text-base font-medium"
                >
                  {remoteOverlayMessage}
                </p>
              </div>
            ) : null}
            <span className={videoCornerLabelClass}>Remoto</span>
          </div>
        </div>

        {chatPanelEl}
        {errorBannerEl}

        <div className="pointer-events-none absolute bottom-6 left-1/2 z-[8] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center rounded-full bg-[#111827]/80 px-5 py-3 shadow-lg backdrop-blur-md">
          <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleCam();
              }}
              className={`${dockBtnClass} ${camOn ? "bg-emerald-500" : "bg-gray-500"}`}
              aria-pressed={!camOn}
              aria-label={camOn ? "Apagar cámara" : "Encender cámara"}
            >
              <span aria-hidden className="text-[22px]">
                {camOn ? "📷" : "📵"}
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleMic();
              }}
              className={`${dockBtnClass} ${micOn ? "bg-emerald-500" : "bg-gray-500"}`}
              aria-pressed={!micOn}
              aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
            >
              <span aria-hidden className="text-[22px]">
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
                className={`${dockBtnClass} bg-emerald-500`}
                aria-pressed={screenSharing}
                aria-label={
                  screenSharing
                    ? "Dejar de compartir pantalla"
                    : "Compartir pantalla"
                }
              >
                <span aria-hidden className="text-[22px]">
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
              className={`${dockBtnClass} bg-emerald-500`}
              aria-pressed={chatPanelOpen}
              aria-label="Chat"
            >
              <span aria-hidden className="text-[22px]">
                💬
              </span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleEnd();
              }}
              className={`${dockBtnClass} bg-red-500`}
              aria-label="Finalizar llamada"
            >
              <span
                aria-hidden
                className="inline-block rotate-[135deg] text-[22px]"
              >
                📞
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

VideoCall.displayName = "VideoCall";

/** Panel lateral del botón chat (estilos inline compartidos). */
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
