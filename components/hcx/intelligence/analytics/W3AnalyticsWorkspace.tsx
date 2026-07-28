export type W3AnalyticsKpiModel = {
  kpiId: string;
  code: string;
  label: string;
  value: number;
  unit: string;
  advisory: true;
};

export type W3AnalyticsQualityModel = {
  indicatorId: string;
  code: string;
  label: string;
  value: number;
  status: string;
  advisory: true;
};

export type W3AnalyticsTrendModel = {
  trendId: string;
  code: string;
  label: string;
  direction: string;
  delta: number;
  advisory: true;
};

export type W3AnalyticsOperationalModel = {
  metricId: string;
  code: string;
  label: string;
  value: number;
  advisory: true;
};

export type W3AnalyticsWorkspaceProps = {
  enabled?: boolean;
  window?: string;
  kpis: W3AnalyticsKpiModel[];
  operational: W3AnalyticsOperationalModel[];
  quality: W3AnalyticsQualityModel[];
  trends: W3AnalyticsTrendModel[];
  message?: string | null;
};

/**
 * WP-09 Clinical Analytics workspace — observational / advisory only.
 * No Confirm / Emit / Order / Ready CTAs.
 */
export function W3AnalyticsWorkspace({
  enabled = true,
  window = "30d",
  kpis,
  operational,
  quality,
  trends,
  message,
}: W3AnalyticsWorkspaceProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-analytics-off">
        Clinical Analytics (`w3.analytics.metrics`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-analytics-workspace"
      data-w3-flag="w3.analytics.metrics"
      data-is-authority="false"
      data-read-only="true"
      data-observational-only="true"
      data-may-confirm="false"
      data-may-emit="false"
      data-may-order="false"
    >
      <header>
        <h2>Clinical Analytics (observational)</h2>
        <p>
          KPIs, operational metrics, quality indicators, and trends. Advisory
          projections only — never confirms, emits, or places orders. Window:{" "}
          {window}
        </p>
      </header>
      {message ? <p data-testid="w3-analytics-message">{message}</p> : null}

      <div data-testid="w3-analytics-kpis">
        <h3>KPIs</h3>
        <ul>
          {kpis.map((k) => (
            <li key={k.kpiId} data-testid="w3-analytics-kpi-row" data-advisory="true">
              <strong>{k.label}</strong>: {k.value} {k.unit}
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-analytics-operational">
        <h3>Operational metrics</h3>
        <ul>
          {operational.map((m) => (
            <li
              key={m.metricId}
              data-testid="w3-analytics-ops-row"
              data-advisory="true"
            >
              <strong>{m.label}</strong>: {m.value}
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-analytics-quality">
        <h3>Quality indicators</h3>
        <ul>
          {quality.map((q) => (
            <li
              key={q.indicatorId}
              data-testid="w3-analytics-qi-row"
              data-advisory="true"
              data-status={q.status}
            >
              <strong>{q.label}</strong>: {q.value} ({q.status})
            </li>
          ))}
        </ul>
      </div>

      <div data-testid="w3-analytics-trends">
        <h3>Trends</h3>
        <ul>
          {trends.map((t) => (
            <li
              key={t.trendId}
              data-testid="w3-analytics-trend-row"
              data-advisory="true"
              data-direction={t.direction}
            >
              <strong>{t.label}</strong>: {t.direction} (Δ {t.delta})
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
