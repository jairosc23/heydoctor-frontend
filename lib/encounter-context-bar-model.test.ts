import test from "node:test";
import assert from "node:assert/strict";
import {
  buildEncounterContextBarModel,
  normalizeEncounterContextStatus,
} from "../app/panel/consultas/[id]/_components/encounter-context-bar-model";
import type { PatientProfile, PatientRow } from "@/lib/services/patients";
import type { PatientClinicalMemory } from "@/lib/types/clinical-memory";

const patient: PatientRow = {
  id: "patient-1",
  displayName: "Wayra Test",
  age: 27,
  sex: "female",
  documentType: "RUT",
  documentNumber: "12.345.678-9",
};

const profile = {
  allergies: [{ label: "Penicilina" }],
  alerts: [{ label: "Riesgo cardiovascular alto" }],
  clinicalWarnings: [{ label: "Control renal pendiente" }],
} as PatientProfile;

const memory: PatientClinicalMemory = {
  patientId: "patient-1",
  activeConditions: [
    { code: "I10", label: "Hipertensión arterial", source: "cie10" },
    { code: "E11", label: "Diabetes mellitus tipo 2", source: "cie10" },
    { code: "E78", label: "Dislipidemia", source: "cie10" },
    { code: "J45", label: "Asma", source: "cie10" },
  ],
  recentDiagnoses: [],
  currentMedications: [
    {
      name: "Losartán",
      prescriptionId: "rx-1",
      since: "2026-06-01",
    },
    {
      name: "Metformina",
      prescriptionId: "rx-2",
      since: "2026-06-01",
    },
    {
      name: "Atorvastatina",
      prescriptionId: "rx-3",
      since: "2026-06-01",
    },
    {
      name: "Salbutamol",
      prescriptionId: "rx-4",
      since: "2026-06-01",
    },
  ],
  pendingLabs: [],
  alerts: [
    {
      code: "critical-1",
      severity: "critical",
      message: "PA severamente elevada",
      source: "rule",
    },
    {
      code: "info-1",
      severity: "info",
      message: "Control anual pendiente",
      source: "rule",
    },
  ],
  recentConsultations: [],
};

test("normalizeEncounterContextStatus maps backend states to enterprise labels", () => {
  assert.equal(normalizeEncounterContextStatus("draft"), "DRAFT");
  assert.equal(normalizeEncounterContextStatus("in_progress"), "IN_PROGRESS");
  assert.equal(normalizeEncounterContextStatus("signed"), "SIGNED");
  assert.equal(normalizeEncounterContextStatus("completed"), "SIGNED");
  assert.equal(normalizeEncounterContextStatus("locked"), "LOCKED");
  assert.equal(normalizeEncounterContextStatus("cancelled"), "CANCELLED");
});

test("buildEncounterContextBarModel prioritizes allergies, alerts and continuity overflow", () => {
  const model = buildEncounterContextBarModel({
    patient,
    profile,
    fallbackName: "Paciente",
    status: "in_progress",
    diagnosis: "Cefalea",
    memory,
  });

  assert.equal(model.identity.statusLabel, "En consulta");
  assert.equal(model.identity.documentLabel, "RUT 12.345.678-9");
  assert.deepEqual(
    model.risk.allergies.map((chip) => chip.label),
    ["Penicilina"],
  );
  assert.deepEqual(
    model.risk.criticalAlerts.map((chip) => chip.label),
    ["PA severamente elevada"],
  );
  assert.equal(model.risk.diagnosis, "Cefalea");
  assert.deepEqual(
    model.continuity.activeProblems.visible.map((chip) => chip.label),
    ["Hipertensión arterial", "Diabetes mellitus tipo 2", "Dislipidemia"],
  );
  assert.equal(model.continuity.activeProblems.hiddenCount, 1);
  assert.deepEqual(
    model.continuity.activeMedications.visible.map((chip) => chip.label),
    ["Losartán", "Metformina", "Atorvastatina"],
  );
  assert.equal(model.continuity.activeMedications.hiddenCount, 1);
});
