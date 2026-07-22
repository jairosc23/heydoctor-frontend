import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePrescription } from "./engine";
import { parseDose, parseDurationDays, parseFrequency } from "./parsers";

describe("prescription-calculation parsers (PR-3)", () => {
  it("parses dose amount and unit", () => {
    assert.deepEqual(parseDose("1 comprimido"), {
      amount: 1,
      unit: "comprimido",
    });
    assert.deepEqual(parseDose("2 comprimidos"), {
      amount: 2,
      unit: "comprimido",
    });
    assert.deepEqual(parseDose("5 mL"), { amount: 5, unit: "mL" });
    assert.deepEqual(parseDose("1 aplicación"), {
      amount: 1,
      unit: "aplicación",
    });
  });

  it("parses interval frequency to doses/day", () => {
    assert.deepEqual(parseFrequency("cada 8 horas"), {
      kind: "scheduled",
      dosesPerDay: 3,
    });
    assert.deepEqual(parseFrequency("c/12 h"), {
      kind: "scheduled",
      dosesPerDay: 2,
    });
    assert.deepEqual(parseFrequency("diaria"), {
      kind: "scheduled",
      dosesPerDay: 1,
    });
  });

  it("marks PRN as non-deterministic frequency", () => {
    assert.equal(parseFrequency("PRN").kind, "prn");
    assert.equal(parseFrequency("según necesidad").kind, "prn");
  });

  it("parses duration in days", () => {
    assert.equal(parseDurationDays("7 días"), 7);
    assert.equal(parseDurationDays("10 días"), 10);
    assert.equal(parseDurationDays("30"), 30);
  });
});

describe("prescription-calculation engine (PR-3)", () => {
  it("1 comprimido cada 8 horas × 7 días → 21 comprimidos", () => {
    const r = calculatePrescription({
      dosage: "1 comprimido",
      frequency: "cada 8 horas",
      duration: "7 días",
      dosageForm: "comprimido",
    });
    assert.equal(r.status, "computed");
    assert.equal(r.dosesPerDay, 3);
    assert.equal(r.dailyConsumption, 3);
    assert.equal(r.durationDays, 7);
    assert.equal(r.totalQuantity, 21);
    assert.equal(r.finalQuantity, 21);
    assert.equal(r.display.quantity, "21 comprimidos");
    assert.equal(r.display.dailyConsumption, "3 comprimidos/día");
    assert.equal(r.display.duration, "7 días");
  });

  it("2 comprimidos cada 12 horas × 10 días → 40 comprimidos", () => {
    const r = calculatePrescription({
      dosage: "2 comprimidos",
      frequency: "cada 12 horas",
      duration: "10 días",
    });
    assert.equal(r.status, "computed");
    assert.equal(r.dosesPerDay, 2);
    assert.equal(r.dailyConsumption, 4);
    assert.equal(r.totalQuantity, 40);
    assert.equal(r.finalQuantity, 40);
    assert.equal(r.display.quantity, "40 comprimidos");
  });

  it("5 mL cada 8 horas × 5 días → 75 mL", () => {
    const r = calculatePrescription({
      dosage: "5 mL",
      frequency: "cada 8 horas",
      duration: "5 días",
    });
    assert.equal(r.status, "computed");
    assert.equal(r.dailyConsumption, 15);
    assert.equal(r.totalQuantity, 75);
    assert.equal(r.finalQuantity, 75);
    assert.equal(r.quantityUnit, "mL");
    assert.equal(r.display.quantity, "75 mL");
    assert.equal(r.display.dailyConsumption, "15 mL/día");
  });

  it("1 aplicación diaria × 30 días → 30 aplicaciones", () => {
    const r = calculatePrescription({
      dosage: "1 aplicación",
      frequency: "diaria",
      duration: "30 días",
    });
    assert.equal(r.status, "computed");
    assert.equal(r.dosesPerDay, 1);
    assert.equal(r.dailyConsumption, 1);
    assert.equal(r.totalQuantity, 30);
    assert.equal(r.finalQuantity, 30);
    assert.equal(r.display.quantity, "30 aplicaciones");
    assert.equal(r.display.duration, "30 días");
  });

  it("PRN — sin cantidad automática", () => {
    const r = calculatePrescription({
      dosage: "1 comprimido",
      frequency: "PRN",
      duration: "5 días",
    });
    assert.equal(r.status, "non_deterministic");
    assert.equal(r.reasonCode, "prn_non_deterministic");
    assert.equal(r.totalQuantity, undefined);
    assert.equal(r.finalQuantity, undefined);
    assert.match(r.display.quantity, /PRN/i);
  });

  it("reacts to presentation form when dose unit omitted", () => {
    const r = calculatePrescription({
      dosage: "1",
      frequency: "cada 8 horas",
      duration: "7 días",
      dosageForm: "cápsula",
    });
    assert.equal(r.status, "computed");
    assert.equal(r.finalQuantity, 21);
    assert.equal(r.quantityUnit, "cápsula");
    assert.equal(r.display.quantity, "21 cápsulas");
  });

  it("incomplete when frequency is free prose", () => {
    const r = calculatePrescription({
      dosage: "1 comprimido",
      frequency: "como le parezca al paciente",
      duration: "7 días",
    });
    assert.equal(r.status, "incomplete");
    assert.equal(r.reasonCode, "unparseable_frequency");
  });
});
