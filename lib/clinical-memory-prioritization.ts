import type { ClinicalMemoryAlert } from "./types/clinical-memory";

export type MemoryHighlightTier = "allergy" | "critical" | "high_risk" | "standard";

export type PrioritizedMemoryHighlight = {
  id: string;
  text: string;
  tier: MemoryHighlightTier;
};

const ALLERGY_PATTERN = /alerg|allerg|hipersensib/i;

export function isAllergyHighlight(text: string): boolean {
  return ALLERGY_PATTERN.test(text);
}

export function isAllergyAlert(alert: ClinicalMemoryAlert): boolean {
  return (
    alert.severity === "critical" &&
    ALLERGY_PATTERN.test(`${alert.code} ${alert.message}`)
  );
}

function tierRank(tier: MemoryHighlightTier): number {
  switch (tier) {
    case "allergy":
      return 0;
    case "critical":
      return 1;
    case "high_risk":
      return 2;
    default:
      return 3;
  }
}

/** Phase 4.4A — alergias y alertas nunca van a +N más. */
export function partitionMemoryHighlights(input: {
  highlights: string[];
  allergyLines?: string[];
  alerts?: ClinicalMemoryAlert[];
  compactVisibleSlots?: number;
}): {
  visible: PrioritizedMemoryHighlight[];
  overflow: PrioritizedMemoryHighlight[];
} {
  const slots = input.compactVisibleSlots ?? 3;
  const pinned: PrioritizedMemoryHighlight[] = [];
  const seen = new Set<string>();

  const pushUnique = (item: PrioritizedMemoryHighlight) => {
    const key = item.text.trim().toLowerCase();
    if (!key || seen.has(key)) return;
    seen.add(key);
    pinned.push(item);
  };

  for (const line of input.allergyLines ?? []) {
    const text = line.trim();
    if (!text) continue;
    pushUnique({
      id: `allergy-${text}`,
      text: `Alergia: ${text}`,
      tier: "allergy",
    });
  }

  for (const alert of input.alerts ?? []) {
    if (alert.severity === "critical") {
      pushUnique({
        id: `alert-critical-${alert.code}`,
        text: alert.message.trim(),
        tier: isAllergyAlert(alert) ? "allergy" : "critical",
      });
      continue;
    }
    if (alert.severity === "warning") {
      pushUnique({
        id: `alert-warning-${alert.code}`,
        text: alert.message.trim(),
        tier: "high_risk",
      });
    }
  }

  const standard: PrioritizedMemoryHighlight[] = [];
  for (const line of input.highlights) {
    const text = line.trim();
    if (!text) continue;
    const key = text.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const tier: MemoryHighlightTier = isAllergyHighlight(text)
      ? "allergy"
      : /riesgo crítico no identificado/i.test(text)
        ? "standard"
        : /alerta clínica|laboratorios pendientes/i.test(text)
          ? "high_risk"
          : "standard";
    if (tier !== "standard") {
      pushUnique({ id: `highlight-${text}`, text, tier });
    } else {
      standard.push({ id: `highlight-${text}`, text, tier });
    }
  }

  const ordered = [
    ...pinned.sort((a, b) => tierRank(a.tier) - tierRank(b.tier)),
    ...standard,
  ];

  const mustShow = ordered.filter((h) => h.tier !== "standard");
  const flexible = ordered.filter((h) => h.tier === "standard");
  const visibleFlexible = Math.max(0, slots - mustShow.length);
  const visible = [...mustShow, ...flexible.slice(0, visibleFlexible)];
  const overflow = flexible.slice(visibleFlexible);

  return { visible, overflow };
}
