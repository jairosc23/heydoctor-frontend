"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type {
  SubscriptionEventRow,
  SubscriptionsMetricsResponse,
  SubscriptionsSummaryResponse,
} from "@/components/subscriptions/types";
import { fetchWithAuth } from "@/lib/heydoctor-api";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function fetchJson<T>(path: string): Promise<{ ok: boolean; status: number; body: T | null }> {
  const response = await fetchWithAuth(path, { method: "GET" });
  if (!response.ok) {
    return { ok: false, status: response.status, body: null };
  }
  return { ok: true, status: response.status, body: (await response.json()) as T };
}

function SubscriptionTimeline({
  events,
  loading,
}: {
  events: SubscriptionEventRow[];
  loading: boolean;
}) {
  if (loading) {
    return <p className="text-sm text-slate-600" role="status">Cargando timeline...</p>;
  }
  if (events.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        Introduce un UUID y pulsa Ver eventos, o revisa si no hay historia.
      </p>
    );
  }
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-900">{event.eventType}</p>
          <p className="text-xs text-slate-500">{event.createdAt}</p>
          <p className="mt-1 text-slate-700">
            {event.previousPlan ?? "-"} / {event.previousStatus ?? "-"} →{" "}
            {event.newPlan ?? "-"} / {event.newStatus ?? "-"}
          </p>
          <p className="mt-1 text-xs text-slate-500">Origen: {event.source}</p>
        </li>
      ))}
    </ol>
  );
}

export default function AdminSubscriptionsPage() {
  const [summary, setSummary] = useState<SubscriptionsSummaryResponse | null>(null);
  const [metrics, setMetrics] = useState<SubscriptionsMetricsResponse | null>(null);
  const [dashError, setDashError] = useState<string | null>(null);
  const [dashLoading, setDashLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [events, setEvents] = useState<SubscriptionEventRow[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setDashLoading(true);
    setDashError(null);
    try {
      const [summaryResponse, metricsResponse] = await Promise.all([
        fetchJson<SubscriptionsSummaryResponse>("/api/admin/subscriptions/summary"),
        fetchJson<SubscriptionsMetricsResponse>("/api/admin/subscriptions/metrics"),
      ]);
      if (!summaryResponse.ok || !metricsResponse.ok) {
        if (summaryResponse.status === 403 || metricsResponse.status === 403) {
          setDashError("No tienes permisos de administrador para ver este dashboard.");
        } else {
          setDashError(`Error cargando datos (${summaryResponse.status} / ${metricsResponse.status}).`);
        }
        setSummary(null);
        setMetrics(null);
        return;
      }
      setSummary(summaryResponse.body);
      setMetrics(metricsResponse.body);
    } catch {
      setDashError("Error de red al cargar el dashboard.");
    } finally {
      setDashLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const loadTimeline = async () => {
    const trimmed = userId.trim();
    if (!UUID_RE.test(trimmed)) {
      setTimelineError("Introduce un UUID v4 válido de usuario.");
      setEvents([]);
      return;
    }
    setTimelineLoading(true);
    setTimelineError(null);
    try {
      const response = await fetchJson<SubscriptionEventRow[]>(
        `/api/admin/subscriptions/${trimmed}/events`,
      );
      if (!response.ok) {
        setTimelineError(
          response.status === 403
            ? "Sin permisos para consultar timeline."
            : `Error ${response.status} al cargar eventos.`,
        );
        setEvents([]);
        return;
      }
      setEvents(Array.isArray(response.body) ? response.body : []);
    } catch {
      setTimelineError("Error de red al cargar timeline.");
      setEvents([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const churnPct =
    metrics == null ? "-" : `${(metrics.churnRate * 100).toFixed(1)}%`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-slate-900">Suscripciones (admin)</h1>
        <nav className="flex flex-wrap gap-3 text-sm" aria-label="Navegación de suscripciones admin">
          <Link
            href="/admin/analytics"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Analytics
          </Link>
          <Link
            href="/panel"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Panel
          </Link>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Recargar métricas
          </button>
        </nav>
      </div>

      {dashLoading && <p className="text-sm text-slate-600">Cargando resumen...</p>}

      {!dashLoading && dashError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          {dashError}
        </div>
      )}

      {!dashLoading && !dashError && summary && metrics && (
        <section className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Resumen actual
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600">Total usuarios</dt>
                <dd className="font-medium">{summary.totalUsers}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600">Usuarios PRO</dt>
                <dd className="font-medium">{summary.proUsers}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600">PRO activos</dt>
                <dd className="font-medium">{summary.activeSubscriptions}</dd>
              </div>
            </dl>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Mes actual (UTC)
            </h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600">Ingresos aprox.</dt>
                <dd className="font-medium">{metrics.monthlyRevenue}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600">Churn snapshot</dt>
                <dd className="font-medium">{churnPct}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-600">Pagos confirmados</dt>
                <dd className="font-medium">{metrics.paymentSuccessCount}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Timeline por usuario
        </h2>
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="sr-only" htmlFor="subscription-user-id">
            UUID de usuario
          </label>
          <input
            id="subscription-user-id"
            type="text"
            placeholder="UUID de usuario"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 sm:max-w-md"
            autoCapitalize="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={() => void loadTimeline()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Ver eventos
          </button>
        </div>

        {timelineError && (
          <p className="mb-3 text-sm text-red-700" role="alert">
            {timelineError}
          </p>
        )}

        <SubscriptionTimeline events={events} loading={timelineLoading} />
      </section>
    </main>
  );
}
