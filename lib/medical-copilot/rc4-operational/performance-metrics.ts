/**
 * RC4 — internal FE performance metrics (no external observability).
 */

type Sample = { name: string; ms: number; at: number };

const renders: Sample[] = [];
const lazyLoads: Sample[] = [];
const hydrations: Sample[] = [];
const packageHydrations: Sample[] = [];
const MAX = 500;

function push(arr: Sample[], sample: Sample) {
  arr.push(sample);
  if (arr.length > MAX) arr.splice(0, arr.length - MAX);
}

export function recordRc4Render(name: string, ms: number): void {
  push(renders, { name, ms, at: Date.now() });
}

export function recordRc4LazyLoad(name: string, ms: number): void {
  push(lazyLoads, { name, ms, at: Date.now() });
}

export function recordRc4Hydration(name: string, ms: number): void {
  push(hydrations, { name, ms, at: Date.now() });
}

export function recordRc4PackageHydration(name: string, ms: number): void {
  push(packageHydrations, { name, ms, at: Date.now() });
}

function avg(arr: Sample[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b.ms, 0) / arr.length;
}

function max(arr: Sample[]): number {
  if (!arr.length) return 0;
  return Math.max(...arr.map((s) => s.ms));
}

export type Rc4FePerformanceSnapshot = {
  renderCount: number;
  renderAvgMs: number;
  renderMaxMs: number;
  lazyLoadCount: number;
  lazyLoadAvgMs: number;
  hydrationCount: number;
  hydrationAvgMs: number;
  packageHydrationCount: number;
  packageHydrationAvgMs: number;
};

export function snapshotRc4FePerformance(): Rc4FePerformanceSnapshot {
  return {
    renderCount: renders.length,
    renderAvgMs: avg(renders),
    renderMaxMs: max(renders),
    lazyLoadCount: lazyLoads.length,
    lazyLoadAvgMs: avg(lazyLoads),
    hydrationCount: hydrations.length,
    hydrationAvgMs: avg(hydrations),
    packageHydrationCount: packageHydrations.length,
    packageHydrationAvgMs: avg(packageHydrations),
  };
}

export function __rc4ClearFeMetricsForTests(): void {
  renders.length = 0;
  lazyLoads.length = 0;
  hydrations.length = 0;
  packageHydrations.length = 0;
}
