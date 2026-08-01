/**
 * AEC-1 M6.1–M6.3 — Assist Orchestrator (pure SSOT).
 *
 * Owns: provider registration, ordering, priority, conflict resolution,
 * progressive disclosure policy, fatigue policy, expand/collapse soft-cap,
 * MODEL vs DETERMINISTIC visibility, render composition plan.
 *
 * M6.3: LiquidAssistPlane / W5 / CopilotPresence must not invent disclosure
 * or fatigue defaults — consume plan fields from here.
 *
 * Does NOT own AUTHORITY (HAB / PE / COS) — outside Assist rendering.
 * EXTERNAL is an interface extension point only (no runtime provider).
 */

import {
  LIQUID_URGENCY_RANK,
  liquidAssistDisclosure,
  type LiquidEncounterPhase,
} from "@/lib/aec1/liquid-composition";

/** AI planes that may contribute to Assist. AUTHORITY is never a provider here. */
export type AssistProviderSourceClass =
  | "MODEL"
  | "DETERMINISTIC"
  | "EXTERNAL";

/** First-class planes (design). AUTHORITY is known for conflict but not rendered by Assist. */
export type AssistAiPlane = AssistProviderSourceClass | "AUTHORITY";

export type AssistDisclosure = "hidden" | "collapsed" | "expanded";

export type AssistCardKind =
  | "deterministic_advisory"
  | "model_presence"
  | "external";

export type AssistCard = {
  id: string;
  sourceClass: AssistProviderSourceClass;
  kind: AssistCardKind;
  /** Higher = earlier. Prefer LIQUID_URGENCY_RANK values. */
  urgencyRank: number;
  title?: string;
  summary?: string;
  /** Optional theme key for conflict resolution (DETERMINISTIC wins MODEL). */
  themeId?: string;
};

export type AssistOrchestratorContext = {
  phase: LiquidEncounterPhase;
  consultationId?: string;
};

/**
 * Provider contract. M6.1 registers MODEL + DETERMINISTIC.
 * EXTERNAL remains type-level only — do not register at runtime.
 */
export type AssistProvider = {
  sourceClass: AssistProviderSourceClass;
  /** Contribute cards for orchestration. Empty = registered but silent (e.g. MODEL in M6.1). */
  contribute: (ctx: AssistOrchestratorContext) => AssistCard[];
};

export type AssistFatiguePolicy = {
  /** Soft-cap for Assist stream / DETERMINISTIC list (expanded). */
  maxVisible: number;
  /**
   * Soft-cap when Assist disclosure is collapsed.
   * Defaults to maxVisible — collapsed UX stays summary-first (W5), not a
   * second competing list policy.
   */
  collapsedMaxVisible?: number;
};

export const DEFAULT_ASSIST_FATIGUE: AssistFatiguePolicy = {
  maxVisible: 5,
  collapsedMaxVisible: 5,
};

function fatigueCollapsedMax(policy: AssistFatiguePolicy): number {
  return policy.collapsedMaxVisible ?? policy.maxVisible;
}

/** Resolve effective soft-cap for a disclosure state (SSOT). */
export function resolveAssistFatigueMaxVisible(
  disclosure: AssistDisclosure,
  policy: AssistFatiguePolicy = DEFAULT_ASSIST_FATIGUE,
): number {
  if (disclosure === "hidden") return 0;
  if (disclosure === "collapsed") return fatigueCollapsedMax(policy);
  return policy.maxVisible;
}

/** Source tie-break when urgencyRank is equal (higher first). */
export const ASSIST_SOURCE_PRIORITY: Record<AssistProviderSourceClass, number> =
  {
    DETERMINISTIC: 30,
    MODEL: 20,
    EXTERNAL: 10,
  };

export const ASSIST_ORCHESTRATOR_ASSERTIONS = {
  ssot: "AssistOrchestrator",
  authorityOutsideAssistRender: true,
  externalInterfaceOnly: true,
  noSecondChat: true,
  noWriteBack: true,
  assistNeverConfirmsOrEmits: true,
  maxOneModelPresence: true,
  disclosureAndFatigueSsot: true,
} as const;

/** Stable id for the single MODEL Copilot presence contribution. */
export const COPILOT_PRESENCE_CARD_ID = "copilot-presence" as const;

export function createCopilotPresenceCard(): AssistCard {
  return {
    id: COPILOT_PRESENCE_CARD_ID,
    sourceClass: "MODEL",
    kind: "model_presence",
    urgencyRank: LIQUID_URGENCY_RANK.model_suggestion,
    title: "Clinical Copilot",
    summary: "Asistencia generativa (MODEL) · provisional",
  };
}

