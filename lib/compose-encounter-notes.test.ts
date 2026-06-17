import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  composeEncounterNotes,
  parseEncounterNotes,
  stripAllEncounterMarkers,
} from "./compose-encounter-notes";
import { serializeClinicalVitalSigns } from "./clinical-vital-signs-context";
import { serializePhysicalExam } from "./physical-exam-framework";
import { serializeClinicalRecord } from "./services/clinical-record";

describe("compose-encounter-notes", () => {
  it("round-trip preserva vitales y examen físico junto con ficha clínica", () => {
    const draft = {
      clinicalRecord: {
        presentIllnessHistory: "Cefalea de 48h",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "Evolución favorable",
      },
      vitals: {
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
      },
      physicalExam: {
        general: "Buen estado general",
        head: "Normocefálico",
        neck: "Sin adenopatías",
        cardiovascular: "Ritmo regular",
        respiratory: "MV conservado",
        abdomen: "Blando",
        neurological: "Sin focalidad",
        extremities: "Sin edema",
        skin: "Hidratada",
        other: "",
      },
    };

    const composed = composeEncounterNotes(draft);
    const parsed = parseEncounterNotes(composed);

    assert.equal(parsed.clinicalRecord.presentIllnessHistory, "Cefalea de 48h");
    assert.equal(parsed.clinicalRecord.freeNotes, "Evolución favorable");
    assert.equal(parsed.vitals.systolic, 120);
    assert.equal(parsed.vitals.heartRate, 72);
    assert.equal(parsed.physicalExam.general, "Buen estado general");
    assert.equal(parsed.physicalExam.head, "Normocefálico");
    assert.equal(parsed.physicalExam.neck, "Sin adenopatías");
  });

  it("no pierde bloques HD_VS_V1 al recomponer con nueva ficha", () => {
    const vitalsBlock = serializeClinicalVitalSigns({
      systolic: 140,
      diastolic: 90,
    });
    const raw = `Nota libre\n\n${vitalsBlock}`;
    const parsed = parseEncounterNotes(raw);

    const recomposed = composeEncounterNotes({
      ...parsed,
      clinicalRecord: {
        ...parsed.clinicalRecord,
        presentIllnessHistory: "Nueva HEA",
      },
    });

    const again = parseEncounterNotes(recomposed);
    assert.equal(again.vitals.systolic, 140);
    assert.equal(again.vitals.diastolic, 90);
    assert.equal(again.clinicalRecord.presentIllnessHistory, "Nueva HEA");
    assert.equal(again.clinicalRecord.freeNotes, "Nota libre");
  });

  it("stripAllEncounterMarkers deja solo texto libre", () => {
    const cr = serializeClinicalRecord({
      presentIllnessHistory: "HEA",
      systemsReview: {
        skin: "",
        digestive: "",
        neurological: "",
        respiratory: "",
        cardiovascular: "",
        genitourinary: "",
      },
      freeNotes: "",
    });
    const pe = serializePhysicalExam({
      general: "Normal",
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
    const raw = `Texto médico\n\n${cr}\n\n${pe}`;
    assert.equal(stripAllEncounterMarkers(raw), "Texto médico");
  });
});
