/**
 * Age SSOT — always derived from birth date when valid.
 * Prefer this helper over storing a mutable age field in forms.
 */

export function computeAgeFromBirthDate(
  birthDate: string | null | undefined,
  refDate: Date = new Date(),
): number | null {
  if (!birthDate?.trim()) return null;

  // Prefer YYYY-MM-DD parsing to avoid timezone off-by-one.
  const iso = birthDate.trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  let year: number;
  let month: number;
  let day: number;

  if (m) {
    year = Number(m[1]);
    month = Number(m[2]) - 1;
    day = Number(m[3]);
  } else {
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return null;
    year = parsed.getUTCFullYear();
    month = parsed.getUTCMonth();
    day = parsed.getUTCDate();
  }

  const birth = new Date(year, month, day);
  if (
    Number.isNaN(birth.getTime()) ||
    birth.getFullYear() !== year ||
    birth.getMonth() !== month ||
    birth.getDate() !== day
  ) {
    return null;
  }

  let age = refDate.getFullYear() - year;
  const monthDelta = refDate.getMonth() - month;
  if (monthDelta < 0 || (monthDelta === 0 && refDate.getDate() < day)) {
    age -= 1;
  }
  return age >= 0 ? age : null;
}

export function formatComputedAge(
  age: number | null | undefined,
  emptyLabel = "—",
): string {
  if (age === null || age === undefined || Number.isNaN(age)) return emptyLabel;
  return String(age);
}

/** Age for display: never leave blank when birthDate is valid. */
export function resolveAgeDisplay(
  birthDate: string | null | undefined,
  fallbackAge?: number | string | null,
  refDate?: Date,
  emptyLabel = "—",
): string {
  const computed = computeAgeFromBirthDate(birthDate, refDate);
  if (computed !== null) return formatComputedAge(computed, emptyLabel);

  if (fallbackAge !== null && fallbackAge !== undefined && fallbackAge !== "") {
    const n = typeof fallbackAge === "number" ? fallbackAge : Number(fallbackAge);
    if (!Number.isNaN(n)) return formatComputedAge(n, emptyLabel);
    return String(fallbackAge);
  }
  return emptyLabel;
}
