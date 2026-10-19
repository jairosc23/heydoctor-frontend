import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildClinicalTimeline } from "./clinical-timeline-events";
import type { PatientClinicalMemory } from "./types/clinical-memory";

const BASE: PatientClinicalMemory = {
  patientId: "p1",
  activeConditions: [],
  recentDiagnoses: [],
  currentMedications: [],
  pendingLabs: [],
  alerts: [],
  recentConsultations: [],
};

describe("buildClinicalTimeline", () => {
  it("agrupa diagnósticos y consultas por año en orden cronológico", () => {
    const model = buildClinicalTimeline(
      {
        ...BASE,
        activeConditions: [
          {
            code: "E11",
            label: "DM2",
            source: "cie10",
            lastSeenAt: "2021-06-01T00:00:00.000Z",
          },
        ],
        recentConsultations: [
          {
            id: "c-old",
            createdAt: "2024-03-15T00:00:00.000Z",
            status: "completed",
            diagnosisCode: "M54",
            diagnosisLabel: "Lumbago",
          },
          {
            id: "c-current",
            createdAt: "2026-01-10T00:00:00.000Z",
            status: "in_progress",
            diagnosisCode: null,
            diagnosisLabel: null,
          },
        ],
      },
      { currentConsultationId: "c-current", now: new Date("2026-06-10") },
    );

    assert.equal(model.groups.length, 2);
    assert.equal(model.groups[0]?.year, 2021);
    assert.equal(model.groups[0]?.events[0]?.title, "DM2");
    assert.equal(model.groups[1]?.year, 2024);
    assert.equal(model.groups[1]?.events[0]?.title, "Lumbago");
    assert.equal(
      model.groups.some((g) => g.events.some((e) => e.id.includes("c-current"))),
      false,
    );
  });

  it("deduplica diagnósticos repetidos entre condiciones y recientes", () => {
    const model = buildClinicalTimeline({
      ...BASE,
      activeConditions: [
        { code: "J45", label: "Asma", source: "cie10", lastSeenAt: "2022-01-01" },
      ],
      recentDiagnoses: [
        { code: "J45", label: "Asma", source: "diagnosis_text", lastSeenAt: "2022-06-01" },
      ],
    });

    const asthmaEvents = model.groups.flatMap((g) => g.events).filter((e) => e.title === "Asma");
    assert.equal(asthmaEvents.length, 1);
  });

  it("incluye medicación y laboratorios pendientes en el timeline", () => {
    const model = buildClinicalTimeline({
      ...BASE,
      currentMedications: [
        {
          name: "Metformina",
          prescriptionId: "rx1",
          since: "2023-05-01T00:00:00.000Z",
        },
      ],
      pendingLabs: [
        {
          exam: "HbA1c",
          labOrderId: "lab1",
          orderedAt: "2025-11-01T00:00:00.000Z",
          status: "pending",
        },
      ],
    });

    assert.ok(model.groups.some((g) => g.year === 2023));
    assert.ok(model.groups.some((g) => g.year === 2025));
    assert.equal(model.isEmpty, false);
  });
});
