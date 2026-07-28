export type W3LonInsightModel = {
  insightId: string;
  kind: string;
  title: string;
  summary: string;
  salienceScore: number;
  status: string;
  isDiagnosis: false;
};

export type W3LonInsightPanelProps = {
  enabled?: boolean;
  insights: W3LonInsightModel[];
  onDismiss?: (id: string) => void;
  onPublish?: () => void;
  message?: string | null;
};

/**
 * WP-05 Longitudinal Intelligence chips/panel.
 * Observational only — never diagnose / renew / Ready / Confirm / Emit.
 */
export function W3LonInsightPanel({
  enabled = true,
  insights,
  onDismiss,
  onPublish,
  message,
}: W3LonInsightPanelProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-lon-panel-off">
        Longitudinal Intelligence (`w3.lon.insights`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-lon-insight-panel"
      data-w3-flag="w3.lon.insights"
      data-is-authority="false"
      data-may-diagnose="false"
      data-may-renew="false"
    >
      <header>
        <h2>Longitudinal Intelligence (observational)</h2>
        <p>
          Trends and patterns enrich clinical context only. HAB remains the sole
          clinical authority. Never renews medications or marks Ready.
        </p>
      </header>
      {message ? <p data-testid="w3-lon-message">{message}</p> : null}
      {onPublish ? (
        <button type="button" onClick={onPublish} data-testid="w3-lon-publish">
          Publish insights
        </button>
      ) : null}
      <ul>
        {insights.map((i) => (
          <li
            key={i.insightId}
            data-testid="w3-lon-insight-chip"
            data-kind={i.kind}
            data-status={i.status}
            data-is-diagnosis="false"
          >
            <p>
              <strong>{i.title}</strong> · {i.kind} · salience{" "}
              {i.salienceScore.toFixed(2)}
            </p>
            <p>{i.summary}</p>
            {i.status === "published" ? (
              <button type="button" onClick={() => onDismiss?.(i.insightId)}>
                Dismiss
              </button>
            ) : (
              <p>Status: {i.status}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
