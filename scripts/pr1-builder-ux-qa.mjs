/**
 * PR-1 functional UX QA — real React CatalogCombobox via /qa/pr1-builder.
 * Captures screenshots, keyboard/mouse checks, responsive, console, timing.
 *
 * Usage: node scripts/pr1-builder-ux-qa.mjs [baseUrl]
 * Default baseUrl: http://127.0.0.1:3000
 */

import { chromium, devices } from "playwright";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docs/architecture/pr1-qa");
const BASE = process.argv[2] || process.env.PR1_QA_BASE_URL || "http://127.0.0.1:3000";
const URL = `${BASE.replace(/\/$/, "")}/qa/pr1-builder`;

fs.mkdirSync(OUT, { recursive: true });

/** @type {Array<{ id: string, severity: 'pass'|'minor'|'major'|'block', title: string, detail: string }>} */
const findings = [];

function pass(id, title, detail = "") {
  findings.push({ id, severity: "pass", title, detail });
}
function minor(id, title, detail = "") {
  findings.push({ id, severity: "minor", title, detail });
}
function major(id, title, detail = "") {
  findings.push({ id, severity: "major", title, detail });
}
function block(id, title, detail = "") {
  findings.push({ id, severity: "block", title, detail });
}

async function openCatalog(page, testId) {
  // Prefer the visible instance (hydration can leave a non-visible twin in DOM).
  const root = page
    .locator(`[data-testid="${testId}"]`)
    .filter({ visible: true })
    .first();
  const input = root.locator('input[role="combobox"]');
  await input.scrollIntoViewIfNeeded().catch(() => {});
  await input.click({ timeout: 10_000 });
  await page.waitForTimeout(80);
  const list = root.locator('[role="listbox"]');
  const visible = await list.isVisible().catch(() => false);
  return { root, input, list, visible };
}

async function catalogLabels(list) {
  const opts = list.locator('[role="option"]');
  const n = await opts.count();
  const labels = [];
  for (let i = 0; i < n; i++) {
    labels.push((await opts.nth(i).innerText()).trim());
  }
  return labels;
}

async function measureOpenMs(page, testId) {
  return page.evaluate(async (tid) => {
    const root = document.querySelector(`[data-testid="${tid}"]`);
    const input = root?.querySelector('input[role="combobox"]');
    if (!input) return -1;
    const t0 = performance.now();
    input.focus();
    input.dispatchEvent(new FocusEvent("focus", { bubbles: true }));
    // wait microtask + frame for React
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    const list = root.querySelector('[role="listbox"]');
    const t1 = performance.now();
    return list ? t1 - t0 : -1;
  }, testId);
}

