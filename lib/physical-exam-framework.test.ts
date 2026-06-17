import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPhysicalExamForContext,
  formatPhysicalExamForSoap,
  hasPhysicalExamData,
  physicalExamFromLegacySystemsReview,
  PHYSICAL_EXAM_END,
  PHYSICAL_EXAM_MARKER,
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
      general: "Buen estado general",
      head: "",
      neck: "",
      cardiovascular: "",
      respiratory: "",
      abdomen: "",
      neurological: "",
      extremities: "",
      skin: "",
      other: "",
    });
    assert.ok(block);
    const exam = resolvePhysicalExamFromNotes(block);
    assert.equal(exam.general, "Buen estado general");
  });
});