/** Enforce maximum one MODEL presence card in the stream. */
export function enforceSingleModelPresence(
  cards: readonly AssistCard[],
): AssistCard[] {
  let seenModelPresence = false;
  const out: AssistCard[] = [];
  for (const card of cards) {
    const isPresence =
      card.sourceClass === "MODEL" && card.kind === "model_presence";
    if (isPresence) {
      if (seenModelPresence) continue;
      seenModelPresence = true;
    }
    out.push(card);
  }
  return out;
}

const SOURCE_ORDER_FOR_RENDER: AssistProviderSourceClass[] = [
  "DETERMINISTIC",
  "MODEL",
  "EXTERNAL",
];

export function createAssistProviderRegistry(
  providers: readonly AssistProvider[] = [],
): Map<AssistProviderSourceClass, AssistProvider> {
  const map = new Map<AssistProviderSourceClass, AssistProvider>();
  for (const p of providers) {
    if (p.sourceClass === "EXTERNAL") {
      // EXTENSION POINT ONLY — refuse runtime EXTERNAL registration in M6.1.
      continue;
    }
    map.set(p.sourceClass, p);
  }
  return map;
}

/** Default providers: DETERMINISTIC (W5 mount) + MODEL (single CopilotPresence). */
export function createDefaultAssistProviders(): AssistProvider[] {
  return [
    {
      sourceClass: "DETERMINISTIC",
      contribute: () => [],
    },
    {
      sourceClass: "MODEL",
      contribute: () => [createCopilotPresenceCard()],
    },
  ];
}

export function resolveAssistDisclosure(
  phase: LiquidEncounterPhase,
): AssistDisclosure {
  return liquidAssistDisclosure(phase);
}

export function compareAssistCards(a: AssistCard, b: AssistCard): number {
  if (b.urgencyRank !== a.urgencyRank) return b.urgencyRank - a.urgencyRank;
  const src =
    ASSIST_SOURCE_PRIORITY[b.sourceClass] - ASSIST_SOURCE_PRIORITY[a.sourceClass];
  if (src !== 0) return src;
  return a.id.localeCompare(b.id);
}

/**
 * Conflict resolution:
 * - AUTHORITY never appears in Assist card lists (caller must not pass them).
 * - Same themeId: DETERMINISTIC wins; MODEL/EXTERNAL dropped.
 * - safety_hab / clinical_alert ranks are not Assist-owned; strip if leaked.
 */
export function resolveAssistConflicts(cards: readonly AssistCard[]): AssistCard[] {
  // AUTHORITY / interrupt ranks are outside Assist rendering.
  const filtered = cards.filter(
    (c) => c.urgencyRank < LIQUID_URGENCY_RANK.clinical_alert,
  );

  const byTheme = new Map<string, AssistCard>();
  const unthemed: AssistCard[] = [];

  for (const card of filtered) {
    const theme = card.themeId?.trim();
    if (!theme) {
      unthemed.push(card);
      continue;
    }
    const existing = byTheme.get(theme);
    if (!existing) {
      byTheme.set(theme, card);
      continue;
    }
    // DETERMINISTIC wins MODEL/EXTERNAL on same theme
    if (
      ASSIST_SOURCE_PRIORITY[card.sourceClass] >
      ASSIST_SOURCE_PRIORITY[existing.sourceClass]
    ) {
      byTheme.set(theme, card);
    }
  }

  return [...byTheme.values(), ...unthemed];
}

/**
 * Fatigue: keep top N by urgency; drop MODEL/EXTERNAL before DETERMINISTIC
 * when trimming beyond soft-cap (anti-fatigue).
 */
export function applyAssistFatigue(
  cards: readonly AssistCard[],
  policy: AssistFatiguePolicy = DEFAULT_ASSIST_FATIGUE,
): { visible: AssistCard[]; hiddenCount: number } {
  const ordered = [...cards].sort(compareAssistCards);
  if (ordered.length <= policy.maxVisible) {
    return { visible: ordered, hiddenCount: 0 };
  }

  // Prefer keeping DETERMINISTIC when cutting from the tail of lower urgency.
  const keep: AssistCard[] = [];
  const deferredModel: AssistCard[] = [];

  for (const card of ordered) {
    if (card.sourceClass === "DETERMINISTIC") {
      if (keep.length < policy.maxVisible) keep.push(card);
    } else {
      deferredModel.push(card);
    }
  }
  for (const card of deferredModel) {
    if (keep.length < policy.maxVisible) keep.push(card);
  }

  const visible = keep.sort(compareAssistCards);
  return {
    visible,
    hiddenCount: Math.max(0, ordered.length - visible.length),
  };
}

