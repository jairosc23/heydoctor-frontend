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

  const [status, setStatus] = useState<string>("Preparando cámara…");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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

  if (isMobile) {
    return (
      <div
        data-call-recording={isRecording ? "true" : "false"}
        data-call-variant="mobile"
        style={mobileShellStyle}
        role="dialog"
        aria-label="Videollamada con paciente"
      >
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
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

        <div style={mobileTopBarStyle}>
          <span style={mobileStatusPillStyle}>{status}</span>
          <ConnectionQualityBadge quality={connectionQuality} showWhenIdle />
        </div>

        {error && mediaReady && (
          <div style={mobileErrorBannerStyle} role="alert">
            {error}
          </div>
        )}

        <div style={mobileControlsBarStyle}>
          <button
            type="button"
            onClick={toggleMic}
            aria-pressed={!micOn}
            aria-label={micOn ? "Silenciar micrófono" : "Activar micrófono"}
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
            onClick={handleEnd}
            aria-label="Finalizar llamada"
            style={mobileHangupBtnStyle}
          >
            <span aria-hidden style={{ fontSize: 26, transform: "rotate(135deg)", display: "inline-block" }}>
              📞
            </span>
          </button>
        </div>
      </div>
    );
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
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            background: "#000",
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
  height: "100dvh",
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
  pointerEvents: "none",
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