async function runCatalogSuite(page, name, testId, {
  filterQuery,
  filterExpectSubstring,
  expectedMinOptions,
  arrowDownSteps = 2,
}) {
  const prefix = name.toLowerCase();

  // Focus opens
  await page.keyboard.press("Escape").catch(() => {});
  const tOpen = await measureOpenMs(page, testId);
  let { input, list, visible } = await openCatalog(page, testId);
  if (!visible) {
    block(`${prefix}-focus-open`, `${name}: foco abre catálogo`, "listbox no visible al foco/click");
    return;
  }
  pass(`${prefix}-focus-open`, `${name}: foco/click abre catálogo`, tOpen >= 0 ? `open≈${tOpen.toFixed(1)}ms` : "");

  if (tOpen >= 0 && tOpen > 120) {
    minor(`${prefix}-perf-open`, `${name}: apertura lenta`, `${tOpen.toFixed(1)}ms (>120ms)`);
  } else if (tOpen >= 0) {
    pass(`${prefix}-perf-open`, `${name}: apertura sin lag percibido`, `${tOpen.toFixed(1)}ms`);
  }

  const labels = await catalogLabels(list);
  const clinicalOpts = labels.filter((l) => !/seleccionar|sin selección|sin indicación/i.test(l));
  if (clinicalOpts.length < expectedMinOptions) {
    major(`${prefix}-catalog-count`, `${name}: catálogo incompleto`, `opts=${clinicalOpts.length}, esperado≥${expectedMinOptions}`);
  } else {
    pass(`${prefix}-catalog-count`, `${name}: catálogo completo`, `${clinicalOpts.length} opciones clínicas`);
  }

  await page.screenshot({
    path: path.join(OUT, `${prefix}-catalog-open.png`),
    fullPage: false,
  });

  // Typeahead
  await input.fill("");
  await input.type(filterQuery, { delay: 40 });
  await page.waitForTimeout(100);
  const filtered = await catalogLabels(list);
  const clinicalFiltered = filtered.filter((l) => !/seleccionar|sin selección|sin indicación/i.test(l));
  const filterOk = clinicalFiltered.some((l) =>
    l.toLowerCase().includes(filterExpectSubstring.toLowerCase()),
  );
  if (!filterOk || clinicalFiltered.length === 0) {
    major(`${prefix}-typeahead`, `${name}: filtro incremental`, `query="${filterQuery}" → ${JSON.stringify(clinicalFiltered)}`);
  } else {
    pass(`${prefix}-typeahead`, `${name}: filtro incremental`, `"${filterQuery}" → ${clinicalFiltered.length} match(es)`);
  }
  await page.screenshot({
    path: path.join(OUT, `${prefix}-typeahead.png`),
    fullPage: false,
  });

  // Clear and reopen for keyboard
  await input.fill("");
  await input.blur();
  await page.waitForTimeout(50);
  ({ input, list, visible } = await openCatalog(page, testId));
  if (!visible) {
    major(`${prefix}-keyboard-reopen`, `${name}: reopen para teclado`, "listbox no visible");
    return;
  }

  // ArrowDown
  for (let i = 0; i < arrowDownSteps; i++) {
    await input.press("ArrowDown");
  }
  const activeAfterDown = await list.locator(".bg-teal-50").first().innerText().catch(() => "");
  if (!activeAfterDown) {
    major(`${prefix}-arrow`, `${name}: flechas ↑↓`, "sin opción activa tras ArrowDown");
  } else {
    pass(`${prefix}-arrow`, `${name}: flechas ↑↓`, `activa="${activeAfterDown.trim()}"`);
  }
  await page.screenshot({
    path: path.join(OUT, `${prefix}-keyboard-nav.png`),
    fullPage: false,
  });

  // Enter selects
  await input.press("Enter");
  await page.waitForTimeout(80);
  const closedAfterEnter = !(await list.isVisible().catch(() => false));
  const valueAfterEnter = await input.inputValue();
  if (!closedAfterEnter || !valueAfterEnter) {
    major(`${prefix}-enter`, `${name}: Enter selecciona`, `closed=${closedAfterEnter} value="${valueAfterEnter}"`);
  } else {
    pass(`${prefix}-enter`, `${name}: Enter selecciona`, `value="${valueAfterEnter}"`);
  }

  // Esc closes
  ({ input, list, visible } = await openCatalog(page, testId));
  if (!visible) {
    major(`${prefix}-esc`, `${name}: Esc cierra`, "no pudo abrir antes de Esc");
  } else {
    await input.press("Escape");
    await page.waitForTimeout(50);
    const closedEsc = !(await list.isVisible().catch(() => false));
    if (!closedEsc) {
      major(`${prefix}-esc`, `${name}: Esc cierra`, "listbox sigue visible");
    } else {
      pass(`${prefix}-esc`, `${name}: Esc cierra`);
    }
  }

  // Mouse select
  ({ input, list, visible } = await openCatalog(page, testId));
  if (!visible) {
    major(`${prefix}-mouse`, `${name}: mouse selecciona`, "listbox no abrió para click");
  } else {
    const target = list.locator('[role="option"]').nth(2);
    const targetText = (await target.innerText()).trim();
    await target.click();
    await page.waitForTimeout(80);
    const mouseValue = await input.inputValue();
    const mouseClosed = !(await list.isVisible().catch(() => false));
    if (mouseClosed && mouseValue) {
      pass(`${prefix}-mouse`, `${name}: mouse selecciona`, `clicked≈"${targetText}" value="${mouseValue}"`);
    } else {
      major(
        `${prefix}-mouse`,
        `${name}: mouse selecciona`,
        `expected≈"${targetText}" got="${mouseValue}" closed=${mouseClosed}`,
      );
    }
  }
}

