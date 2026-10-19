import { isW3AssistEnabled } from "@/lib/w3/flags";
import {
  W3ProposalCard,
  type W3ProposalCardModel,
} from "./W3ProposalCard";

export type W3AssistDockProps = {
  enabled?: boolean;
  proposals: W3ProposalCardModel[];
  message?: string | null;
  onDispose?: (
    proposalId: string,
    disposition: "accept" | "reject" | "refine" | "ignore",
  ) => void;
  onDismiss?: (proposalId: string) => void;
  onApply?: (
    proposalId: string,
    target: "documentation" | "care_plan" | "order",
  ) => void;
};

/**
 * WP-02 Assist dock — advisory workspace chrome.
 */
export function W3AssistDock({
  enabled,
  proposals,
  message,
  onDispose,
  onDismiss,
  onApply,
}: W3AssistDockProps) {
  const on = enabled ?? isW3AssistEnabled();
  if (!on) {
    return (
      <div data-testid="w3-assist-dock-off">
        Assist (`w3.assist`) desactivado.
      </div>
    );
  }

  return (
    <section
      data-testid="w3-assist-dock"
      data-w3-flag="w3.assist"
      data-is-authority="false"
    >
      <header>
        <h2>Assist (advisory)</h2>
        <p>
          Propuestas provisionales. Dispose ≠ Confirm. Insert into draft ≠
          Ready. HAB Confirm y emisión permanecen fuera de este panel.
        </p>
      </header>
      {message ? <p data-testid="w3-assist-message">{message}</p> : null}
      {proposals.map((p) => (
        <W3ProposalCard
          key={p.proposalId}
          proposal={p}
          onDispose={(d) => onDispose?.(p.proposalId, d)}
          onDismiss={() => onDismiss?.(p.proposalId)}
          onApply={(t) => onApply?.(p.proposalId, t)}
        />
      ))}
    </section>
  );
}
