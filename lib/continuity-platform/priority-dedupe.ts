import { CCP_BAND, type PassiveContinuityHint, type PassiveHintSourceKind } from "./types";

const BAND_CAPS: Record<PassiveHintSourceKind, number> = {
  manual: 3,
  continuity_active: 8,
  continuity_timeline: 5,
  clinical_protocol: 3,
  therapeutic_knowledge: 3,
  reserved_future: 2,
};

function normalizeName(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeText(s: string | undefined): string {
  return (s ?? "").trim().toLowerCase();
}

export function continuityHintEqualityKey(hint: PassiveContinuityHint): string {
  const meds = hint.structuralPayload?.medications ?? [];
  const medKey = meds
    .map((m) =>
      [
        normalizeName(m.name),
        m.drugPresentationId ?? "",
        normalizeText(m.dosage),
        normalizeText(m.frequency),
        normalizeText(m.duration),
        normalizeText(m.route),
      ].join("|"),
    )
    .sort()
    .join(";");
  return [
    medKey || normalizeText(hint.title),
    hint.structuralPayload?.sourceVersionId ?? "",
  ].join("::");
}

/**
 * T3 — same pipeline as BE. Does not change bands or merge provenances.
 */
export function applyPriorityAndDedupe(
  candidates: PassiveContinuityHint[],
  hintLimit = 20,
): { hints: PassiveContinuityHint[]; omittedHintCount: number } {
  let omitted = 0;
  const byKey = new Map<string, PassiveContinuityHint[]>();
  for (const h of candidates) {
    if (!h.provenance || h.actionableWithoutConfirmation !== false) {
      omitted += 1;
      continue;
    }
    const key = continuityHintEqualityKey(h);
    const list = byKey.get(key) ?? [];
    list.push(h);
    byKey.set(key, list);
  }

  const survivors: PassiveContinuityHint[] = [];
  for (const group of byKey.values()) {
    group.sort((a, b) => {
      const bandDiff = CCP_BAND[a.sourceKind] - CCP_BAND[b.sourceKind];
      if (bandDiff !== 0) return bandDiff;
      const t = b.provenance.occurredAt.localeCompare(a.provenance.occurredAt);
      if (t !== 0) return t;
      return a.hintId.localeCompare(b.hintId);
    });
    survivors.push(group[0]!);
    omitted += group.length - 1;
  }

  const byBand = new Map<number, PassiveContinuityHint[]>();
  for (const h of survivors) {
    const b = CCP_BAND[h.sourceKind];
    const list = byBand.get(b) ?? [];
    list.push(h);
    byBand.set(b, list);
  }

  const capped: PassiveContinuityHint[] = [];
  for (const band of [...byBand.keys()].sort((a, b) => a - b)) {
    const list = byBand.get(band)!;
    list.sort((a, b) => {
      const t = b.provenance.occurredAt.localeCompare(a.provenance.occurredAt);
      if (t !== 0) return t;
      return a.hintId.localeCompare(b.hintId);
    });
    const cap = BAND_CAPS[list[0]!.sourceKind];
    capped.push(...list.slice(0, cap));
    omitted += Math.max(0, list.length - cap);
  }

  const limited = capped.slice(0, Math.min(Math.max(hintLimit, 1), 50));
  omitted += Math.max(0, capped.length - limited.length);

  return {
    hints: limited.map((h, i) => ({ ...h, priorityRank: i + 1 })),
    omittedHintCount: omitted,
  };
}
