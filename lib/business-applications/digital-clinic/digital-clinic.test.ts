import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { OperationalPulseDashboard } from "../../product-platform/operational-pulse";
import {
  DIGITAL_CLINIC_PASS,
  DIGITAL_CLINIC_PROCESSES,
  LTS_ROUTES,
  navigateAtencion,
  navigateCaja,
  navigateDireccion,
  navigateOperaciones,
  processActor,
} from "./index";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../../..");

const EPIC_FILES = [
  "lib/business-applications/digital-clinic/types.ts",
  "lib/business-applications/digital-clinic/processes.ts",
  "lib/business-applications/digital-clinic/index.ts",
];

const FORBIDDEN = [
  "runClinicalCompletion",
  "ensureSettlement",
  "observeCommercialSettlement",
  "initiateCommercialPayment",
  "persistSettlementAtomic",
  "saveClinicalCompletionSnapshot",
  "loadClinicalCompletionSnapshot",
  "loadSettlementByEncounterId",
  "loadContinuityPackage",
  "deriveContinuityPackage",
  "loadClinicalOperationsView",
  "projectClinicalOperationsView",
  "projectClinicalDeliveryQueue",
  "loadClinicalDeliveryQueue",
  "classifyRevenueIntegrity",
  "loadRevenueIntegrityDashboard",
  "projectLongitudinalContinuity",
  "loadLongitudinalContinuity",
  "projectPreVisitBrief",
  "loadPreVisitBrief",
  "projectOperationalPulse",
  "ClinicProcessId",
  "DigitalClinicId",
  "ReceptionId",
  "ConvenioId",
  "CajaDiariaId",
  "PanelLayout",
  "ContinuityPanelShell",
  "ClinicalCompletionSection",
  "CommercialSettlementSection",
  "localStorage",
  "sessionStorage",
  "Date.now",
  "new Date",
  "/portal/",
  "/panel/agenda",
  "/panel/clinica-digital",
];

function pulse(metrics: {
  pulseDeliveryBacklog?: number;
  pulseCommercialAtRisk?: number;
}): OperationalPulseDashboard {
  return {
    kind: "operational_pulse_dashboard",
    pulseStatus: "clear",
    metrics: {
      pulseDeliveryBacklog: metrics.pulseDeliveryBacklog ?? 0,
      pulseCommercialAtRisk: metrics.pulseCommercialAtRisk ?? 0,
      pulseCommercialClosed: 0,
      pulsePatientsScanned: 0,
      pulseBriefReady: 0,
      pulseBriefEmpty: 0,
      pulseLastHandoffAbsent: 0,
    },
    alerts: {
      alertDeliveryBacklog: 0,
      alertCommercialAtRisk: 0,
      alertLastHandoffAbsent: 0,
      alertBriefEmpty: 0,
    },
    composition: {
      briefReadyShare: 0,
      briefEmptyShare: 0,
      commercialAtRiskShare: 0,
    },
  };
}

describe("BA-1 Consume LTS only", () => {
  it("does not call Core writes or Product projectors", () => {
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "runClinicalCompletion",
        "ensureSettlement",
        "projectClinicalDeliveryQueue",
        "classifyRevenueIntegrity",
      ]) {
        assert.equal(source.includes(token), false, `${file} ${token}`);
      }
    }
  });
});

describe("BA-2 No persisted domain", () => {
  it("does not mint a Digital Clinic store or domain id", () => {
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      assert.equal(source.includes("DigitalClinicId"), false);
      assert.equal(source.includes("localStorage"), false);
    }
  });
});

describe("BA-3 No new identities", () => {
  it("navigates with EncounterId and patientId as LTS keys only", () => {
    const steps = navigateAtencion({
      patientId: "patient-1",
      encounterId: "enc-1",
    });
    assert.ok(steps.some((s) => s.href === "/panel/consultas/enc-1"));
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "ClinicProcessId",
        "ReceptionId",
        "ConvenioId",
        "CajaDiariaId",
      ]) {
        assert.equal(source.includes(token), false, token);
      }
    }
  });
});

describe("BA-4 No Core workflows", () => {
  it("marks every process as non-writing", () => {
    for (const process of Object.keys(DIGITAL_CLINIC_PROCESSES)) {
      assert.equal(
        DIGITAL_CLINIC_PROCESSES[
          process as keyof typeof DIGITAL_CLINIC_PROCESSES
        ].writes,
        false,
      );
    }
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of [
        "runClinicalCompletion",
        "ensureSettlement",
        "observeCommercialSettlement",
        "persistSettlementAtomic",
        "saveClinicalCompletionSnapshot",
      ]) {
        assert.equal(source.includes(token), false);
      }
    }
  });
});