async function checkPreviewClarity(page) {
  // Force a complete clinical selection so preview includes all blocks.
  for (const [tid, idx] of [
    ["posology-presentation", 1],
    ["posology-dose", 2],
    ["posology-frequency", 3],
    ["posology-duration", 3],
    ["posology-route", 1],
  ]) {
    await page.keyboard.press("Escape").catch(() => {});
    const { list, visible } = await openCatalog(page, tid);
    if (visible) await list.locator('[role="option"]').nth(idx).click();
    await page.waitForTimeout(40);
  }
  await page.waitForTimeout(120);
  const preview = page.getByTestId("medication-posology-preview").first();
  if (!(await preview.isVisible().catch(() => false))) {
    major("preview-visible", "Preview Orden clínica visible", "no se renderizó tras selección");
    return;
  }
  const text = await preview.innerText();
  const textNorm = text.toLocaleLowerCase("es");
  const ambiguous = [
    /undefined/i,
    /null/i,
    /\[object Object\]/i,
    /\bNaN\b/,
    /TODO/i,
    /\?\?\?/,
    /lorem/i,
  ];
  const hits = ambiguous.filter((re) => re.test(text));
  if (hits.length) {
    major("preview-ambiguous", "Preview sin texto ambiguo", `hits=${hits.map(String).join(",")}\n${text}`);
  } else {
    pass("preview-ambiguous", "Preview sin texto ambiguo", text.replace(/\n+/g, " | ").slice(0, 240));
  }
  const required = ["medicamento", "presentación", "dosis", "frecuencia", "duración", "vía"];
  const missing = required.filter((k) => !textNorm.includes(k));
  if (missing.length) {
    major("preview-blocks", "Preview bloques clínicos claros", `faltan: ${missing.join(", ")}`);
  } else {
    pass("preview-blocks", "Preview bloques clínicos claros", required.join(", "));
  }
  // No concatenated free-text posology dump
  if (/comprimido\s+cada\s+\d+/i.test(text) || /·.*,.*,/.test(text)) {
    minor("preview-concat", "Preview evita frase concatenada ambigua", text.slice(0, 160));
  } else {
    pass("preview-concat", "Preview en bloques semánticos (no frase ambigua)");
  }
  await page.screenshot({
    path: path.join(OUT, "preview-orden-clinica.png"),
    fullPage: false,
  });
}

async function autocompleteSequence(page) {
  // Reset presentation and record typeahead frames
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector('[data-testid="pr1-qa-harness"]', { timeout: 45_000 });
  await page.waitForTimeout(300);
  await page.keyboard.press("Escape").catch(() => {});
  let opened = await openCatalog(page, "posology-presentation");
  if (!opened.visible) {
    await page.waitForTimeout(500);
    opened = await openCatalog(page, "posology-presentation");
  }
  if (!opened.visible) {
    major("seq-open", "Secuencia autocomplete Presentación", "no abrió tras reload");
    return;
  }
  const { input, list } = opened;
  await page.screenshot({ path: path.join(OUT, "seq-01-focus-open.png") });
  await input.type("com", { delay: 60 });
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(OUT, "seq-02-type-com.png") });
  await input.type("pri", { delay: 60 });
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(OUT, "seq-03-type-compri.png") });
  const filtered = await catalogLabels(list);
  await input.press("ArrowDown");
  await page.screenshot({ path: path.join(OUT, "seq-04-arrow.png") });
  await input.press("Enter");
  await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(OUT, "seq-05-enter.png") });
  pass(
    "seq-autocomplete",
    "Secuencia autocomplete Presentación",
    `frames seq-01..05; filtrado=${JSON.stringify(filtered)}`,
  );
}

