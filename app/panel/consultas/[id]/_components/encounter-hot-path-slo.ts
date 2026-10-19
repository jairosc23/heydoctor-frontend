import { DISCLOSURE_PREVIEW_SECTION_COUNT } from "./encounter-hot-path";

/**
 * E5: SLO of the E4 hot path. CIP / Knowledge / Spine hops are traced only
 * as disclosure GET previews — never as rail peers and never as alerts.
 */

export const HOT_PATH_SLO_PHASES = ["open", "soap", "offer", "sign"] as const;

export type HotPathSloPhase = (typeof HOT_PATH_SLO_PHASES)[number];

/** Encounter-open UX budgets. Not HAB persist duration and not E11 emit. */
export const ENCOUNTER_HOT_PATH_SLO_BUDGET_MS = {
  open: 2000,
  soap: 2000,
  offer: 2500,
  sign: 2000,
} as const;

export const ENCOUNTER_HOT_PATH_SLO_TIMEOUT_MS = 8000;

export const ENCOUNTER_HOT_PATH_SLO_SELECTORS: Record<HotPathSloPhase, string> =
  {
    open: '[data-testid="encounter-hot-path"]',
    soap: '[data-testid="encounter-hot-path"]',
    offer: '[data-testid="encounter-offer"]',
    sign: "#encounter-section-20",
  };

const HOT_PATH_SAMPLE_CAP = 64;
const CIP_HOP_SAMPLE_CAP = 128;

/**
 * Longest prefixes first so knowledge-* hops do not collapse to knowledge.
 * All 23 constitutional GET previews; require `/preview` (GET-only).
 */
export const CIP_DISCLOSURE_HOPS = [
  "clinical-knowledge-grounding",
  "clinical-knowledge-engine",
  "clinical-knowledge-jurisdiction",
  "clinical-knowledge-federation",
  "clinical-scientific-governance",
  "clinical-knowledge",
  "clinical-evidence",
  "clinical-reentry",
  "clinical-learning",
  "clinical-execution",
  "human-decision",
  "clinical-governance",
  "clinical-outcomes",
  "clinical-recommendation",
  "clinical-reasoning",
  "clinical-understanding",
  "clinical-rules",
  "longitudinal-records",
  "clinical-artifacts",
  "clinical-authority",
  "clinical-decisions",
  "clinical-orders",
  "clinical-documents",
] as const;

export type CipDisclosureHop = (typeof CIP_DISCLOSURE_HOPS)[number];

export type EncounterHotPathSloEvaluation = {
  phase: HotPathSloPhase;
  durationMs: number;
  budgetMs: number;
  p95Ms: number;
  sampleCount: number;
  ok: boolean;
  onHotPath: true;
  alertable: true;
};

export type CipHopEvaluation = {
  hop: CipDisclosureHop;
  durationMs: number;
  onHotPath: false;
  alertable: false;
};

function percentile(sortedAsc: number[], p: number): number {
  if (!sortedAsc.length) return 0;
  const idx = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.ceil((p / 100) * sortedAsc.length) - 1),
  );
  return sortedAsc[idx];
}

const hotPathSamples: Record<HotPathSloPhase, number[]> = {
  open: [],
  soap: [],
  offer: [],
  sign: [],
};

const cipHopSamples: Array<{ hop: CipDisclosureHop; durationMs: number }> = [];

export type EncounterWebVitalName = "CLS" | "INP" | "LCP";

export type EncounterWebVitalSample = {
  name: EncounterWebVitalName;
  value: number;
  onHotPath: true;
  alertable: false;
};

const webVitalSamples: EncounterWebVitalSample[] = [];
const WEB_VITAL_SAMPLE_CAP = 64;

function pushCapped(buffer: number[], value: number, cap: number): void {
  buffer.push(value);
  if (buffer.length > cap) buffer.shift();
}

export function __resetEncounterHotPathSloForTests(): void {
  hotPathSamples.open.length = 0;
  hotPathSamples.soap.length = 0;
  hotPathSamples.offer.length = 0;
  hotPathSamples.sign.length = 0;
  cipHopSamples.length = 0;
  webVitalSamples.length = 0;
}

