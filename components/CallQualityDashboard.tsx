"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  fetchWebrtcMetricsSummary,
  type WebrtcMetricsSummary,
} from "@/lib/services/webrtc-metrics";

const QUALITY_LABEL: Record<string, string> = {
  good: "Buena",
  weak: "Regular",
  poor: "Mala",
  insufficient_data: "Sin datos",
};

function formatBitrate(bps: number | null): string {
  if (bps == null || !Number.isFinite(bps)) return "—";
  if (bps >= 1_000_000) return `${(bps / 1_000_000).toFixed(2)} Mb/s`;
  if (bps >= 1_000) return `${(bps / 1_000).toFixed(0)} kb/s`;
  return `${Math.round(bps)} b/s`;
}

export type CallQualityDashboardProps = {
  consultationId: string;
  /** Actualización periódica durante la sesión (ms). 0 = solo carga inicial. */
  refreshIntervalMs?: number;
  className?: string;
};

/**
 * Resumen de métricas WebRTC agregadas en backend (`webrtc_call_metrics`).
 */
export function CallQualityDashboard({
  consultationId,
  refreshIntervalMs = 30_000,
  className = "",
}: CallQualityDashboardProps) {
  const [data, setData] = useState<WebrtcMetricsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!consultationId) return;
    setError(null);
    try {
      const summary = await fetchWebrtcMetricsSummary(consultationId);
      setData(summary);
    } catch (e) {
      setData(null);
      setError(
        e instanceof Error ? e.message : "No se pudieron cargar las métricas"
      );
    } finally {
      setLoading(false);
    }
  }, [consultationId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!refreshIntervalMs || refreshIntervalMs <= 0) return;
    const t = window.setInterval(() => void load(), refreshIntervalMs);
    return () => clearInterval(t);
  }, [load, refreshIntervalMs]);

  return (
    <div
      className={className}
      style={{
        background: "#0f172a",
        color: "#e2e8f0",
        borderRadius: 12,
        padding: 16,
        fontSize: 13,
      }}
    >
      <h3 style={{ margin: "0 0 12px", fontSize: 15 }}>Calidad de llamada</h3>
      {loading && <p style={{ color: "#94a3b8", margin: 0 }}>Cargando…</p>}
      {error && (
        <p style={{ color: "#fca5a5", margin: 0, fontSize: 12 }}>{error}</p>
      )}
      {!loading && !error && data && (
        <>
          <p style={{ margin: "0 0 10px", color: "#94a3b8", fontSize: 12 }}>
            Muestras: <strong>{data.sampleCount}</strong> · Clasificación:{" "}
            <strong>
              {QUALITY_LABEL[data.qualityAggregate] ?? data.qualityAggregate}
            </strong>
          </p>
          <dl
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              margin: 0,
            }}
          >
            <dt style={{ color: "#94a3b8" }}>RTT medio</dt>
            <dd style={{ margin: 0 }}>
              {data.averages.rttMs != null
                ? `${Math.round(data.averages.rttMs)} ms`
                : "—"}
            </dd>
            <dt style={{ color: "#94a3b8" }}>Pérdida media</dt>
            <dd style={{ margin: 0 }}>
              {data.averages.packetLossRatio != null
                ? `${(data.averages.packetLossRatio * 100).toFixed(2)} %`
                : "—"}
            </dd>
            <dt style={{ color: "#94a3b8" }}>Bitrate medio</dt>
            <dd style={{ margin: 0 }}>
              {formatBitrate(data.averages.outboundBitrateBps)}
            </dd>
          </dl>
          {data.trends.length > 1 && (
            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  fontSize: 11,
                  color: "#94a3b8",
                  marginBottom: 6,
                }}
              >
                Tendencia (RTT, últimas muestras)
              </div>
              <MiniTrend
                points={data.trends
                  .filter((p) => p.rttMs != null)
                  .map((p) => p.rttMs as number)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

function MiniTrend({ points }: { points: number[] }) {
  if (points.length < 2) return null;
  const w = 220;
  const h = 48;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const span = Math.max(max - min, 1);
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / span) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: "block", maxWidth: "100%" }}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke="#38bdf8"
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