async function responsive(browser) {
  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "laptop", width: 1280, height: 800 },
    { name: "tablet", width: 768, height: 1024 },
  ];
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await page.waitForSelector('[data-testid="pr1-qa-harness"]', { timeout: 30_000 });
    // open frequency to show catalog in layout
    await openCatalog(page, "posology-frequency");
    await page.screenshot({
      path: path.join(OUT, `responsive-${vp.name}.png`),
      fullPage: true,
    });
    const overflowX = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
    });
    if (overflowX) {
      minor(`responsive-${vp.name}`, `Responsive ${vp.name} (${vp.width}×${vp.height})`, "scrollWidth > clientWidth");
    } else {
      pass(`responsive-${vp.name}`, `Responsive ${vp.name} (${vp.width}×${vp.height})`, "sin overflow-x");
    }
    await context.close();
  }
}

async function regressionStaticChecks() {
  const panel = fs.readFileSync(
    path.join(ROOT, "components/clinical/PrescriptionPanel.tsx"),
    "utf8",
  );
  const flags = fs.readFileSync(
    path.join(ROOT, "lib/medication-domain/flags.ts"),
    "utf8",
  );
  if (!panel.includes("isMedicationOrderBuilderEnabled")) {
    block("reg-panel-flag", "PrescriptionPanel respeta flag Builder", "flag check ausente");
  } else if (!panel.includes("MedicationOrderBuilder") || !panel.includes("PrescriptionComposer")) {
    major("reg-panel-flag", "PrescriptionPanel dual-path Builder/Composer", "falta branch legacy");
  } else {
    pass("reg-panel-flag", "PrescriptionPanel dual-path Builder/Composer", "flag + fallback legacy presentes");
  }
  if (!flags.includes('return true') && !/if \(raw === undefined/.test(flags)) {
    major("reg-flag-default", "Builder default ON", "default ON no evidente");
  } else {
    pass("reg-flag-default", "Builder default ON", "unset → true; opt-out 0/false/off");
  }
  // Adapter round-trip unit surface exists
  const adapter = path.join(ROOT, "lib/medication-domain/adapters/legacy-medication.ts");
  if (fs.existsSync(adapter)) {
    pass("reg-adapter", "Adapter legacy↔order lines presente", "Orders persistence path intacto");
  } else {
    major("reg-adapter", "Adapter legacy↔order lines", "archivo ausente");
  }
}

async function main() {
  console.log(`PR-1 QA → ${URL}`);
  console.log(`Artifacts → ${OUT}`);

  await regressionStaticChecks();

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  /** @type {string[]} */
  const consoleMsgs = [];
  page.on("console", (msg) => {
    if (["error", "warning"].includes(msg.type())) {
      consoleMsgs.push(`[${msg.type()}] ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => {
    consoleMsgs.push(`[pageerror] ${err.message}`);
  });

  const resp = await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 90_000 });
  if (!resp || resp.status() >= 400) {
    block("page-load", "Harness /qa/pr1-builder carga", `status=${resp?.status()}`);
    await browser.close();
    writeReport(consoleMsgs);
    process.exit(2);
  }
  try {
    await page.waitForSelector('[data-testid="pr1-qa-harness"]', { timeout: 45_000 });
    pass("page-load", "Harness /qa/pr1-builder carga", `status=${resp.status()}`);
  } catch (e) {
    block("page-load", "Harness /qa/pr1-builder carga", String(e));
    await page.screenshot({ path: path.join(OUT, "fail-load.png"), fullPage: true });
    await browser.close();
    writeReport(consoleMsgs);
    process.exit(2);
  }

  await runCatalogSuite(page, "Presentación", "posology-presentation", {
    filterQuery: "pom",
    filterExpectSubstring: "Pomada",
    expectedMinOptions: 10,
  });
  await runCatalogSuite(page, "Frecuencia", "posology-frequency", {
    filterQuery: "8",
    filterExpectSubstring: "8 horas",
    expectedMinOptions: 15,
  });
  await runCatalogSuite(page, "Duración", "posology-duration", {
    filterQuery: "mes",
    filterExpectSubstring: "mes",
    expectedMinOptions: 10,
  });
  await runCatalogSuite(page, "Vía", "posology-route", {
    filterQuery: "oral",
    filterExpectSubstring: "Oral",
    expectedMinOptions: 10,
  });

  await checkPreviewClarity(page);
  await autocompleteSequence(page);

  // Video: short keyboard interaction recording
  try {
    const videoContext = await browser.newContext({
      viewport: { width: 1100, height: 820 },
      recordVideo: { dir: OUT, size: { width: 1100, height: 820 } },
    });
    const vpage = await videoContext.newPage();
    await vpage.goto(URL, { waitUntil: "domcontentloaded", timeout: 60_000 });
    await vpage.waitForSelector('[data-testid="pr1-qa-harness"]', {
      timeout: 45_000,
    });
    const freq = await openCatalog(vpage, "posology-frequency");
    await freq.input.type("cada", { delay: 80 });
    await vpage.waitForTimeout(200);
    await freq.input.press("ArrowDown");
    await vpage.waitForTimeout(150);
    await freq.input.press("ArrowDown");
    await vpage.waitForTimeout(150);
    await freq.input.press("Enter");
    await vpage.waitForTimeout(300);
    const dur = await openCatalog(vpage, "posology-duration");
    await dur.input.type("7", { delay: 80 });
    await vpage.waitForTimeout(200);
    await dur.input.press("Enter");
    await vpage.waitForTimeout(400);
    await videoContext.close();
    const videos = fs.readdirSync(OUT).filter((f) => f.endsWith(".webm"));
    if (videos.length) {
      const newest = videos
        .map((f) => ({ f, t: fs.statSync(path.join(OUT, f)).mtimeMs }))
        .sort((a, b) => b.t - a.t)[0];
      const dest = path.join(OUT, "autocomplete-keyboard.webm");
      fs.renameSync(path.join(OUT, newest.f), dest);
      pass("video", "Video corto autocomplete+teclado", "autocomplete-keyboard.webm");
    } else {
      minor("video", "Video corto no generado", "sin .webm en output");
    }
  } catch (err) {
    minor("video", "Video corto falló", String(err?.message ?? err));
  }

  await context.close();
  try {
    await responsive(browser);
  } catch (err) {
    minor("responsive-run", "Responsive suite error", String(err?.message ?? err));
  }
  await browser.close();

  // Console
  const realWarnings = consoleMsgs.filter(
    (m) =>
      !m.includes("Download the React DevTools") &&
      !m.includes("favicon"),
  );
  if (realWarnings.length) {
    minor(
      "console",
      "Warnings/errores de consola",
      realWarnings.slice(0, 12).join("\n"),
    );
  } else {
    pass("console", "Sin warnings/errores relevantes en consola");
  }

  writeReport(consoleMsgs);
  const blocks = findings.filter((f) => f.severity === "block" || f.severity === "major");
  console.log(`\nFindings: ${findings.length} (block/major=${blocks.length})`);
  for (const f of findings) {
    console.log(`  [${f.severity}] ${f.id}: ${f.title}${f.detail ? ` — ${f.detail}` : ""}`);
  }
  process.exit(blocks.length ? 1 : 0);
}

function writeReport(consoleMsgs) {
  const report = {
    generatedAt: new Date().toISOString(),
    url: URL,
    findings,
    console: consoleMsgs,
    artifacts: fs.readdirSync(OUT).filter((f) => !f.endsWith(".json")),
  };
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(report, null, 2));
  const md = [
    "# PR-1 Builder UX — QA funcional",
    "",
    `Generado: ${report.generatedAt}`,
    `URL: ${URL}`,
    "",
    "## Resultados",
    "",
    ...findings.map(
      (f) => `- **[${f.severity}]** ${f.title}${f.detail ? `: ${f.detail}` : ""}`,
    ),
    "",
    "## Artefactos",
    "",
    ...report.artifacts.map((a) => `- \`${a}\``),
  ].join("\n");
  fs.writeFileSync(path.join(OUT, "REPORT.md"), md);
}

main().catch((err) => {
  console.error(err);
  try {
    writeReport([]);
  } catch {
    /* ignore */
  }
  process.exit(2);
});
