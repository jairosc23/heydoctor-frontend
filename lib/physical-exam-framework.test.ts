import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatPhysicalExamForContext,
  formatPhysicalExamForSoap,
  hasPhysicalExamData,
  physicalExamFromLegacySystemsReview,
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
    assert.equal(exam.heent, "");
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

  it("serializa y parsea marcador HD_PE_V1", () => {
    const block = serializePhysicalExam({
      general: "Buen estado general",
      heent: "",
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
