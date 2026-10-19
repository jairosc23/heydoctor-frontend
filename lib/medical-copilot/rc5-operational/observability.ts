import { snapshotRc4FePerformance } from "../rc4-operational/performance-metrics";

export function percentile(sortedAsc: number[], p: number): number {
  if (!sortedAsc.length) return 0;
  const idx = Math.min(
    sortedAsc.length - 1,
    Math.max(0, Math.ceil((p / 100) * sortedAsc.length) - 1),
  );
  return sortedAsc[idx];
}

const packageResolutionMs: number[] = [];
const lazyHydrationMs: number[] = [];
let inflightGets = 0;
let peakInflightGets = 0;

export function rc5TrackGetStart(): void {
  inflightGets += 1;
  peakInflightGets = Math.max(peakInflightGets, inflightGets);
}

export function rc5TrackGetEnd(): void {
  inflightGets = Math.max(0, inflightGets - 1);
}

export function recordRc5PackageResolution(ms: number): void {
  packageResolutionMs.push(ms);
  if (packageResolutionMs.length > 500) packageResolutionMs.shift();
}

export function recordRc5LazyHydration(ms: number): void {
  lazyHydrationMs.push(ms);
  if (lazyHydrationMs.length > 500) lazyHydrationMs.shift();
}

export function snapshotRc5FeObservability() {
  const sortedPkg = [...packageResolutionMs].sort((a, b) => a - b);
  const sortedLazy = [...lazyHydrationMs].sort((a, b) => a - b);
  const rc4 = snapshotRc4FePerformance();
  return {
    packageResolution: {
      p50: percentile(sortedPkg, 50),
      p95: percentile(sortedPkg, 95),
      p99: percentile(sortedPkg, 99),
      count: sortedPkg.length,
    },
    lazyHydration: {
      p50: percentile(sortedLazy, 50),
      p95: percentile(sortedLazy, 95),
      p99: percentile(sortedLazy, 99),
      count: sortedLazy.length,
    },
    requestConcurrency: { active: inflightGets, peak: peakInflightGets },
    rc4,
  };
}

export function __rc5ClearFeObservabilityForTests(): void {
  packageResolutionMs.length = 0;
  lazyHydrationMs.length = 0;
  inflightGets = 0;
  peakInflightGets = 0;
}
