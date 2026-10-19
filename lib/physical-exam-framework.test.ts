import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPhysicalExamForContext,
  formatPhysicalExamForSoap,
  hasPhysicalExamData,
  physicalExamFromLegacySystemsReview,
  PHYSICAL_EXAM_END,
  PHYSICAL_EXAM_MARKER,
  EMPTY_PHYSICAL_EXAM,
  resolvePhysicalExamFromNotes,
  serializePhysicalExam,
} from "./physical-exam-framework";
import { serializeClinicalRecord } from "./services/clinical-record";

describe("physical-exam-framework", () => {
  it("mapea revisión por sistemas legacy sin inventar secciones vacías", () => {
    const exam = physicalExamFromLegacySystemsReview({
      skin: "Sin lesiones",
      cardiovascular: "Ritmo regular",
      digestive: "",
      neurological: "",
      respiratory: "",
      genitourinary: "",
    });
    assert.equal(exam.skin, "Sin lesiones");
    assert.equal(exam.cardiovascular, "Ritmo regular");
    assert.equal(exam.head, "");
    assert.ok(hasPhysicalExamData(exam));
  });

  it("resuelve examen desde ficha HD_CR_V1 en notes", () => {
    const notes = serializeClinicalRecord({
      presentIllnessHistory: "",
      systemsReview: {
        skin: "",
        digestive: "Blando, no doloroso",
        neurological: "",
        respiratory: "MV conservado",
        cardiovascular: "",
        genitourinary: "",
      },
      freeNotes: "",
    });
    const exam = resolvePhysicalExamFromNotes(notes);
    assert.equal(exam.abdomen, "Blando, no doloroso");
    assert.equal(exam.respiratory, "MV conservado");
  });

  it("no genera texto SOAP si el examen está vacío", () => {
    assert.equal(formatPhysicalExamForSoap(resolvePhysicalExamFromNotes("")), "");
    assert.equal(formatPhysicalExamForContext(resolvePhysicalExamFromNotes("")), null);
  });

  it("migra heent legacy a cabeza al parsear", () => {
    const notes = `${PHYSICAL_EXAM_MARKER}\n{"v":1,"heent":"Pupilas isocóricas"}\n${PHYSICAL_EXAM_END}`;
    const exam = resolvePhysicalExamFromNotes(notes);
    assert.equal(exam.head, "Pupilas isocóricas");
  });

  it("serializa y parsea marcador HD_PE_V1", () => {
    const block = serializePhysicalExam({
      ...EMPTY_PHYSICAL_EXAM,
      general: "Buen estado general",
    });
    assert.ok(block);
    const exam = resolvePhysicalExamFromNotes(block);
    assert.equal(exam.general, "Buen estado general");
  });

  it("serializa y preserva columna lumbar en bolsa msk (CW-1)", () => {
    const block = serializePhysicalExam({
      ...EMPTY_PHYSICAL_EXAM,
      msk: { lumbar: "Dolor a la palpación L4-L5, Lasègue (−)" },
    });
    assert.ok(block);
    assert.match(block!, /"msk"/);
    assert.match(block!, /lumbar/);
    const exam = resolvePhysicalExamFromNotes(block);
    assert.equal(
      exam.msk.lumbar,
      "Dolor a la palpación L4-L5, Lasègue (−)",
    );
    assert.ok(hasPhysicalExamData(exam));
    const ctx = formatPhysicalExamForContext(exam);
    assert.match(ctx ?? "", /Columna lumbar/);
  });

  it("preserva regiones msk desconocidas en round-trip (escalabilidad)", () => {
    const notes = `${PHYSICAL_EXAM_MARKER}\n${JSON.stringify({
      v: 1,
      msk: { lumbar: "OK", cervical: "Contractura paravertebral" },
    })}\n${PHYSICAL_EXAM_END}`;
    const exam = resolvePhysicalExamFromNotes(notes);
    assert.equal(exam.msk.lumbar, "OK");
    assert.equal(exam.msk.cervical, "Contractura paravertebral");
    const again = serializePhysicalExam(exam);
    assert.ok(again);
    const reparsed = resolvePhysicalExamFromNotes(again);
    assert.equal(reparsed.msk.cervical, "Contractura paravertebral");
  });

  it("encounters históricos sin msk siguen parseando (backward compat)", () => {
    const notes = `${PHYSICAL_EXAM_MARKER}\n{"v":1,"general":"BEG"}\n${PHYSICAL_EXAM_END}`;
    const exam = resolvePhysicalExamFromNotes(notes);
    assert.equal(exam.general, "BEG");
    assert.equal(exam.msk.lumbar, "");
  });
});
