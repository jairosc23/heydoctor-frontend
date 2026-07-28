export type W3PopMemberModel = {
  patientId: string;
  riskScore: number;
  riskBand: string;
  isAuthoritative: false;
};

export type W3PopInsightModel = {
  insightId: string;
  kind: string;
  title: string;
  summary: string;
  advisory: true;
};

export type W3PopCohortModel = {
  cohortId: string;
  label: string;
  memberPatientIds: string[];
  members: W3PopMemberModel[];
  insights: W3PopInsightModel[];
};

export type W3PopWorkspaceProps = {
  enabled?: boolean;
  cohorts: W3PopCohortModel[];
  onEvaluate?: (cohortId: string) => void;
  message?: string | null;
};

/**
 * WP-08 Population Health workspace — observational / advisory only.
 * No Confirm / Emit / Order / Ready CTAs.
 */
export function W3PopWorkspace({
  enabled = true,
  cohorts,
  onEvaluate,
  message,
}: W3PopWorkspaceProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-pop-off">
        Population Health (`w3.pop.signals`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-pop-workspace"
      data-w3-flag="w3.pop.signals"
      data-is-authority="false"
      data-observational-only="true"
      data-may-emit="false"
      data-may-order="false"
      data-may-confirm="false"
    >
      <header>
        <h2>Population Health (observational)</h2>
        <p>
          Cohorts, advisory risk bands, and population insights. Never confirms
          diagnoses, emits prescriptions, or places orders.
        </p>
      </header>
      {message ? <p data-testid="w3-pop-message">{message}</p> : null}
      <ul>
        {cohorts.map((c) => (
          <li key={c.cohortId} data-testid="w3-pop-cohort-row">
            <p>
              <strong>{c.label}</strong> · members {c.memberPatientIds.length}
            </p>
            {c.members.length > 0 ? (
              <ul>
                {c.members.map((m) => (
                  <li
                    key={m.patientId}
                    data-testid="w3-pop-member-row"
                    data-authoritative="false"
                    data-risk-band={m.riskBand}
                  >
                    {m.patientId} · risk {m.riskScore.toFixed(2)} ({m.riskBand}
                    ) · non-authoritative
                  </li>
                ))}
              </ul>
            ) : null}
            {c.insights.map((i) => (
              <p key={i.insightId} data-testid="w3-pop-insight-row" data-advisory="true">
                [{i.kind}] {i.title}: {i.summary}
              </p>
            ))}
            {onEvaluate ? (
              <button type="button" onClick={() => onEvaluate(c.cohortId)}>
                Evaluate cohort
              </button>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
