"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/heydoctor-api";

const OpsRequestsChart = dynamic(
  () => import("./OpsRequestsChart").then((mod) => mod.OpsRequestsChart),
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
  const res = await fetchWithAuth("/api/admin/ops/scaling", { method: "GET" });
  if (!res.ok) return null;
  return (await res.json()) as OpsScaling;
}

async function fetchOpsOverview(): Promise<OpsOverview> {
  const res = await fetchWithAuth("/api/admin/ops/overview", { method: "GET" });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status}: ${t.slice(0, 200)}`);
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
  const [traceId, setTraceId] = useState("");
  const [traceHit, setTraceHit] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [o, s] = await Promise.all([fetchOpsOverview(), fetchOpsScaling()]);
      setData(o);
      setScaling(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
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
      { method: "GET" },
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
          <h1 className="text-xl font-semibold text-slate-900">Operations</h1>
          <p className="text-sm text-slate-600">
            RPM/latencia/errores (Redis si aplica). CPU load y señales de scaling
            en tarjeta dedicada. Trazas: índice por réplica. Documentación de escalado en el
            repositorio backend:{" "}
            <code className="text-xs">docs/RAILWAY-SCALING.md</code>.
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm" aria-label="Navegación de operaciones">
          <Link
            href="/admin/growth"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Growth
          </Link>
          <Link
            href="/admin/analytics"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Analytics
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
          <strong>Tasa de error elevada:</strong>{" "}
          {((data?.errorRate ?? 0) * 100).toFixed(2)}% de peticiones 5xx en los últimos ~5 min
          (objetivo &lt; 5%).
        </div>
      )}

      {zeroRevenue && (
        <div
          role="status"
          className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"
        >
          <strong>Revenue hoy (UTC):</strong> $0 CLP según eventos PAYMENT_SUCCEEDED. Comprueba
          webhooks Payku o si el día UTC recién comenzó.
        </div>
      )}

      {data && !loading && scaling !== null && (
        <section className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Señales de autoscaling (referencia; Railway usa CPU/RAM en panel)
          </h2>
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div>
              <p className="text-xs uppercase text-slate-500">CPU load (1m)</p>
              <p className="text-lg font-semibold tabular-nums">{scaling.cpuLoad}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">RPM</p>
              <p className="text-lg font-semibold tabular-nums">{scaling.requestsPerMinute}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Latencia media</p>
              <p className="text-lg font-semibold tabular-nums">{scaling.avgResponseTime} ms</p>
            </div>
            <div>
              <p className="text-xs uppercase text-amber-800">P95 🔥</p>
              <p className="text-lg font-semibold tabular-nums text-amber-950">
                {scaling.p95ResponseTime} ms
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-orange-800">P99 🔥</p>
              <p className="text-lg font-semibold tabular-nums text-orange-950">
                {scaling.p99ResponseTime} ms
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-500">Error rate</p>
              <p className="text-lg font-semibold tabular-nums">
                {(scaling.errorRate * 100).toFixed(2)}%
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Reglas orientativas: RPM &gt; 200 o error &gt; 5% o latencia &gt; 800ms → revisar scale
            up; RPM &lt; 20 sostenido → scale down.
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

      {loading && <p className="text-sm text-slate-600">Cargando panel…</p>}

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
            <div
              className={`rounded-lg border bg-white p-4 shadow-sm ${
                highError ? "border-red-400 ring-2 ring-red-100" : "border-slate-200"
              }`}
            >
              <p className="text-xs font-medium uppercase text-slate-500">Error rate (~5 min)</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {(data.errorRate * 100).toFixed(2)}%
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Requests / min</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {data.requestsPerMinute}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Latencia media</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {data.avgResponseTime} ms
              </p>
              <p className="mt-0.5 text-[10px] text-slate-500">ventana misma que P95/P99</p>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/40 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-amber-900">P95 🔥</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-amber-950">
                {data.p95ResponseTime} ms
              </p>
            </div>
            <div className="rounded-lg border border-orange-100 bg-orange-50/40 p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-orange-900">P99 🔥</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-orange-950">
                {data.p99ResponseTime} ms
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Uptime proceso</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {formatUptime(data.uptime)}
              </p>
            </div>
          </section>

          <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div
              className={`rounded-lg border bg-white p-4 shadow-sm ${
                zeroRevenue ? "border-amber-300" : "border-slate-200"
              }`}
            >
              <p className="text-xs font-medium uppercase text-slate-500">Revenue hoy (UTC)</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">
                {data.revenueToday.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">Pagos hoy (eventos)</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {data.paymentsToday}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Usuarios activos (~15 min)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {data.activeUsers}
              </p>
              <p className="mt-1 text-xs text-slate-500">product_events</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium uppercase text-slate-500">
                Alertas (24h, esta instancia)
              </p>
              <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">
                {data.alertsLast24h}
              </p>
            </div>
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
            <section className="mb-10">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Errores por endpoint (5xx, ~5 min)
              </h2>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Path</th>
                      <th className="px-3 py-2">5xx</th>
                      <th className="px-3 py-2">Total</th>
                      <th className="px-3 py-2">Err %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.errorsByEndpoint.map((row) => (
                      <tr key={row.path} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-mono text-xs text-slate-800">{row.path}</td>
                        <td className="px-3 py-2 tabular-nums text-red-700">{row.errorCount}</td>
                        <td className="px-3 py-2 tabular-nums">{row.requestCount}</td>
                        <td className="px-3 py-2 tabular-nums">
                          {(row.errorRate * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {data.topEndpointsByLatency.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Top latencia por path (~5 min, muestras en esta réplica)
              </h2>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-600">
                    <tr>
                      <th className="px-3 py-2">Path</th>
                      <th className="px-3 py-2">Avg ms</th>
                      <th className="px-3 py-2">Muestras</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topEndpointsByLatency.map((row) => (
                      <tr key={row.path} className="border-t border-slate-100">
                        <td className="px-3 py-2 font-mono text-xs">{row.path}</td>
                        <td className="px-3 py-2 tabular-nums">{row.avgMs}</td>
                        <td className="px-3 py-2 tabular-nums">{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {data.requestTraceTimeline.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Línea de tiempo de peticiones (esta réplica)
              </h2>
              <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="min-w-full text-left text-xs">
                  <thead className="bg-slate-50 uppercase text-slate-600">
                    <tr>
                      <th className="px-2 py-2">requestId</th>
                      <th className="px-2 py-2">method</th>
                      <th className="px-2 py-2">path</th>
                      <th className="px-2 py-2">status</th>
                      <th className="px-2 py-2">ms</th>
                      <th className="px-2 py-2">at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.requestTraceTimeline.map((r) => (
                      <tr key={`${r.at}-${r.requestId}`} className="border-t border-slate-100">
                        <td className="px-2 py-1 font-mono">{r.requestId.slice(0, 8)}…</td>
                        <td className="px-2 py-1">{r.method}</td>
                        <td className="px-2 py-1 font-mono">{r.path}</td>
                        <td className="px-2 py-1">{r.statusCode}</td>
                        <td className="px-2 py-1">{r.durationMs}</td>
                        <td className="px-2 py-1 text-slate-500">{r.at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Alertas recientes (insights + memoria local)
            </h2>
            {data.recentAlerts.length === 0 ? (
              <p className="text-sm text-slate-600">Sin alertas en ventana.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {data.recentAlerts.map((a) => (
                  <li
                    key={`${a.at}-${a.event}`}
                    className="rounded border border-slate-200 bg-slate-50 px-3 py-2"
                  >
                    <span className="font-medium text-slate-800">{a.event}</span>
                    <span className="ml-2 text-xs uppercase text-slate-500">{a.level}</span>
                    <span className="ml-2 text-xs text-slate-500">{a.at}</span>
                    {a.message && <p className="mt-1 text-slate-700">{a.message}</p>}
                    {a.analysis && (
                      <p className="mt-1 text-sm text-indigo-900">🧠 {a.analysis}</p>
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
