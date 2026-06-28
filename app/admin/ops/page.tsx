'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import { fetchWithAuth } from '@/lib/heydoctor-api';

const OpsRequestsChart = dynamic(
  () => import('./OpsRequestsChart').then((mod) => mod.OpsRequestsChart),
  {
    ssr: false,
    loading: () => (
      <div
        className="h-full w-full animate-pulse rounded bg-slate-100"
        aria-busy="true"
      />
    ),
  },
);

type OpsOverview = {
  uptime: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
  activeUsers: number;
  paymentsToday: number;
  revenueToday: number;
  alertsLast24h: number;
  requestsPerMinuteSeries: { minute: string; count: number }[];
  errorsByEndpoint: {
    path: string;
    errorCount: number;
    requestCount: number;
    errorRate: number;
  }[];
  topEndpointsByLatency: {
    path: string;
    avgMs: number;
    count: number;
  }[];
  requestTraceTimeline: {
    requestId: string;
    traceId: string;
    method: string;
    path: string;
    statusCode: number;
    durationMs: number;
    at: string;
  }[];
  recentAlerts: {
    at: string;
    event: string;
    level: string;
    message?: string;
    analysis?: string;
  }[];
};

type OpsScaling = {
  cpuLoad: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  errorRate: number;
};

async function fetchOpsScaling(): Promise<OpsScaling | null> {
  const res = await fetchWithAuth('/api/admin/ops/scaling', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return (await res.json()) as OpsScaling;
}

async function fetchOpsOverview(): Promise<OpsOverview> {
  const res = await fetchWithAuth('/api/admin/ops/overview', {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text.slice(0, 200)}`);
  }
  return (await res.json()) as OpsOverview;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function AdminOpsPage() {
  const [data, setData] = useState<OpsOverview | null>(null);
  const [scaling, setScaling] = useState<OpsScaling | null>(null);
  const [traceId, setTraceId] = useState('');
  const [traceHit, setTraceHit] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [overview, scalingSignals] = await Promise.all([
        fetchOpsOverview(),
        fetchOpsScaling(),
      ]);
      setData(overview);
      setScaling(scalingSignals);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
      setData(null);
      setScaling(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const lookupTrace = useCallback(async () => {
    const id = traceId.trim();
    if (!id) return;
    const res = await fetchWithAuth(
      `/api/admin/ops/traces/${encodeURIComponent(id)}`,
      { method: 'GET', headers: { Accept: 'application/json' } },
    );
    if (!res.ok) {
      setTraceHit({ error: await res.text() });
      return;
    }
    setTraceHit(await res.json());
  }, [traceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const id = window.setInterval(() => void load(), 10_000);
    return () => window.clearInterval(id);
  }, [load]);

  const highError = data !== null && data.errorRate > 0.05;
  const zeroRevenue = data !== null && data.revenueToday === 0;

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Operations
          </h1>
          <p className="text-sm text-slate-600">
            RPM/latencia/errores (Redis si aplica). CPU load y señales de scaling
            en tarjeta dedicada. Trazas: índice por réplica.
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm" aria-label="Navegación de operaciones">
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
            onClick={() => void load()}
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Refrescar
          </button>
        </nav>
      </div>

      {highError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-950"
        >
          <strong>Tasa de error elevada:</strong> {((data?.errorRate ?? 0) * 100).toFixed(2)}
          % de peticiones 5xx en los últimos ~5 min (objetivo &lt; 5%).
        </div>
      )}

      {zeroRevenue && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <strong>Revenue hoy (UTC):</strong> $0 CLP según eventos
          PAYMENT_SUCCEEDED. Comprueba webhooks Payku o si el día UTC recién
          comenzó.
        </div>
      )}

      {data && !loading && scaling !== null && (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Señales de autoscaling (referencia; Railway usa CPU/RAM en panel)
          </h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <Metric label="CPU load (1m)" value={String(scaling.cpuLoad)} />
            <Metric label="RPM" value={String(scaling.requestsPerMinute)} />
            <Metric label="Latencia media" value={`${scaling.avgResponseTime} ms`} />
            <Metric label="P95" value={`${scaling.p95ResponseTime} ms`} tone="amber" />
            <Metric label="P99" value={`${scaling.p99ResponseTime} ms`} tone="orange" />
            <Metric label="Error rate" value={`${(scaling.errorRate * 100).toFixed(2)}%`} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Reglas orientativas: RPM &gt; 200 o error &gt; 5% o latencia &gt; 800ms →
            revisar scale up; RPM &lt; 20 sostenido → scale down.
          </p>
        </section>
      )}

      <section className="mb-6 flex flex-wrap items-end gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3">
        <label htmlFor="ops-trace-id" className="text-xs font-medium text-slate-600">
          Buscar trace / X-Request-Id (esta réplica)
          <input
            id="ops-trace-id"
            value={traceId}
            onChange={(e) => setTraceId(e.target.value)}
            className="ml-2 mt-1 block min-w-[220px] rounded border border-slate-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="uuid"
          />
        </label>
        <button
          type="button"
          onClick={() => void lookupTrace()}
          className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
        >
          Buscar
        </button>
        {traceHit !== null && (
          <pre
            className="max-h-40 w-full overflow-auto rounded border border-slate-200 bg-white p-2 text-xs"
            aria-live="polite"
          >
            {JSON.stringify(traceHit, null, 2)}
          </pre>
        )}
      </section>

      {loading && (
        <p className="text-sm text-slate-600">Cargando panel…</p>
      )}

      {error && !loading && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          {error}
        </div>
      )}

      {data && !loading && (
        <>
          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <MetricCard label="Error rate (~5 min)" value={`${(data.errorRate * 100).toFixed(2)}%`} highlight={highError} />
            <MetricCard label="Requests / min" value={String(data.requestsPerMinute)} />
            <MetricCard label="Latencia media" value={`${data.avgResponseTime} ms`} />
            <MetricCard label="P95" value={`${data.p95ResponseTime} ms`} tone="amber" />
            <MetricCard label="P99" value={`${data.p99ResponseTime} ms`} tone="orange" />
            <MetricCard label="Uptime proceso" value={formatUptime(data.uptime)} />
          </section>

          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              label="Revenue hoy (UTC)"
              value={data.revenueToday.toLocaleString('es-CL', {
                style: 'currency',
                currency: 'CLP',
                maximumFractionDigits: 0,
              })}
              highlight={zeroRevenue}
            />
            <MetricCard label="Pagos hoy (eventos)" value={String(data.paymentsToday)} />
            <MetricCard label="Usuarios activos (~15 min)" value={String(data.activeUsers)} />
            <MetricCard label="Alertas (24h, esta instancia)" value={String(data.alertsLast24h)} />
          </section>

          <section className="mb-10 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Requests por minuto (últimos 30 min, esta instancia)
            </h2>
            <div className="h-72 w-full">
              <OpsRequestsChart data={data.requestsPerMinuteSeries} />
            </div>
          </section>

          {data.errorsByEndpoint.length > 0 && (
            <OpsTable
              title="Errores por endpoint (5xx, ~5 min)"
              headers={['Path', '5xx', 'Total', 'Err %']}
              rows={data.errorsByEndpoint.map((row) => [
                row.path,
                row.errorCount,
                row.requestCount,
                `${(row.errorRate * 100).toFixed(1)}%`,
              ])}
            />
          )}

          {data.topEndpointsByLatency.length > 0 && (
            <OpsTable
              title="Top latencia por path (~5 min, muestras en esta réplica)"
              headers={['Path', 'Avg ms', 'Muestras']}
              rows={data.topEndpointsByLatency.map((row) => [
                row.path,
                row.avgMs,
                row.count,
              ])}
            />
          )}

          {data.requestTraceTimeline.length > 0 && (
            <OpsTable
              title="Línea de tiempo de peticiones (esta réplica)"
              headers={['requestId', 'method', 'path', 'status', 'ms', 'at']}
              rows={data.requestTraceTimeline.map((row) => [
                `${row.requestId.slice(0, 8)}…`,
                row.method,
                row.path,
                row.statusCode,
                row.durationMs,
                row.at,
              ])}
            />
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Alertas recientes (insights + memoria local)
            </h2>
            {data.recentAlerts.length === 0 ? (
              <p className="text-sm text-slate-600">Sin alertas en ventana.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.recentAlerts.map((alert) => (
                  <li
                    key={`${alert.at}-${alert.event}`}
                    className="rounded border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="font-medium text-slate-800">
                      {alert.event}
                    </span>
                    <span className="ml-2 text-xs uppercase text-slate-500">
                      {alert.level}
                    </span>
                    <span className="ml-2 text-xs text-slate-500">
                      {alert.at}
                    </span>
                    {alert.message && (
                      <p className="mt-1 text-slate-700">{alert.message}</p>
                    )}
                    {alert.analysis && (
                      <p className="mt-1 text-sm text-indigo-900">
                        {alert.analysis}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}

function Metric({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: string;
  tone?: 'slate' | 'amber' | 'orange';
}) {
  const toneClass =
    tone === 'amber'
      ? 'text-amber-950'
      : tone === 'orange'
        ? 'text-orange-950'
        : 'text-slate-900';
  return (
    <div>
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className={`tabular-nums text-lg font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
  tone = 'slate',
}: {
  label: string;
  value: string;
  highlight?: boolean;
  tone?: 'slate' | 'amber' | 'orange';
}) {
  const toneClass =
    tone === 'amber'
      ? 'border-amber-100 bg-amber-50/40 text-amber-950'
      : tone === 'orange'
        ? 'border-orange-100 bg-orange-50/40 text-orange-950'
        : 'border-slate-200 bg-white text-slate-900';
  return (
    <div
      className={`rounded-lg border p-4 shadow-sm ${highlight ? 'border-amber-300' : toneClass}`}
    >
      <p className="text-xs font-medium uppercase text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {value}
      </p>
    </div>
  );
}

function OpsTable({
  title,
  headers,
  rows,
}: {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-3 text-sm font-semibold text-slate-900">
        {title}
      </h2>
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              {headers.map((header) => (
                <th key={header} className="px-3 py-2">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${title}-${index}`} className="border-t border-slate-100">
                {row.map((cell, cellIndex) => (
                  <td
                    key={`${title}-${index}-${cellIndex}`}
                    className={cellIndex === 0 ? 'px-3 py-2 font-mono text-xs' : 'px-3 py-2 tabular-nums'}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
