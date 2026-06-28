"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/heydoctor-api";

type GrowthSummary = {
  windowDays: number;
  funnelDistinctUsers: Record<string, number>;
  signupToPaidApprox: number;
  signupToPaidNote: string;
  subscriptionTotals: {
    totalUsers: number;
    proUsers: number;
    conversionProVsUsersApprox: number;
  };
};

type GrowthAlert = {
  code: string;
  severity: string;
  message: string;
  value?: number;
};

type FunnelDashboard = {
  windowDays: number;
  visits: number;
  signups: number;
  viewPricing: number;
  upgrades: number;
  startCheckout: number;
  payments: number;
  calls: number;
  conversionRates: Record<string, number | null>;
  experimentPricingUpgradeCta: {
    variants: Record<
      string,
      {
        viewPricingActors: number;
        clickUpgradeActors: number;
        clickThroughRate: number | null;
      }
    >;
  };
};

type GrowthRetention = {
  cohortLookbackDays: number;
  definition: string;
  buckets: {
    days: number;
    cohortEligible: number;
    retained: number;
    rate: number | null;
    note: string;
  }[];
};

function pct(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "-";
  return `${(value * 100).toFixed(2)}%`;
}

async function adminGet<T>(path: string): Promise<T> {
  const response = await fetchWithAuth(path, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status}: ${text.slice(0, 200)}`);
  }
  return (await response.json()) as T;
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}

export default function AdminGrowthPage() {
  const [summary, setSummary] = useState<GrowthSummary | null>(null);
  const [alerts, setAlerts] = useState<GrowthAlert[]>([]);
  const [funnel, setFunnel] = useState<FunnelDashboard | null>(null);
  const [retention, setRetention] = useState<GrowthRetention | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const [summaryResponse, alertsResponse, funnelResponse, retentionResponse] =
        await Promise.all([
          adminGet<GrowthSummary>("/api/admin/growth/summary"),
          adminGet<GrowthAlert[]>("/api/admin/growth/alerts"),
          adminGet<FunnelDashboard>("/api/admin/growth/funnel"),
          adminGet<GrowthRetention>("/api/admin/growth/retention?days=1,7,30"),
        ]);
      setSummary(summaryResponse);
      setAlerts(alertsResponse);
      setFunnel(funnelResponse);
      setRetention(retentionResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
      setSummary(null);
      setAlerts([]);
      setFunnel(null);
      setRetention(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const variantRows = funnel
    ? Object.entries(funnel.experimentPricingUpgradeCta.variants).sort((a, b) =>
        a[0].localeCompare(b[0]),
      )
    : [];

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Growth</h1>
          <p className="text-sm text-slate-600">
            Embudo, retención, experimento pricing CTA y alertas.
          </p>
        </div>
        <nav className="flex flex-wrap gap-3 text-sm" aria-label="Navegación de growth">
          <Link
            href="/pricing"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Pricing
          </Link>
          <Link
            href="/admin/analytics"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Analytics
          </Link>
          <Link
            href="/admin/ops"
            className="rounded text-slate-600 underline hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Ops
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

      {loading && <p className="text-sm text-slate-600">Cargando growth...</p>}

      {error && !loading && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950"
        >
          {error}
        </div>
      )}

      {!loading && !error && summary && funnel && retention && (
        <>
          {alerts.length > 0 && (
            <section className="mb-8 rounded-lg border border-red-100 bg-red-50/70 p-4">
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-red-900">
                Alertas
              </h2>
              <ul className="space-y-2 text-sm text-red-950">
                {alerts.map((alert) => (
                  <li key={alert.code}>
                    <strong>{alert.code}</strong> ({alert.severity}
                    {alert.value != null ? ` · ${pct(alert.value)}` : ""}) · {alert.message}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Metric
              label="Conversión PRO / usuarios"
              value={pct(summary.subscriptionTotals.conversionProVsUsersApprox)}
            />
            <Metric label="Signup a pago" value={pct(summary.signupToPaidApprox)} />
            <Metric label="Pagos" value={funnel.payments} />
            <Metric label="Calls" value={funnel.calls} />
          </section>

          <section className="mb-10 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Embudo operativo ({funnel.windowDays}d)
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Metric label="Visitas" value={funnel.visits} />
              <Metric label="Signups" value={funnel.signups} />
              <Metric label="Pricing views" value={funnel.viewPricing} />
              <Metric label="Start checkout" value={funnel.startCheckout} />
            </div>
          </section>

          {variantRows.length > 0 && (
            <section className="mb-10 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
                Experimento pricing CTA
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-2 py-2">Variante</th>
                      <th className="px-2 py-2">Views</th>
                      <th className="px-2 py-2">Clicks</th>
                      <th className="px-2 py-2">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {variantRows.map(([variant, row]) => (
                      <tr key={variant} className="border-t border-slate-100">
                        <td className="px-2 py-2 font-medium">{variant}</td>
                        <td className="px-2 py-2">{row.viewPricingActors}</td>
                        <td className="px-2 py-2">{row.clickUpgradeActors}</td>
                        <td className="px-2 py-2">{pct(row.clickThroughRate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">
              Retención
            </h2>
            <p className="mb-4 text-xs text-slate-500">{retention.definition}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {retention.buckets.map((bucket) => (
                <Metric key={bucket.days} label={`${bucket.days} días`} value={pct(bucket.rate)} />
              ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}
