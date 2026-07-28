export type W3CpiSuggestionModel = {
  suggestionId: string;
  kind: string;
  label: string;
  detail: string | null;
  status: string;
};

export type W3CpiSuggestionListProps = {
  enabled?: boolean;
  suggestions: W3CpiSuggestionModel[];
  onDismiss?: (id: string) => void;
  onApply?: (id: string) => void;
  message?: string | null;
};

/**
 * WP-04 Care Plan Intelligence list.
 * Apply ≠ Plan Ready. No Confirm / Emit.
 */
export function W3CpiSuggestionList({
  enabled = true,
  suggestions,
  onDismiss,
  onApply,
  message,
}: W3CpiSuggestionListProps) {
  if (!enabled) {
    return (
      <div data-testid="w3-cpi-list-off">
        Care Plan Intelligence (`w3.cpi`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-cpi-suggestion-list"
      data-w3-flag="w3.cpi"
      data-is-authority="false"
    >
      <header>
        <h2>Care Plan Intelligence (advisory)</h2>
        <p>
          Suggestions insert into Therapy Draft (E07) only. Plan Ready and HAB
          Confirm remain on the care plan clinical surface — not here.
        </p>
      </header>
      {message ? <p data-testid="w3-cpi-message">{message}</p> : null}
      <ul>
        {suggestions.map((s) => (
          <li
            key={s.suggestionId}
            data-testid="w3-cpi-suggestion-row"
            data-status={s.status}
          >
            <p>
              <strong>{s.label}</strong> · {s.kind}
            </p>
            {s.detail ? <p>{s.detail}</p> : null}
            {s.status === "suggested" ? (
              <div>
                <button type="button" onClick={() => onDismiss?.(s.suggestionId)}>
                  Dismiss
                </button>
                <button type="button" onClick={() => onApply?.(s.suggestionId)}>
                  Insert into draft
                </button>
              </div>
            ) : (
              <p>Status: {s.status}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
