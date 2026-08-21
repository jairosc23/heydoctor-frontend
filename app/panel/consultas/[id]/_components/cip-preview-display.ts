/**
 * Display contract for CIP HTTP previews in the Encounter disclosure.
 *
 * The producer may project `view.ok === true` while a required token is
 * absent. That is intentional fail-closed compose: the Composer does not
 * invent admit/allow/accept. The Gate reports the absence
 * (`missing_*_stance`, missing posture, missing disposition, …).
 *
 * `view.ok` therefore does not mean “every token is a string”. Labels must
 * resolve only against the closed vocabulary of the preview. A missing or
 * unknown token is not displayed and is never coerced via trim/empty-string.
 */
export function cipVocabularyLabel(
  value: unknown,
  vocabulary: Record<string, string>,
): string | null {
  if (typeof value !== "string") {
    return null;
  }
  if (!Object.hasOwn(vocabulary, value)) {
    return null;
  }
  const label = vocabulary[value];
  return typeof label === "string" ? label : null;
}