export type AssistRenderSlot =
  | { slot: "deterministic"; sourceClass: "DETERMINISTIC" }
  | { slot: "model_presence"; sourceClass: "MODEL"; enabled: boolean }
  | { slot: "external"; sourceClass: "EXTERNAL"; enabled: false };

export type AssistOrchestrationPlan = {
  disclosure: AssistDisclosure;
  /** Host plane should mount Assist content (false when degraded/hidden). */
  planeVisible: boolean;
  /** Compact chrome (collapsed disclosure). */
  compact: boolean;
  /** Whether expanded list UI + expand/more controls apply. */
  expandList: boolean;
  fatigue: AssistFatiguePolicy;
  /** Soft-cap for DETERMINISTIC W5 list (and stream) for this disclosure. */
  deterministicMaxVisible: number;
  showDeterministicSlot: boolean;
  showModelPresence: boolean;
  registeredSources: AssistProviderSourceClass[];
  cards: AssistCard[];
  visibleCards: AssistCard[];
  hiddenCount: number;
  /** Render composition — AUTHORITY never included. */
  renderSlots: AssistRenderSlot[];
  assertions: typeof ASSIST_ORCHESTRATOR_ASSERTIONS;
};

/**
 * Full orchestration pass (pure) — SSOT for disclosure + fatigue + visibility.
 * DETERMINISTIC UI still mounts W5AdvisoryCards (live fetch) with
 * `deterministicMaxVisible` from this plan.
 * MODEL contributes at most one CopilotPresence card (M6.2).
 */
export function planAssistOrchestration(input: {
  phase: LiquidEncounterPhase;
  consultationId?: string;
  providers?: readonly AssistProvider[];
  /** Extra cards (tests / future providers). Merged with provider contribute(). */
  cards?: readonly AssistCard[];
  fatigue?: AssistFatiguePolicy;
}): AssistOrchestrationPlan {
  const disclosure = resolveAssistDisclosure(input.phase);
  const fatigue = input.fatigue ?? DEFAULT_ASSIST_FATIGUE;
  const planeVisible = disclosure !== "hidden";
  const compact = disclosure === "collapsed";
  const expandList = disclosure === "expanded";
  const deterministicMaxVisible = resolveAssistFatigueMaxVisible(
    disclosure,
    fatigue,
  );

  const registry = createAssistProviderRegistry(
    input.providers ?? createDefaultAssistProviders(),
  );
  const registeredSources = SOURCE_ORDER_FOR_RENDER.filter((s) =>
    registry.has(s),
  );

  const ctx: AssistOrchestratorContext = {
    phase: input.phase,
    consultationId: input.consultationId,
  };

  const contributed: AssistCard[] = [];
  for (const source of registeredSources) {
    const provider = registry.get(source);
    if (!provider) continue;
    contributed.push(...provider.contribute(ctx));
  }
  if (input.cards?.length) {
    contributed.push(...input.cards);
  }

  const capped = enforceSingleModelPresence(contributed);
  const resolved = resolveAssistConflicts(capped);
  const ordered = [...resolved].sort(compareAssistCards);
  const { visible, hiddenCount } = applyAssistFatigue(
    planeVisible ? ordered : [],
    {
      maxVisible: deterministicMaxVisible,
      collapsedMaxVisible: fatigueCollapsedMax(fatigue),
    },
  );

  const showModelPresence =
    planeVisible &&
    visible.some(
      (c) => c.sourceClass === "MODEL" && c.kind === "model_presence",
    );
  const showDeterministicSlot = planeVisible && registry.has("DETERMINISTIC");

  const renderSlots: AssistRenderSlot[] = [];
  if (registry.has("DETERMINISTIC")) {
    renderSlots.push({ slot: "deterministic", sourceClass: "DETERMINISTIC" });
  }
  if (registry.has("MODEL")) {
    renderSlots.push({
      slot: "model_presence",
      sourceClass: "MODEL",
      enabled: showModelPresence,
    });
  }

  return {
    disclosure,
    planeVisible,
    compact,
    expandList,
    fatigue,
    deterministicMaxVisible,
    showDeterministicSlot,
    showModelPresence,
    registeredSources,
    cards: ordered,
    visibleCards: visible,
    hiddenCount,
    renderSlots,
    assertions: ASSIST_ORCHESTRATOR_ASSERTIONS,
  };
}

export function urgencyForSource(
  sourceClass: AssistProviderSourceClass,
): number {
  if (sourceClass === "DETERMINISTIC") {
    return LIQUID_URGENCY_RANK.deterministic_intel;
  }
  if (sourceClass === "MODEL") {
    return LIQUID_URGENCY_RANK.model_suggestion;
  }
  return LIQUID_URGENCY_RANK.ambient_analytics;
}
