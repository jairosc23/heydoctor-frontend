import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildClinicalCloseFlowView,
  closeFlowStatusIcon,
  rollupCloseFlowPhaseStatus,
} from "./clinical-close-flow";

const baseQuality = {
  score: 72,
  label: "Adecuado" as const,
  factors: [],
};

describe("clinical-close-flow Phase 4.8.4", () => {
  it("closeFlowStatusIcon mapea estados visuales", () => {
    assert.equal(closeFlowStatusIcon("complete"), "✓");
    assert.equal(closeFlowStatusIcon("attention"), "⚠");
    assert.equal(closeFlowStatusIcon("pending"), "○");
  });

  it("rollupCloseFlowPhaseStatus prioriza pending > attention", () => {
    assert.equal(
      rollupCloseFlowPhaseStatus([
        { id: "a", label: "A", status: "complete" },
        { id: "b", label: "B", status: "pending" },
      ]),
      "pending",
    );
    assert.equal(
      rollupCloseFlowPhaseStatus([
        { id: "a", label: "A", status: "complete" },
        { id: "b", label: "B", status: "attention" },
      ]),
      "attention",
    );
  });

  it("consulta activa sin firmar — firma y entrega pendientes", () => {
    const view = buildClinicalCloseFlowView({
      consultationStatus: "in_progress",
      chiefComplaint: "Control HTA",
      notes: "Paciente refiere cefalea leve. PA 150/95.",
      diagnosis: "I10",
      treatment: "Control en 4 semanas",
      autosaveStatus: "saved",
      documentationGaps: [],
      documentationQuality: baseQuality,
      isSigned: false,
      isLocked: false,
      canPay: true,
      hasPatient: true,
    });
    assert.equal(view.phases.length, 4);
    const sign = view.phases.find((p) => p.id === "sign");
    assert.equal(sign?.status, "pending");
    const deliver = view.phases.find((p) => p.id === "deliver");
    assert.ok(deliver?.items.some((i) => i.id === "payment" && i.status === "pending"));
  });

  it("gaps documentales marcan fase Revisar en atención", () => {
    const view = buildClinicalCloseFlowView({
      consultationStatus: "in_progress",
      chiefComplaint: "Dolor",
      notes: "Notas breves",
      documentationGaps: [
        { id: "g1", field: "Motivo", message: "Falta motivo" },
      ],
      documentationQuality: { ...baseQuality, label: "Incompleto", score: 40 },
      isSigned: false,
      isLocked: false,
      canPay: false,
      hasPatient: true,
    });
    const review = view.phases.find((p) => p.id === "review");
    assert.equal(review?.status, "attention");
    assert.equal(view.gapCount, 1);
  });

  it("consulta bloqueada — entrega completa", () => {
    const view = buildClinicalCloseFlowView({
      consultationStatus: "locked",
      chiefComplaint: "Control",
      notes: "Seguimiento rutinario con plan documentado.",
      documentationGaps: [],
      documentationQuality: baseQuality,
      isSigned: true,
      isLocked: true,
      canPay: true,
      hasPatient: true,
    });
    const deliver = view.phases.find((p) => p.id === "deliver");
    assert.equal(deliver?.status, "complete");
  });
});
