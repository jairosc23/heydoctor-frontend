"use client";

import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { io, type Socket } from "socket.io-client";
import { getWebrtcSignalingBaseUrl } from "@/lib/webrtc-signaling";
import { logger } from "@/lib/logger";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export type ConnectionStatus = "connected" | "reconnecting" | "disconnected";

export type VideoCallProps = {
  consultationId: string;
  authToken: string;
  onEndCall: () => void;
  /**
   * PRO / futuro: habilita grabación local vía ref (`startRecording` / `stopRecording`).
   * Por defecto false; no hay controles en UI.
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
 * WebRTC 1:1 sobre signaling Nest (`/webrtc`).
 * Quien ya está en la sala recibe `peer-joined` y envía la oferta; el recién unido responde con `answer`.
 */
export const VideoCall = forwardRef<
  VideoCallRecordingHandle,
  VideoCallProps
>(function VideoCall(
  {
    consultationId,
    authToken,
    onEndCall,
    enableCallRecording = false,
  },
  ref
) {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingRemoteIceRef = useRef<RTCIceCandidateInit[]>([]);
  const makingOfferRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingChunksRef = useRef<BlobPart[]>([]);
  const mountedRef = useRef(true);
  /** Reasignado en el efecto del socket para leer refs actuales sin dependencias obsoletas */
  const recomputeConnectionStatusRef = useRef<() => void>(() => {});

  const [status, setStatus] = useState<string>("Preparando cámara…");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

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

  const flushPendingIce = useCallback(async (pc: RTCPeerConnection) => {
    const q = pendingRemoteIceRef.current;
    pendingRemoteIceRef.current = [];
    for (const c of q) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(c));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const closePeer = useCallback(() => {
    stopMediaRecorderIfActive();
    pcRef.current?.close();
    pcRef.current = null;
    pendingRemoteIceRef.current = [];
    makingOfferRef.current = false;
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    remoteStreamRef.current = null;
    recomputeConnectionStatusRef.current();
  }, [stopMediaRecorderIfActive]);

  const stopMedia = useCallback(() => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  }, []);

  const buildPeerConnection = useCallback(
    (socket: Socket) => {
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      pc.onicecandidate = (ev) => {
        if (ev.candidate && socket.connected) {
          socket.emit("ice-candidate", {
            consultationId,
            candidate: ev.candidate.toJSON(),
          });
        }
      };

      pc.ontrack = (ev) => {
        const [stream] = ev.streams;
        if (stream) {
          remoteStreamRef.current = stream;
        }
        if (remoteVideoRef.current && stream) {
          remoteVideoRef.current.srcObject = stream;
        }
      };

      pc.onconnectionstatechange = () => {
        recomputeConnectionStatusRef.current();
        const st = pc.connectionState;
        if (st === "failed" || st === "disconnected") {
          setStatus("Conexión inestable…");
        } else if (st === "connected") {
          setStatus("En llamada");
        }
      };

      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach((track) => pc.addTrack(track, stream));
      }

      return pc;
    },
    [consultationId]
  );

  const createAndSendOffer = useCallback(
    async (socket: Socket) => {
      let pc = pcRef.current;
      if (!pc || pc.signalingState === "closed") {
        closePeer();
        pc = buildPeerConnection(socket);
      }
      if (makingOfferRef.current || pc.signalingState !== "stable") return;
      makingOfferRef.current = true;
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", {
          consultationId,
          sdp: pc.localDescription,
        });
        setStatus("Negociando…");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error al crear oferta");
      } finally {
        makingOfferRef.current = false;
      }
    },
    [buildPeerConnection, closePeer, consultationId]
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setMediaReady(true);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "No se pudo acceder a cámara o micrófono"
        );
        return;
      }

      const base = getWebrtcSignalingBaseUrl();
      const socket = io(`${base}/webrtc`, {
        path: "/socket.io",
        transports: ["websocket", "polling"],
        auth: { token: authToken },
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 800,
        reconnectionDelayMax: 5000,
      });
      socketRef.current = socket;

      recomputeConnectionStatusRef.current = () => {
        const socketOk = !!socketRef.current?.connected;
        if (!socketOk) {
          setConnectionStatus("disconnected");
          return;
        }
        const pc = pcRef.current;
        if (!pc) {
          setConnectionStatus("connected");
          return;
        }
        const st = pc.connectionState;
        if (st === "connected") {
          setConnectionStatus("connected");
        } else if (st === "connecting") {
          setConnectionStatus("reconnecting");
        } else if (st === "disconnected" || st === "failed") {
          setConnectionStatus("disconnected");
        } else if (st === "new") {
          setConnectionStatus("reconnecting");
        } else if (st === "closed") {
          setConnectionStatus("disconnected");
        } else {
          setConnectionStatus("reconnecting");
        }
      };

      const joinRoom = () => {
        closePeer();
        setStatus("Uniendo a la consulta…");
        socket.emit(
          "join-consultation",
          { consultationId },
          (ack: { ok?: boolean } | undefined) => {
            if (ack?.ok) {
              setStatus("Esperando participante…");
            }
          }
        );
      };

      socket.on("connect", () => {
        setError(null);
        setConnectionStatus("connected");
        joinRoom();
        recomputeConnectionStatusRef.current();
      });

      socket.on("connect_error", () => {
        setStatus("Reconectando señalización…");
        recomputeConnectionStatusRef.current();
      });

      socket.on("disconnect", (reason) => {
        setConnectionStatus("disconnected");
        closePeer();
        if (reason === "io server disconnect") {
          socket.connect();
        } else {
          setStatus("Desconectado; reconectando…");
        }
        recomputeConnectionStatusRef.current();
      });

      socket.on("peer-joined", () => {
        void createAndSendOffer(socket);
      });

      socket.on("offer", async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
        try {
          let pc = pcRef.current;
          if (!pc || pc.signalingState === "closed") {
            closePeer();
            pc = buildPeerConnection(socket);
          }

          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          await flushPendingIce(pc);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit("answer", {
            consultationId,
            sdp: pc.localDescription,
          });
          setStatus("Negociando…");
        } catch (e) {
          setError(e instanceof Error ? e.message : "Error con oferta entrante");
        }
      });

      socket.on(
        "answer",
        async ({ sdp }: { sdp: RTCSessionDescriptionInit }) => {
          try {
            const pc = pcRef.current;
            if (!pc) return;
            await pc.setRemoteDescription(new RTCSessionDescription(sdp));
            await flushPendingIce(pc);
            setStatus("Conectando medios…");
          } catch (e) {
            setError(
              e instanceof Error ? e.message : "Error con respuesta entrante"
            );
          }
        }
      );

      socket.on(
        "ice-candidate",
        async ({
          candidate,
        }: {
          candidate: RTCIceCandidateInit | null;
        }) => {
          if (!candidate) return;
          const pc = pcRef.current;
          if (pc?.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch {
              /* ignore */
            }
          } else {
            pendingRemoteIceRef.current.push(candidate);
          }
        }
      );

      socket.on("peer-left", () => {
        closePeer();
        setStatus("El otro participante salió");
      });

      if (socket.connected) {
        setConnectionStatus("connected");
        joinRoom();
        recomputeConnectionStatusRef.current();
      }
    })();

    return () => {
      cancelled = true;
      const s = socketRef.current;
      if (s) {
        try {
          s.emit("leave", { consultationId });
        } catch {
          /* */
        }
        s.removeAllListeners();
        s.disconnect();
        socketRef.current = null;
      }
      closePeer();
      stopMedia();
    };
  }, [
    authToken,
    consultationId,
    buildPeerConnection,
    closePeer,
    createAndSendOffer,
    flushPendingIce,
    stopMedia,
  ]);

  const toggleMic = () => {
    const stream = localStreamRef.current;
    const audio = stream?.getAudioTracks()[0];
    if (audio) {
      audio.enabled = !audio.enabled;
      setMicOn(audio.enabled);
    }
  };

  const toggleCam = () => {
    const stream = localStreamRef.current;
    const video = stream?.getVideoTracks()[0];
    if (video) {
      video.enabled = !video.enabled;
      setCamOn(video.enabled);
    }
  };

  const handleEnd = () => {
    const s = socketRef.current;
    if (s?.connected) {
      try {
        s.emit("leave", { consultationId });
      } catch {
        /* */
      }
      s.disconnect();
    }
    socketRef.current = null;
    closePeer();
    stopMedia();
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

  return (
    <div
      data-call-recording={isRecording ? "true" : "false"}
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
          }}
        >
          {status}
        </div>
        <NetworkStatusBadge status={connectionStatus} />
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

const NETWORK_BADGE: Record<
  ConnectionStatus,
  { dot: string; label: string; color: string }
> = {
  connected: { dot: "🟢", label: "Connected", color: "#22c55e" },
  reconnecting: { dot: "🟡", label: "Reconnecting", color: "#facc15" },
  disconnected: { dot: "🔴", label: "Disconnected", color: "#ef4444" },
};

function NetworkStatusBadge({ status }: { status: ConnectionStatus }) {
  const cfg = NETWORK_BADGE[status];
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "5px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        color: cfg.color,
        background: "rgba(0,0,0,0.55)",
        border: `1px solid ${cfg.color}`,
        boxShadow: "0 1px 4px rgba(0,0,0,0.35)",
      }}
    >
      <span aria-hidden>{cfg.dot}</span>
      <span>{cfg.label}</span>
    </div>
  );
}
