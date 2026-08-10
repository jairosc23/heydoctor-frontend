export type UnsavedNavigationDecision = "navigate" | "prompt";

/**
 * Pure contract: dirty drafts prompt; clean drafts navigate immediately.
 * Browser Back is not intercepted (App Router has no stable useBlocker);
 * refresh / tab close keep native beforeunload only.
 */
export function resolveUnsavedNavigation(
  isDirty: boolean,
): UnsavedNavigationDecision {
  return isDirty ? "prompt" : "navigate";
}
