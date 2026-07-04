"use client";

import { useEffect, useState } from "react";
import { fetchRollingMetrics, type RollingMetrics } from "@/lib/services/metrics";

type LoadingState = "loading" | "ready" | "error";

const FONT_HEADING = "Montserrat, sans-serif";

function SkeletonCard() {
  return (
    <div className="min-w-[200px] flex-1 rounded-2xl bg-hd-surface-chrome px-6 py-7 shadow-premium">
      <div className="mb-4 h-3.5 w-20 animate-pulse rounded-md bg-hd-border-subtle" />
      <div className="h-9 w-24 animate-pulse rounded-lg bg-hd-border-subtle" />
    </div>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  borderClass = "border-t-primary",
  valueClass = "text-primary",
}: {
  label: string;
  value: string;
  suffix?: string;
  borderClass?: string;
  valueClass?: string;
}) {
  return (
    <div
      className={`min-w-[200px] flex-1 rounded-2xl border-t-[3px] bg-hd-surface-chrome px-6 py-7 shadow-premium ${borderClass}`}
    >
      <div className="mb-2.5 text-[13px] font-medium uppercase tracking-wide text-primaryDark/60">
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span
          className={`text-4xl font-bold leading-none ${valueClass}`}
          style={{ fontFamily: FONT_HEADING }}
        >
          {value}
        </span>
        {suffix ? (
          <span className="text-base font-medium text-primaryDark/60">{suffix}</span>
        ) : null}
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
    <section className="mb-8">
      <h2
        className="mb-5 text-xl font-semibold text-primary"
        style={{ fontFamily: FONT_HEADING }}
      >
        Métricas de Negocio
      </h2>

      {state === "loading" && (
        <div className="flex flex-wrap gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {state === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          {error ?? "No se pudieron obtener las métricas."}
        </div>
      )}

      {state === "ready" && metrics && (
        <>
          <div className="flex flex-wrap gap-4">
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
              borderClass="border-t-primaryMid"
              valueClass="text-primaryMid"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <MetricCard
              label="Ventas (30 días)"
              value={String(metrics.sales30d)}
              borderClass="border-t-primaryDark"
              valueClass="text-primaryDark"
            />
            <MetricCard
              label="Soporte (30 días)"
              value={String(metrics.support30d)}
            />
          </div>

          <p className="mt-3.5 text-xs italic text-primaryDark/50">
            Datos agregados desde daily_metrics. Se actualizan diariamente a las
            01:00 UTC.
          </p>
        </>
      )}
    </section>
  );
}
