import { apiGet } from "../api-client";

export type WebrtcMetricsSummary = {
  consultationId: string;
  sampleCount: number;
  averages: {
    rttMs: number | null;
    packetLossRatio: number | null;
    outboundBitrateBps: number | null;
  };
  qualityAggregate: "good" | "weak" | "poor" | "insufficient_data";
  trends: Array<{
    recordedAt: string;
    rttMs: number | null;
    packetLossRatio: number | null;
    outboundBitrateBps: number | null;
    qualityPoint: string;
  }>;
};

export function fetchWebrtcMetricsSummary(
  consultationId: string
): Promise<WebrtcMetricsSummary> {
  const q = new URLSearchParams({ consultationId });
  return apiGet<WebrtcMetricsSummary>(
    `/webrtc/metrics/summary?${q.toString()}`
  );
}
