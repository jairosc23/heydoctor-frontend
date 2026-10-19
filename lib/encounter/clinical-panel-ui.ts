/**
 * Encounter clinical panel UI contract (P1).
 * Every clinical surface exposes deterministic loading | empty | ready.
 */

export type ClinicalPanelUiState = "loading" | "empty" | "ready";

export type ClinicalPanelUiInput = {
  /** Provider / bootstrap in flight. */
  loading?: boolean;
  /** Structured clinical payload available. */
  hasData?: boolean;
  /** Explicit empty (known absence of data). */
  empty?: boolean;
};

/**
 * Resolve panel UI state. Fail-closed: loading wins; blank is never implied.
 */
export function resolveClinicalPanelUiState(
  input: ClinicalPanelUiInput,
): ClinicalPanelUiState {
  if (input.loading) return "loading";
  if (input.empty || input.hasData === false) return "empty";
  if (input.hasData) return "ready";
  return "empty";
}
