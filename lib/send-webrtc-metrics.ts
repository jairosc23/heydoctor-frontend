import { fetchWithAuth } from "./heydoctor-api";
import { fetchWithGuestAuth } from "./fetch-with-guest-auth";

export type WebrtcResilienceEventType =
  | "reconnect_attempts"
  | "reconnect_success"
  | "ice_restart_count"
  | "media_recovery_failures";

export type SendCallMetricsInput = {
  backendOrigin: string;
  consultationId: string;
  /** Guest Credential Channel — omit Staff cookies / refresh. */
  guestChannel?: boolean;
  rtt?: number;
  packetsLost?: number;
  bitrate?: number;
  jitter?: number;
  packetLossRatio?: number;
  /** W2 — periodic samples include PC/ICE state for ops correlation. */
  iceConnectionState?: string;
  connectionState?: string;
  signalingState?: string;
  eventType?: WebrtcResilienceEventType;
  eventCount?: number;
  clientTraceId?: string;
  resilienceReason?: string;
};

/**
 * POST /api/webrtc/metrics — telemetry only (no media, no SDP).
 */
export async function sendCallMetrics(
  input: SendCallMetricsInput,
): Promise<void> {
  const {
    backendOrigin,
    consultationId,
    guestChannel = false,
    rtt,
    packetsLost,
    bitrate,
    jitter,
    packetLossRatio,
    iceConnectionState,
    connectionState,
    signalingState,
    eventType,
    eventCount,
    clientTraceId,
    resilienceReason,
  } = input;

  const url = new URL(
    "/api/webrtc/metrics",
    backendOrigin.replace(/\/$/, ""),
  ).toString();

  const body: Record<string, unknown> = { consultationId };
  if (rtt !== undefined) body.rtt = rtt;
  if (packetsLost !== undefined) body.packetsLost = packetsLost;
  if (bitrate !== undefined) body.bitrate = bitrate;
  if (jitter !== undefined && !Number.isNaN(jitter)) body.jitter = jitter;
  if (packetLossRatio !== undefined) body.packetLossRatio = packetLossRatio;
  if (iceConnectionState) body.iceConnectionState = iceConnectionState;
  if (connectionState) body.connectionState = connectionState;
  if (signalingState) body.signalingState = signalingState;
  if (eventType) body.eventType = eventType;
  if (eventCount !== undefined) body.eventCount = eventCount;
  if (clientTraceId) body.clientTraceId = clientTraceId.slice(0, 128);
  if (resilienceReason) {
    body.resilienceReason = resilienceReason.slice(0, 64);
  }

  const res = guestChannel
    ? await fetchWithGuestAuth(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    : await fetchWithAuth(url, {
        method: "POST",
        body: JSON.stringify(body),
      });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`webrtc metrics ${res.status}: ${text.slice(0, 160)}`);
  }
}
