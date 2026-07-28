export type W3CdsRecommendationModel = {
  recommendationId: string;
  ruleId: string;
  severity: "info" | "warning" | "critical" | string;
  title: string;
  detail: string;
  status: string;
};

export type W3CdsConflictModel = {
  conflictId: string;
  summary: string;
};

export type W3CdsRecommendationRowProps = {
  recommendation: W3CdsRecommendationModel;
  onDismiss?: () => void;
  onApply?: () => void;
};

export function W3CdsRecommendationRow({
  recommendation,
  onDismiss,
  onApply,
}: W3CdsRecommendationRowProps) {
  return (
    <article
      data-testid="w3-cds-recommendation-row"
      data-severity={recommendation.severity}
      data-status={recommendation.status}
    >
      <p>
        <strong>{recommendation.title}</strong> · severity:{" "}
        {recommendation.severity} (label only — not HAB)
      </p>
      <p>{recommendation.detail}</p>
      {recommendation.status === "proposed" ? (
        <div data-testid="w3-cds-row-actions">
          <button type="button" onClick={() => onDismiss?.()}>
            Dismiss
          </button>
          <button type="button" onClick={() => onApply?.()}>
            Insert into draft
          </button>
        </div>
      ) : (
        <p>Status: {recommendation.status}</p>
      )}
    </article>
  );
}

export type W3CdsPanelProps = {
  enabled?: boolean;
  recommendations: W3CdsRecommendationModel[];
  conflicts: W3CdsConflictModel[];
  conflictsAcknowledged?: boolean;
  onAcknowledgeConflicts?: () => void;
  onDismiss?: (id: string) => void;
  onApply?: (id: string) => void;
  message?: string | null;
};

/**
 * WP-03 CDS panel — advisory. No Place order / Confirm / Emit.
 */
export function W3CdsPanel({
  enabled = true,
  recommendations,
  conflicts,
  conflictsAcknowledged = false,
  onAcknowledgeConflicts,
  onDismiss,
  onApply,
  message,
}: W3CdsPanelProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-cds-panel-off">CDS (`w3.cds`) desactivado.</div>
    );
  }

  return (
    <section
      data-testid="w3-cds-panel"
      data-w3-flag="w3.cds"
      data-is-authority="false"
    >
      <header>
        <h2>Clinical Decision Support (advisory)</h2>
        <p>
          Recommendations are provisional. Apply inserts drafts only. Severity
          is not clinical authorization.
        </p>
      </header>
      {conflicts.length > 0 ? (
        <div
          data-testid="w3-cds-conflict-banner"
          role="alert"
          style={{ border: "1px solid #b45309", padding: 8, marginBottom: 12 }}
        >
          <p>
            <strong>Conflicts disclosed</strong> — no auto-merge.
          </p>
          <ul>
            {conflicts.map((c) => (
              <li key={c.conflictId}>{c.summary}</li>
            ))}
          </ul>
          {!conflictsAcknowledged ? (
            <button type="button" onClick={() => onAcknowledgeConflicts?.()}>
              Acknowledge conflicts viewed
            </button>
          ) : (
            <p data-testid="w3-cds-conflicts-acked">Conflicts acknowledged</p>
          )}
        </div>
      ) : null}
      {message ? <p data-testid="w3-cds-message">{message}</p> : null}
      {recommendations.map((r) => (
        <W3CdsRecommendationRow
          key={r.recommendationId}
          recommendation={r}
          onDismiss={() => onDismiss?.(r.recommendationId)}
          onApply={() => onApply?.(r.recommendationId)}
        />
      ))}
    </section>
  );
}
