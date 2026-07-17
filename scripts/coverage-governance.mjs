#!/usr/bin/env node
/**
 * PQ-03 — Coverage governance reporter (Frontend / component layer).
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const cfg = JSON.parse(
  readFileSync(join(root, "coverage-governance.config.json"), "utf8"),
);

const layer = cfg.layers.component;
const summaryPath = join(root, layer.summaryPath);
const floors = layer.softFloors ?? {};

let metrics = { lines: null, statements: null, functions: null, branches: null };
let violations = [];

if (!existsSync(summaryPath)) {
  console.error(
    `[coverage-governance] Missing ${layer.summaryPath}. Run: npm run test:component:cov`,
  );
} else {
  const summary = JSON.parse(readFileSync(summaryPath, "utf8"));
  const total = summary.total ?? {};
  const pct = (key) => Number(total[key]?.pct ?? 0);
  metrics = {
    lines: pct("lines"),
    statements: pct("statements"),
    functions: pct("functions"),
    branches: pct("branches"),
  };
  for (const [key, floor] of Object.entries(floors)) {
    if (metrics[key] < Number(floor)) {
      violations.push(`${key}: ${metrics[key]}% < floor ${floor}%`);
    }
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  mode: cfg.mode,
  enforce: process.env.COVERAGE_ENFORCE === "1",
  layers: {
    component: { metrics, softFloors: floors, scope: layer.scope },
    unit_lib: cfg.layers.unit_lib,
    e2e_playwright: cfg.layers.e2e_playwright,
  },
  violations,
  proposedProgressiveFloors: cfg.proposedProgressiveFloors,
  exclusionsCount: (cfg.exclusions ?? []).length,
  status:
    metrics.lines === null
      ? "NO_REPORT"
      : violations.length === 0
        ? "PASS"
        : process.env.COVERAGE_ENFORCE === "1"
          ? "FAIL"
          : "WARN_SOFT",
};

const outPath = join(root, cfg.reportOutputPath);
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, JSON.stringify(report, null, 2));

console.log("## Coverage governance (PQ-03 / Frontend)");
console.log(
  metrics.lines === null
    ? "component coverage: (no summary yet)"
    : `component lines=${metrics.lines}% statements=${metrics.statements}% functions=${metrics.functions}% branches=${metrics.branches}%`,
);
console.log(`mode=${cfg.mode} status=${report.status}`);
console.log(`report: ${cfg.reportOutputPath}`);

if (report.status === "FAIL") process.exit(1);
process.exit(0);
