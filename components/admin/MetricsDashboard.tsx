"use client";

import { useEffect, useState } from "react";
import { fetchRollingMetrics, type RollingMetrics } from "@/lib/services/metrics";

type LoadingState = "loading" | "ready" | "error";

const BRAND = "#078a92";
const BRAND_LIGHT = "#dff7f8";
const CARD_BG = "#ffffff";
const MUTED = "#64748b";

function SkeletonCard() {
  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 14,
        padding: "28px 24px",
        minWidth: 200,
        flex: "1 1 0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <div
        style={{
          width: 80,
          height: 14,
          borderRadius: 6,
          background: "#e2e8f0",
          marginBottom: 18,
        }}
      />
      <div
        style={{
          width: 100,
          height: 36,
          borderRadius: 8,
          background: "#e2e8f0",
        }}
      />
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  accent = BRAND,
}: {
  label: string;
  value: string;
  suffix?: string;
  accent?: string;
}) {
  return (
    <div
      style={{
        background: CARD_BG,
        borderRadius: 14,
        padding: "28px 24px",
        minWidth: 200,
        flex: "1 1 0",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div
        style={{
          fontSize: 13,
          color: MUTED,
          fontWeight: 500,
          marginBottom: 10,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            fontFamily: "Montserrat, sans-serif",
            color: accent,
            lineHeight: 1.1,
          }}
        >
          {value}
        </span>
        {suffix && (
          <span style={{ fontSize: 16, color: MUTED, fontWeight: 500 }}>
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default function MetricsDashboard() {
  const [state, setState] = useState<LoadingState>("loading");
  const [metrics, setMetrics] = useState<RollingMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState("loading");
      setError(null);
      try {
        const data = await fetchRollingMetrics();
        if (!cancelled) {
          setMetrics(data);
          setState("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Error al cargar métricas"
          );
          setState("error");
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section style={{ marginBottom: 32 }}>
      <h2
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 20,
          fontWeight: 600,
          color: BRAND,
          marginBottom: 20,
        }}
      >
        Métricas de Negocio
      </h2>

      {state === "loading" && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state === "error" && (
        <div
          style={{
            background: "#fef2f2",
            border: "1px solid #fecaca",
            borderRadius: 12,
            padding: "16px 20px",
            color: "#b91c1c",
            fontSize: 14,
          }}
        >
          {error ?? "No se pudieron obtener las métricas."}
        </div>
      )}

      {state === "ready" && metrics && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <MetricCard
              label="Upgrades (7 días)"
              value={String(metrics.upgrades7d)}
            />
            <MetricCard
              label="Upgrades (30 días)"
              value={String(metrics.upgrades30d)}
            />
            <MetricCard
              label="Tasa de conversión (30d)"
              value={(metrics.conversionRate * 100).toFixed(1)}
              suffix="%"
              accent="#0ea5e9"
            />
          </div>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            <MetricCard
              label="Ventas (30 días)"
              value={String(metrics.sales30d)}
              accent="#8b5cf6"
            />
            <MetricCard
              label="Soporte (30 días)"
              value={String(metrics.support30d)}
              accent="#f59e0b"
            />
          </div>

          <p
            style={{
              fontSize: 12,
              color: "#94a3b8",
              marginTop: 14,
              fontStyle: "italic",
            }}
          >
            Datos agregados desde daily_metrics. Se actualizan diariamente a las
            01:00 UTC.
          </p>
        </>
      )}
    </section>
  );
}