export function extractRequestPath(url: string): string {
  try {
    if (/^https?:\/\//i.test(url)) {
      return new URL(url).pathname;
    }
  } catch {
    /* fall through */
  }
  const cut = url.search(/[?#]/);
  return cut >= 0 ? url.slice(0, cut) : url;
}

export function classifyCipHopFromPath(url: string): CipDisclosureHop | null {
  const path = extractRequestPath(url);
  if (!path.includes("/preview")) return null;
  for (const hop of CIP_DISCLOSURE_HOPS) {
    if (path.includes(`/${hop}/`)) return hop;
  }
  return null;
}

export function evaluateEncounterHotPathSlo(input: {
  phase: HotPathSloPhase;
  durationMs: number;
  samples?: readonly number[];
}): EncounterHotPathSloEvaluation {
  const budgetMs = ENCOUNTER_HOT_PATH_SLO_BUDGET_MS[input.phase];
  const series = [...(input.samples ?? hotPathSamples[input.phase])].sort(
    (a, b) => a - b,
  );
  const p95Ms = percentile(series, 95);
  const ok =
    input.durationMs <= budgetMs && (series.length < 1 || p95Ms <= budgetMs);
  return {
    phase: input.phase,
    durationMs: input.durationMs,
    budgetMs,
    p95Ms,
    sampleCount: series.length,
    ok,
    onHotPath: true,
    alertable: true,
  };
}

export function recordEncounterHotPathSample(
  phase: HotPathSloPhase,
  durationMs: number,
): EncounterHotPathSloEvaluation {
  pushCapped(hotPathSamples[phase], durationMs, HOT_PATH_SAMPLE_CAP);
  return evaluateEncounterHotPathSlo({
    phase,
    durationMs,
    samples: hotPathSamples[phase],
  });
}

export function evaluateCipHop(input: {
  hop: CipDisclosureHop;
  durationMs: number;
}): CipHopEvaluation {
  return {
    hop: input.hop,
    durationMs: input.durationMs,
    onHotPath: false,
    alertable: false,
  };
}

export function recordCipHop(input: {
  hop: CipDisclosureHop;
  durationMs: number;
}): CipHopEvaluation {
  cipHopSamples.push({ hop: input.hop, durationMs: input.durationMs });
  if (cipHopSamples.length > CIP_HOP_SAMPLE_CAP) cipHopSamples.shift();
  return evaluateCipHop(input);
}

export function ingestCipResourceEntries(
  entries: ReadonlyArray<{ name: string; duration: number }>,
): CipHopEvaluation[] {
  const recorded: CipHopEvaluation[] = [];
  for (const entry of entries) {
    const hop = classifyCipHopFromPath(entry.name);
    if (!hop) continue;
    recorded.push(recordCipHop({ hop, durationMs: entry.duration }));
  }
  return recorded;
}

export function recordEncounterWebVital(input: {
  name: EncounterWebVitalName;
  value: number;
}): EncounterWebVitalSample {
  const sample: EncounterWebVitalSample = {
    name: input.name,
    value: input.value,
    onHotPath: true,
    alertable: false,
  };
  webVitalSamples.push(sample);
  if (webVitalSamples.length > WEB_VITAL_SAMPLE_CAP) webVitalSamples.shift();
  return sample;
}

export function createEncounterWebVitalsWatch(
  input: {
    onSample?: (sample: EncounterWebVitalSample) => void;
  } = {},
): { disconnect(): void } {
  if (typeof PerformanceObserver === "undefined") {
    return { disconnect() {} };
  }
  const observers: PerformanceObserver[] = [];
  const observe = (type: string, handle: (entry: PerformanceEntry) => void) => {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) handle(entry);
      });
      observer.observe({ type, buffered: true });
      observers.push(observer);
    } catch {
      /* Browser may not expose this entry type. */
    }
  };

  observe("layout-shift", (entry) => {
    const shift = entry as PerformanceEntry & {
      value?: number;
      hadRecentInput?: boolean;
    };
    if (shift.hadRecentInput) return;
    const sample = recordEncounterWebVital({
      name: "CLS",
      value: Number(shift.value ?? 0),
    });
    input.onSample?.(sample);
  });
  observe("event", (entry) => {
    const event = entry as PerformanceEntry & { duration?: number };
    const sample = recordEncounterWebVital({
      name: "INP",
      value: Number(event.duration ?? entry.duration ?? 0),
    });
    input.onSample?.(sample);
  });
  observe("largest-contentful-paint", (entry) => {
    const sample = recordEncounterWebVital({
      name: "LCP",
      value: Number(entry.startTime ?? 0),
    });
    input.onSample?.(sample);
  });

  return {
    disconnect() {
      for (const observer of observers) observer.disconnect();
      observers.length = 0;
    },
  };
}

export function snapshotEncounterHotPathSlo(): {
  hotPath: Record<
    HotPathSloPhase,
    { count: number; p95Ms: number; budgetMs: number }
  >;
  cipHops: { count: number; hops: readonly CipDisclosureHop[] };
  webVitals: { count: number; alertable: false };
  disclosurePreviewSectionCount: number;
} {
  const hotPath = {} as Record<
    HotPathSloPhase,
    { count: number; p95Ms: number; budgetMs: number }
  >;
  for (const phase of HOT_PATH_SLO_PHASES) {
    const sorted = [...hotPathSamples[phase]].sort((a, b) => a - b);
    hotPath[phase] = {
      count: sorted.length,
      p95Ms: percentile(sorted, 95),
      budgetMs: ENCOUNTER_HOT_PATH_SLO_BUDGET_MS[phase],
    };
  }
  return {
    hotPath,
    cipHops: {
      count: cipHopSamples.length,
      hops: cipHopSamples.map((sample) => sample.hop),
    },
    webVitals: { count: webVitalSamples.length, alertable: false },
    disclosurePreviewSectionCount: DISCLOSURE_PREVIEW_SECTION_COUNT,
  };
}

export function createEncounterHotPathSloWatch(input: {
  startedAtMs: number;
  timeoutMs?: number;
}): {
  observe(
    nowMs: number,
    isPresent: (phase: HotPathSloPhase) => boolean,
  ): {
    done: boolean;
    samples: Array<{
      phase: HotPathSloPhase;
      durationMs: number;
      timedOut: boolean;
    }>;
  };
} {
  const pending = new Set<HotPathSloPhase>(HOT_PATH_SLO_PHASES);
  const timeoutMs = input.timeoutMs ?? ENCOUNTER_HOT_PATH_SLO_TIMEOUT_MS;
  return {
    observe(nowMs, isPresent) {
      const durationMs = Math.max(0, nowMs - input.startedAtMs);
      const timedOut = durationMs >= timeoutMs;
      const samples: Array<{
        phase: HotPathSloPhase;
        durationMs: number;
        timedOut: boolean;
      }> = [];
      for (const phase of HOT_PATH_SLO_PHASES) {
        if (!pending.has(phase)) continue;
        const present = isPresent(phase);
        if (!present && !timedOut) continue;
        pending.delete(phase);
        samples.push({
          phase,
          durationMs,
          timedOut: timedOut && !present,
        });
      }
      return { done: pending.size === 0, samples };
    },
  };
}
