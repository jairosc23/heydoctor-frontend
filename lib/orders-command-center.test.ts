import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildOrdersSummary,
  collectOrderStatuses,
  compareOrderStatus,
  formatOrderUpdatedAt,
  formatPrescriptionTitle,
  inferInvoiceStatus,
  inferPrescriptionStatus,
  inferReferralStatus,
  sortOrdersByStatusThenDate,
} from "./orders-command-center";

describe("orders-command-center", () => {
  it("infere estados clínicos simples por tipo de orden", () => {
    assert.equal(inferPrescriptionStatus("pending"), "pending");
    assert.equal(inferPrescriptionStatus(undefined), "active");
    assert.equal(inferReferralStatus("PENDING"), "pending");
    assert.equal(inferReferralStatus("ACCEPTED"), "active");
    assert.equal(inferReferralStatus("COMPLETED"), "completed");
    assert.equal(inferInvoiceStatus("paid"), "completed");
    assert.equal(inferInvoiceStatus("pending"), "pending");
  });

  it("resume conteos activas, completadas y pendientes", () => {
    const summary = buildOrdersSummary([
      "active",
      "active",
      "completed",
      "completed",
      "pending",
      "unexecuted",
    ]);
    assert.equal(summary.active, 2);
    assert.equal(summary.completed, 2);
    assert.equal(summary.pending, 2);
    assert.equal(summary.total, 6);
  });

  it("ordena pendientes antes que activas y completadas", () => {
    assert.ok(compareOrderStatus("pending", "active") < 0);
    assert.ok(compareOrderStatus("active", "completed") < 0);
    assert.ok(compareOrderStatus("unexecuted", "completed") < 0);
  });

  it("ordena por estado y luego por fecha descendente", () => {
    const sorted = sortOrdersByStatusThenDate(
      [
        { id: "1", status: "COMPLETED", createdAt: "2026-01-01T00:00:00.000Z" },
        { id: "2", status: "PENDING", createdAt: "2026-01-02T00:00:00.000Z" },
        { id: "3", status: "PENDING", createdAt: "2026-01-03T00:00:00.000Z" },
      ],
      (item) => inferReferralStatus(item.status as "PENDING" | "COMPLETED"),
      (item) => item.createdAt,
    );
    assert.deepEqual(
      sorted.map((item) => item.id),
      ["3", "2", "1"],
    );
  });

  it("formatea título de receta y fecha relativa", () => {
    const title = formatPrescriptionTitle({
      id: "rx1",
      patientId: "p1",
      medications: [{ name: "Metformina", dosage: "850 mg" }],
    });
    assert.match(title, /Metformina 850 mg/);

    const today = new Date("2026-06-10T12:00:00.000Z");
    assert.equal(
      formatOrderUpdatedAt("2026-06-10T08:00:00.000Z", today),
      "Hoy",
    );
  });

  it("agrega estados de todas las categorías para overview", () => {
    const statuses = collectOrderStatuses({
      prescriptions: [{ id: "1", patientId: "p1", medications: [] }],
      labOrders: [{ id: "l1", patientId: "p1", exams: [] }],
      referrals: [
        {
          id: "r1",
          patientId: "p1",
          receivingDoctorName: "Dr. Pérez",
          specialty: "Cardiología",
          reason: "Evaluación",
          status: "PENDING",
        },
      ],
      invoices: [
        {
          id: "i1",
          amountClp: 1000,
          documentNumber: "F-001",
          status: "paid",
        },
      ],
    });
    assert.equal(statuses.length, 4);
    assert.equal(buildOrdersSummary(statuses).total, 4);
  });
});
