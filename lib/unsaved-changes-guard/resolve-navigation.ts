export type UnsavedNavigationDecision = "navigate" | "prompt";

/** Pure contract: dirty drafts prompt; clean drafts navigate immediately. */
export function resolveUnsavedNavigation(
  isDirty: boolean,
): UnsavedNavigationDecision {
  return isDirty ? "prompt" : "navigate";
}
