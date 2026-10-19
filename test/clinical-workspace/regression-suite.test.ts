import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  formatWorkspaceStabilityIndex,
  workspaceStabilityIndex,
  WORKSPACE_FOUNDATION_ENTRY,
  WORKSPACE_FOUNDATION_FILE,
  WORKSPACE_CHROME_FILE,
  WORKSPACE_KERNEL_ENTRY,
  WORKSPACE_OVERLAY_MANAGER_FILE,
  WORKSPACE_VIEWPORT_FILE,
  WORKSPACE_REGRESSION_INVARIANTS,
  WORKSPACE_REGRESSION_SCENARIO_CONTRACT,
  WORKSPACE_REGRESSION_SCENARIOS,
  WORKSPACE_REGRESSION_SOURCES,
  WORKSPACE_REGRESSION_SURFACES,
  WORKSPACE_REGRESSION_VIEWPORTS,
} from "../../lib/clinical-workspace/regression-suite";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

function readWorkspace(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

function countMatches(source: string, pattern: RegExp): number {
  return source.match(new RegExp(pattern.source, "g"))?.length ?? 0;
}

type Gate = { id: string; pass: boolean; message: string };

function evaluateWorkspaceGates(): Gate[] {
  const kernel = readWorkspace(WORKSPACE_KERNEL_ENTRY);
  const page = readWorkspace(WORKSPACE_REGRESSION_SOURCES.encounterPage);
  const continuity = readWorkspace(WORKSPACE_REGRESSION_SOURCES.continuity);
  const fullRecord = readWorkspace(WORKSPACE_REGRESSION_SOURCES.fullRecord);
  const hook = readWorkspace(WORKSPACE_REGRESSION_SOURCES.chromeHook);
  const layout = readWorkspace(WORKSPACE_REGRESSION_SOURCES.panelLayout);
  const banned =
    /z-\[(?:5|100)\]|\bz-10\b|\bz-20\b|zIndex:\s*60|--encounter-chrome-h,\s*(?:5\.5rem|3\.5rem)/;
  const geometryHits = [
    WORKSPACE_REGRESSION_SOURCES.continuity,
    WORKSPACE_REGRESSION_SOURCES.share,
    WORKSPACE_REGRESSION_SOURCES.rail,
    WORKSPACE_REGRESSION_SOURCES.patientRail,
    WORKSPACE_REGRESSION_SOURCES.soapNav,
    WORKSPACE_REGRESSION_SOURCES.safetyStrip,
    WORKSPACE_REGRESSION_SOURCES.globals,
  ]
    .map((relative) => {
      const hit = readWorkspace(relative).match(banned)?.[0];
      return hit ? `${relative}:${hit}` : null;
    })
    .filter((hit): hit is string => Boolean(hit));
  const escapeCount = [
    WORKSPACE_REGRESSION_SOURCES.copilot,
    WORKSPACE_REGRESSION_SOURCES.doctorDna,
    WORKSPACE_REGRESSION_SOURCES.moduleSheet,
    WORKSPACE_REGRESSION_SOURCES.panelLayout,
  ].reduce(
    (sum, relative) =>
      sum + countMatches(readWorkspace(relative), /key === ["']Escape["']/),
    0,
  );

  const foundationLeaks = Object.values(WORKSPACE_REGRESSION_SOURCES).filter(
    (relative) => readWorkspace(relative).includes(WORKSPACE_FOUNDATION_ENTRY),
  );
  const viewportConsumers = Object.values(WORKSPACE_REGRESSION_SOURCES).filter(
    (relative) => {
      if (
        relative === WORKSPACE_REGRESSION_SOURCES.continuity ||
        relative === WORKSPACE_REGRESSION_SOURCES.share ||
        relative === WORKSPACE_REGRESSION_SOURCES.fullRecord ||
        relative === WORKSPACE_REGRESSION_SOURCES.unsaved ||
        relative === WORKSPACE_REGRESSION_SOURCES.panelLayout ||
        relative === WORKSPACE_REGRESSION_SOURCES.copilot ||
        relative === WORKSPACE_REGRESSION_SOURCES.rail ||
        relative === WORKSPACE_REGRESSION_SOURCES.patientRail ||
        relative === WORKSPACE_REGRESSION_SOURCES.soapNav ||
        relative === WORKSPACE_REGRESSION_SOURCES.safetyStrip
      ) {
        return false;
      }
      const source = readWorkspace(relative);
      return (
        source.includes("foundation/viewport") ||
        source.includes("getViewport(")
      );
    },
  );
  const viewport = existsSync(join(ROOT, WORKSPACE_VIEWPORT_FILE))
    ? readWorkspace(WORKSPACE_VIEWPORT_FILE)
    : "";

  return [
    {
      id: "kernel-entry",
      pass: existsSync(join(ROOT, WORKSPACE_KERNEL_ENTRY)),
      message: `missing ${WORKSPACE_KERNEL_ENTRY}`,
    },
    {
      id: "foundation-entry",
      pass:
        existsSync(join(ROOT, WORKSPACE_FOUNDATION_FILE)) &&
        /from ["']\.\/foundation["']/.test(kernel) &&
        foundationLeaks.length === 0,
      message:
        foundationLeaks.length > 0
          ? `Foundation leaked to ${foundationLeaks.join(", ")}`
          : "Foundation missing or not wired through Kernel",
    },
    {
      id: "viewport-entry",
      pass:
        viewportConsumers.length === 0 &&
        /getViewport\(/.test(continuity) &&
        /clinical-overlay-clinical-content/.test(continuity) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.share)) &&
        /clinical-overlay-clinical-content/.test(
          readWorkspace(WORKSPACE_REGRESSION_SOURCES.share),
        ) &&
        /getViewport\(/.test(fullRecord) &&
        /clinical-overlay-clinical-content/.test(fullRecord) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.unsaved)) &&
        /clinical-overlay-clinical-content/.test(
          readWorkspace(WORKSPACE_REGRESSION_SOURCES.unsaved),
        ) &&
        /getViewport\(/.test(layout) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.copilot)) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.rail)) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.patientRail)) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.soapNav)) &&
        /getViewport\(/.test(readWorkspace(WORKSPACE_REGRESSION_SOURCES.safetyStrip)) &&
        /sidebarWidth/.test(viewport) &&
        /panelHeaderHeight/.test(viewport) &&
        /encounterChromeHeight/.test(viewport) &&
        /safeTop/.test(viewport) &&
        /safeBottom/.test(viewport) &&
        /contentRect/.test(viewport) &&
        /getViewport\s*\(/.test(kernel),
      message:
        viewportConsumers.length > 0
          ? `Viewport leaked to ${viewportConsumers.join(", ")}`
          : "Workspace Viewport primitive is missing",
    },
    {
      id: "teleconsulta-enterFullscreen",
      pass: (() => {
        const teleconsultaPage = readWorkspace(
          WORKSPACE_REGRESSION_SOURCES.teleconsultaPage,
        );
        return (
          /enterFullscreen\s*\(/.test(teleconsultaPage) &&
          /useEffect/.test(teleconsultaPage) &&
          !/enterFullscreen/.test(layout) &&
          !/key === ["']Escape["']/.test(layout) &&
          /mode === ["']fullscreen["']/.test(layout) &&
          !/router\.push\(`\/panel\/consultas\/\$\{consultation\.id\}\/teleconsulta`\)/.test(
            page,
          ) &&
          !/isPanelTeleconsultaRoute/.test(layout) &&
          !/copilotDrawerOpen/.test(page) &&
          !/dnaDrawerOpen/.test(page) &&
          !/closeEncounterOverlays/.test(page) &&
          !/createPortal/.test(continuity) &&
          !/md:left-64/.test(continuity) &&
          !/createPortal/.test(fullRecord) &&
          !/document\.body/.test(fullRecord)
        );
      })(),
      message: "handleStartCall bypasses Kernel.enterFullscreen",
    },
    {
      id: "copilot-entry",
      pass: (() => {
        const copilot = readWorkspace(WORKSPACE_REGRESSION_SOURCES.copilot);
        return (
          /clinicalWorkspaceKernel/.test(copilot) &&
          /present\(/.test(copilot) &&
          !/key === ["']Escape["']/.test(copilot) &&
          !/CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS/.test(copilot) &&
          /CLINICAL_OVERLAY_DRAWER_PANEL_CLASS/.test(copilot)
        );
      })(),
      message: "Copilot still administers overlay chrome",
    },
    {
      id: "doctor-dna-entry",
      pass: (() => {
        const dna = readWorkspace(WORKSPACE_REGRESSION_SOURCES.doctorDna);
        return (
          /clinicalWorkspaceKernel/.test(dna) &&
          /present\(/.test(dna) &&
          !/key === ["']Escape["']/.test(dna) &&
          !/CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS/.test(dna) &&
          /CLINICAL_OVERLAY_DRAWER_PANEL_CLASS/.test(dna)
        );
      })(),
      message: "Doctor DNA still administers overlay chrome",
    },
    {
      id: "module-sheet-entry",
      pass: (() => {
        const moduleSheet = readWorkspace(
          WORKSPACE_REGRESSION_SOURCES.moduleSheet,
        );
        return (
          /clinicalWorkspaceKernel/.test(moduleSheet) &&
          /present\(/.test(moduleSheet) &&
          !/key === ["']Escape["']/.test(moduleSheet) &&
          !/CLINICAL_OVERLAY_DRAWER_BACKDROP_CLASS/.test(moduleSheet) &&
          /CLINICAL_OVERLAY_DRAWER_PANEL_CLASS/.test(moduleSheet)
        );
      })(),
      message: "Module Sheet still administers overlay chrome",
    },
    {
      id: "overlay-manager-entry",
      pass: (() => {
        if (!existsSync(join(ROOT, WORKSPACE_OVERLAY_MANAGER_FILE))) {
          return false;
        }
        const manager = readWorkspace(WORKSPACE_OVERLAY_MANAGER_FILE);
        const foundation = readWorkspace(WORKSPACE_FOUNDATION_FILE);
        const leaked = Object.values(WORKSPACE_REGRESSION_SOURCES).some(
          (relative) =>
            readWorkspace(relative).includes("foundation/overlay-manager"),
        );
        return (
          !leaked &&
          /from ["']\.\/overlay-manager["']/.test(foundation) &&
          /export function present/.test(manager) &&
          /export function dismiss/.test(manager) &&
          /export function dismissAll/.test(manager) &&
          /blocking/.test(manager) &&
          /applyBackdrop/.test(manager) &&
          /attachEscape/.test(manager) &&
          /applyFocus/.test(manager) &&
          /applyPointerEvents/.test(manager) &&
          /applyStacking/.test(manager)
        );
      })(),
      message: "Overlay Manager is missing, leaked, or incomplete",
    },
    {
      id: "chrome-entry",
      pass:
        existsSync(join(ROOT, WORKSPACE_CHROME_FILE)) &&
        /publishChromeHeight/.test(kernel) &&
        /WORKSPACE_CHROME_FALLBACK_PX/.test(
          readWorkspace(WORKSPACE_CHROME_FILE),
        ) &&
        !/style\.setProperty\("--encounter-chrome-h"/.test(hook) &&
        !/style\.setProperty\("--encounter-chrome-h"/.test(
          readWorkspace(WORKSPACE_REGRESSION_SOURCES.chromeMetrics),
        ),
      message: "Chrome publication is not centralized in Foundation",
    },
  ];
}

const GATES = evaluateWorkspaceGates();
const STABILITY = workspaceStabilityIndex(
  GATES.filter((gate) => gate.pass).length,
  GATES.length,
);

describe("Workspace Regression Suite — architecture contract", () => {
  it("freezes the scenario catalog", () => {
    assert.equal(WORKSPACE_REGRESSION_SCENARIO_CONTRACT.frozen, true);
    assert.equal(
      WORKSPACE_REGRESSION_SCENARIOS.length,
      WORKSPACE_REGRESSION_SCENARIO_CONTRACT.count,
    );
    assert.equal(WORKSPACE_REGRESSION_SCENARIO_CONTRACT.count, 36);
    assert.equal(WORKSPACE_REGRESSION_SURFACES.length, 11);
    assert.equal(WORKSPACE_REGRESSION_INVARIANTS.length, 7);
    assert.deepEqual([...WORKSPACE_REGRESSION_VIEWPORTS], ["desktop", "mobile"]);
  });

  it("does not accept new scenarios without approval", () => {
    assert.equal(
      WORKSPACE_REGRESSION_SCENARIOS.length,
      WORKSPACE_REGRESSION_SCENARIO_CONTRACT.count,
      "scenario count is frozen debt; do not add scenarios — raise the Stability Index",
    );
  });

  it("exists as the Clinical Workspace Kernel contract", () => {
    const kernel = readWorkspace(WORKSPACE_KERNEL_ENTRY);
    assert.equal(existsSync(join(ROOT, WORKSPACE_KERNEL_ENTRY)), true);
    assert.match(kernel, /export interface ClinicalWorkspaceKernel/);
    assert.match(kernel, /enterFullscreen/);
    assert.match(kernel, /from ["']\.\/foundation["']/);
    assert.equal(
      /from ["']@\/(?:app|components)\//.test(kernel),
      false,
      "Kernel must not import Encounter or components",
    );
  });

  it("allows Encounter to depend only on Kernel, never Foundation", () => {
    for (const relative of Object.values(WORKSPACE_REGRESSION_SOURCES)) {
      assert.equal(
        readWorkspace(relative).includes(WORKSPACE_FOUNDATION_ENTRY),
        false,
        `${relative} must not import Foundation`,
      );
    }
  });

  it("routes Teleconsulta through Kernel.enterFullscreen", () => {
    const page = readWorkspace(WORKSPACE_REGRESSION_SOURCES.encounterPage);
    const teleconsultaPage = readWorkspace(
      WORKSPACE_REGRESSION_SOURCES.teleconsultaPage,
    );
    const layout = readWorkspace(WORKSPACE_REGRESSION_SOURCES.panelLayout);
    assert.match(teleconsultaPage, /enterFullscreen\s*\(/);
    assert.match(teleconsultaPage, /useEffect/);
    assert.doesNotMatch(layout, /enterFullscreen/);
    assert.doesNotMatch(layout, /key === ["']Escape["']/);
    assert.doesNotMatch(
      page,
      /router\.push\(`\/panel\/consultas\/\$\{consultation\.id\}\/teleconsulta`\)/,
    );
    assert.doesNotMatch(layout, /isPanelTeleconsultaRoute/);
    assert.match(layout, /mode === ["']fullscreen["']/);
  });

  it("lets the Workspace frame consume Viewport and Chrome", () => {
    const layout = readWorkspace(WORKSPACE_REGRESSION_SOURCES.panelLayout);
    const copilot = readWorkspace(WORKSPACE_REGRESSION_SOURCES.copilot);
    const rail = readWorkspace(WORKSPACE_REGRESSION_SOURCES.rail);
    const patientRail = readWorkspace(WORKSPACE_REGRESSION_SOURCES.patientRail);
    const soapNav = readWorkspace(WORKSPACE_REGRESSION_SOURCES.soapNav);
    const safetyStrip = readWorkspace(WORKSPACE_REGRESSION_SOURCES.safetyStrip);
    const globals = readWorkspace(WORKSPACE_REGRESSION_SOURCES.globals);
    for (const source of [layout, copilot, rail, patientRail, soapNav, safetyStrip]) {
      assert.match(source, /getViewport\(/);
      assert.doesNotMatch(source, /md:left-64/);
      assert.doesNotMatch(source, /--encounter-chrome-h,\s*(?:5\.5rem|3\.5rem)/);
    }
    assert.doesNotMatch(layout, /top-16/);
    assert.doesNotMatch(globals, /--encounter-chrome-h,\s*(?:5\.5rem|3\.5rem)/);
  });

  it("lets Unsaved consume Overlay Manager, Viewport and overlayHost", () => {
    const unsaved = readWorkspace(WORKSPACE_REGRESSION_SOURCES.unsaved);
    assert.match(unsaved, /clinicalWorkspaceKernel/);
    assert.match(unsaved, /present\(/);
    assert.match(unsaved, /getViewport\(/);
    assert.match(unsaved, /clinical-overlay-clinical-content/);
    assert.match(unsaved, /data-unsaved-host="overlayHost"/);
    assert.doesNotMatch(unsaved, /fixed inset-0/);
    assert.doesNotMatch(unsaved, /key === ["']Escape["']/);
    assert.equal(
      unsaved.includes(WORKSPACE_FOUNDATION_ENTRY),
      false,
      "Unsaved must consume Viewport through Kernel",
    );
  });

  it("lets Full Record consume Overlay Manager, Viewport and overlayHost", () => {
    const fullRecord = readWorkspace(WORKSPACE_REGRESSION_SOURCES.fullRecord);
    assert.match(fullRecord, /clinicalWorkspaceKernel/);
    assert.match(fullRecord, /present\(/);
    assert.match(fullRecord, /getViewport\(/);
    assert.match(fullRecord, /clinical-overlay-clinical-content/);
    assert.match(fullRecord, /data-full-record-host="overlayHost"/);
    assert.doesNotMatch(fullRecord, /createPortal/);
    assert.doesNotMatch(fullRecord, /document\.body/);
    assert.doesNotMatch(fullRecord, /fixed inset-0/);
    assert.equal(
      fullRecord.includes(WORKSPACE_FOUNDATION_ENTRY),
      false,
      "Full Record must consume Viewport through Kernel",
    );
  });

  it("lets Share consume Overlay Manager, Viewport and overlayHost", () => {
    const share = readWorkspace(WORKSPACE_REGRESSION_SOURCES.share);
    assert.match(share, /clinicalWorkspaceKernel/);
    assert.match(share, /present\(/);
    assert.match(share, /getViewport\(/);
    assert.match(share, /clinical-overlay-clinical-content/);
    assert.match(share, /data-share-host="overlayHost"/);
    assert.doesNotMatch(share, /zIndex:\s*60/);
    assert.doesNotMatch(share, /inset:\s*0/);
    assert.doesNotMatch(share, /createPortal/);
    assert.equal(
      share.includes(WORKSPACE_FOUNDATION_ENTRY),
      false,
      "Share must consume Viewport through Kernel",
    );
  });

  it("lets Continuity consume Overlay Manager, Viewport, Chrome and overlayHost", () => {
    const continuity = readWorkspace(WORKSPACE_REGRESSION_SOURCES.continuity);
    assert.match(continuity, /clinicalWorkspaceKernel/);
    assert.match(continuity, /present\(/);
    assert.match(continuity, /getViewport\(/);
    assert.match(continuity, /clinical-overlay-clinical-content/);
    assert.match(continuity, /data-continuity-host="overlayHost"/);
    assert.doesNotMatch(continuity, /createPortal/);
    assert.doesNotMatch(continuity, /md:left-64/);
    assert.doesNotMatch(continuity, /document\.body/);
    assert.doesNotMatch(continuity, /--encounter-chrome-h,\s*5\.5rem/);
    assert.equal(
      continuity.includes(WORKSPACE_FOUNDATION_ENTRY),
      false,
      "Continuity must consume Viewport through Kernel",
    );
  });
});

describe("Workspace Regression Suite — current workspace (must be red)", () => {
  it("reports Workspace Stability Index", () => {
    console.log(formatWorkspaceStabilityIndex(STABILITY));
    assert.equal(STABILITY.total, 9);
    assert.equal(STABILITY.pass, GATES.filter((gate) => gate.pass).length);
  });

  for (const gate of GATES) {
    it(gate.id, () => {
      assert.equal(gate.pass, true, gate.message);
    });
  }
});
