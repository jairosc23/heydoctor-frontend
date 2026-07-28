export type W3ProposalCardModel = {
  proposalId: string;
  kind: string;
  status: string;
  summary: string;
};

export type W3ProposalCardProps = {
  proposal: W3ProposalCardModel;
  onDispose?: (disposition: "accept" | "reject" | "refine" | "ignore") => void;
  onDismiss?: () => void;
  onApply?: (target: "documentation" | "care_plan" | "order") => void;
  busy?: boolean;
};

/**
 * Advisory proposal card — Dispose / Dismiss / Insert into draft.
 * No Confirm / Emit / Authorize CTAs.
 */
export function W3ProposalCard({
  proposal,
  onDispose,
  onDismiss,
  onApply,
  busy,
}: W3ProposalCardProps) {
  return (
    <article
      data-testid="w3-proposal-card"
      data-proposal-id={proposal.proposalId}
      data-status={proposal.status}
      style={{
        borderTop: "1px solid var(--hcx-border, #ccc)",
        padding: "12px 0",
      }}
    >
      <p data-testid="w3-proposal-kind">
        <strong>{proposal.kind}</strong> · provisional / advisory
      </p>
      <p data-testid="w3-proposal-summary">{proposal.summary}</p>
      {proposal.status === "active" ? (
        <div data-testid="w3-proposal-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => onDispose?.("accept")}
          >
            Dispose (accept)
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onDismiss?.()}
          >
            Dismiss
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onApply?.("documentation")}
          >
            Insert into draft
          </button>
        </div>
      ) : (
        <p data-testid="w3-proposal-terminal">Status: {proposal.status}</p>
      )}
    </article>
  );
}