describe("BA-5 LTS unmodified", () => {
  it("does not export from the v1.0 barrel or add a clinic-digital route", () => {
    const barrel = readFileSync(
      join(ROOT, "lib/product-platform/index.ts"),
      "utf8",
    );
    assert.equal(barrel.includes("business-applications"), false);
    assert.equal(barrel.includes("digital-clinic"), false);
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      assert.equal(source.includes("/panel/clinica-digital"), false);
      assert.equal(source.includes("PanelLayout"), false);
    }
  });
});

describe("BA-6 Processes are separate", () => {
  it("keeps four distinct process ids", () => {
    assert.deepEqual(Object.keys(DIGITAL_CLINIC_PROCESSES).sort(), [
      "atencion",
      "caja",
      "direccion",
      "operaciones",
    ]);
  });
});

describe("BA-7 Unique actor per process", () => {
  it("assigns medico, caja, direccion_medica, operaciones", () => {
    assert.equal(processActor("atencion"), "medico");
    assert.equal(processActor("caja"), "caja");
    assert.equal(processActor("direccion"), "direccion_medica");
    assert.equal(processActor("operaciones"), "operaciones");
    const actors = Object.values(DIGITAL_CLINIC_PROCESSES).map((p) => p.actor);
    assert.equal(new Set(actors).size, 4);
  });
});

describe("BA-8 Does not duplicate Product projections", () => {
  it("does not load or project v1–v4; operaciones only reads a pulse snapshot", () => {
    const source = readFileSync(
      join(ROOT, "lib/business-applications/digital-clinic/processes.ts"),
      "utf8",
    );
    assert.equal(source.includes("loadClinicalDeliveryQueue"), false);
    assert.equal(source.includes("loadRevenueIntegrityDashboard"), false);
    assert.equal(source.includes("loadPreVisitBrief"), false);
    assert.equal(source.includes("loadLongitudinalContinuity"), false);
    assert.equal(source.includes("projectOperationalPulse"), false);
    assert.equal(source.includes("loadOperationalPulse"), true);
  });
});

describe("BA-9 Attention does not charge; caja does not emit", () => {
  it("keeps atencion off revenue and caja off brief", () => {
    const atencion = navigateAtencion({
      patientId: "p1",
      encounterId: "e1",
    });
    assert.equal(
      atencion.some((s) => s.href === LTS_ROUTES.integridadIngresos),
      false,
    );
    const caja = navigateCaja({ encounterId: "e1" });
    assert.equal(
      caja.some((s) => s.href.includes("brief-previsita")),
      false,
    );
    assert.equal(
      caja.some((s) => s.href.includes("entrega-clinica")),
      false,
    );
    const direccion = navigateDireccion();
    assert.equal(direccion.every((s) => s.writes === false), true);
    assert.equal(navigateOperaciones(pulse({})).every((s) => s.writes === false), true);
  });
});

describe("BA-10 Caja is per Encounter", () => {
  it("starts at revenue integrity and opens one Encounter ficha", () => {
    const steps = navigateCaja({ encounterId: "enc-caja" });
    assert.equal(steps[0]?.href, LTS_ROUTES.integridadIngresos);
    assert.equal(steps[1]?.href, "/panel/consultas/enc-caja");
    assert.equal(steps.every((s) => s.process === "caja"), true);
  });
});

describe("BA-11 Direccion uses only the pulse", () => {
  it("does not embed delivery or revenue boards", () => {
    const steps = navigateDireccion();
    assert.deepEqual(
      steps.map((s) => s.href),
      [LTS_ROUTES.pulsoOperativo],
    );
  });
});

describe("BA-12 Surfaces are existing LTS URLs", () => {
  it("only emits certified panel routes", () => {
    const atencion = navigateAtencion({
      patientId: "p1",
      encounterId: "e1",
    });
    assert.deepEqual(
      atencion.map((s) => s.href),
      [
        "/panel/brief-previsita/p1",
        "/panel/continuidad-longitudinal/p1",
        "/panel/consultas/e1",
      ],
    );
    const ops = navigateOperaciones(
      pulse({ pulseDeliveryBacklog: 2, pulseCommercialAtRisk: 1 }),
    );
    assert.ok(ops.some((s) => s.href === LTS_ROUTES.pulsoOperativo));
    assert.ok(ops.some((s) => s.href === LTS_ROUTES.entregaClinica));
    assert.ok(ops.some((s) => s.href === LTS_ROUTES.integridadIngresos));
    const clear = navigateOperaciones(pulse({}));
    assert.deepEqual(
      clear.map((s) => s.href),
      [LTS_ROUTES.pulsoOperativo],
    );
    for (const file of EPIC_FILES) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of FORBIDDEN) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
    assert.deepEqual([...DIGITAL_CLINIC_PASS], [
      "BA-1",
      "BA-2",
      "BA-3",
      "BA-4",
      "BA-5",
      "BA-6",
      "BA-7",
      "BA-8",
      "BA-9",
      "BA-10",
      "BA-11",
      "BA-12",
    ]);
  });
});
