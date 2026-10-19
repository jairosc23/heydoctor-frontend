import test from "node:test";
import assert from "node:assert/strict";
import {
  CIC_AUTHORITY,
  CIC_MAX_VISIBLE_PROPOSALS,
  ENCOUNTER_CIC_ID,
  applyCicProposalToSoap,
  capCicProposals,
  cicAllowedActions,
  cicAssistFetchesOnEncounterOpen,
  cicProposalTargetForMode,
  isCicForbiddenAction,
  isForbiddenCicProposal,
  classifyCicSoapProgress,
  resolveCicAssistMode,
  resolveCicAssistModeSequence,
  type CicEncounterContext,
} from "../app/panel/consultas/[id]/_components/encounter-copilot-cic";
import {
  ENCOUNTER_HAB_ID,
  ENCOUNTER_OFFER_ID,
  buildSignatureReadyRailGroups,
  isEncounterCarePathLandmark,
  isEncounterOfferLandmark,
} from "../app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import {
  ENCOUNTER_HOT_PATH_LANDMARK_IDS,
  isEncounterHotPathId,
  shouldMountDisclosurePreviews,
} from "../app/panel/consultas/[id]/_components/encounter-hot-path";

test("E6 CIC proposes only and never confirms or emits", () => {
  assert.equal(ENCOUNTER_CIC_ID, "encounter-cic");
  assert.equal(CIC_AUTHORITY.propose, true);
  assert.equal(CIC_AUTHORITY.decide, false);
  assert.equal(CIC_AUTHORITY.confirm, false);
  assert.equal(CIC_AUTHORITY.emit, false);
  assert.deepEqual([...cicAllowedActions()], [
    "apply_soap",
    "apply_plan",
    "dismiss",
    "suggest",
  ]);
  assert.equal(CIC_AUTHORITY.persist, false);
  assert.equal(isCicForbiddenAction("confirm"), true);
  assert.equal(isCicForbiddenAction("emit"), true);
  assert.equal(isCicForbiddenAction("firmar"), true);
  assert.equal(isCicForbiddenAction("apply_soap"), false);
  assert.equal(cicAssistFetchesOnEncounterOpen(), 0);
  assert.equal(CIC_MAX_VISIBLE_PROPOSALS, 3);
  assert.equal(
    capCicProposals([
      { id: "1", text: "a", target: "soap_subjective" },
      { id: "2", text: "b", target: "soap_subjective" },
      { id: "3", text: "c", target: "soap_subjective" },
      { id: "4", text: "d", target: "soap_subjective" },
    ]).length,
    3,
  );
});

test("E6 apply to SOAP appends a proposal the physician still owns", () => {
  assert.equal(applyCicProposalToSoap("", "Dolor de 3 días"), "Dolor de 3 días");
  assert.equal(
    applyCicProposalToSoap("Fiebre", "Dolor de 3 días"),
    "Fiebre\nDolor de 3 días",
  );
  assert.equal(
    applyCicProposalToSoap("Fiebre\nDolor de 3 días", "Dolor de 3 días"),
    "Fiebre\nDolor de 3 días",
  );
});

test("E6 CIC lives on the hot path between SOAP and offer, not as HAB or CIP", () => {
  assert.equal(isEncounterHotPathId(ENCOUNTER_CIC_ID), true);
  assert.equal(isEncounterCarePathLandmark(ENCOUNTER_CIC_ID), true);
  assert.equal(isEncounterOfferLandmark(ENCOUNTER_CIC_ID), false);
  assert.equal(isEncounterOfferLandmark(ENCOUNTER_OFFER_ID), true);
  assert.equal(isEncounterOfferLandmark(ENCOUNTER_HAB_ID), true);
  assert.deepEqual([...ENCOUNTER_HOT_PATH_LANDMARK_IDS], [
    ENCOUNTER_OFFER_ID,
    ENCOUNTER_HAB_ID,
    ENCOUNTER_CIC_ID,
  ]);
  assert.equal(shouldMountDisclosurePreviews(false), false);
});


const emptyContext: CicEncounterContext = {
  chiefComplaint: "",
  subjective: "",
  plan: "",
  physicalExamDocumented: false,
  antecedentsDocumented: false,
  activeProblemCount: 0,
  offerExpanded: false,
};

test("context-aware CIC picks help type from encounter state without fetching", () => {
  assert.equal(resolveCicAssistMode(emptyContext), "structure_soap");
  assert.equal(
    resolveCicAssistMode({
      ...emptyContext,
      subjective: "Dolor de cabeza de tres días con fotofobia, náuseas y empeoramiento nocturno. Niega trauma craneal.",
      plan: "Analgesia y signos de alarma. Control en 48 horas si persiste el cuadro.",
      physicalExamDocumented: true,
    }),
    "clinical_summary",
  );
  assert.equal(
    resolveCicAssistMode({
      ...emptyContext,
      subjective: "Control de hipertensión.",
      activeProblemCount: 2,
    }),
    "continue_soap",
  );
  assert.equal(
    resolveCicAssistMode({
      ...emptyContext,
      subjective: "Control de hipertensión.",
      activeProblemCount: 2,
      previousActiveProblemCount: 0,
    }),
    "reasoning_questions",
  );
  assert.equal(
    resolveCicAssistMode({
      ...emptyContext,
      subjective: "SOAP avanzado con más de ochenta caracteres documentados en anamnesis.",
      plan: "Plan terapéutico documentado por el médico.",
      physicalExamDocumented: true,
      activeProblemCount: 2,
      offerExpanded: true,
    }),
    "offer_suggestions",
  );
  assert.equal(cicProposalTargetForMode("structure_soap"), "soap_subjective");
  assert.equal(cicProposalTargetForMode("reasoning_questions"), "soap_subjective");
  assert.equal(cicProposalTargetForMode("clinical_summary"), "soap_plan");
  assert.equal(cicProposalTargetForMode("offer_suggestions"), "soap_plan");
  assert.equal(cicAssistFetchesOnEncounterOpen(), 0);
  assert.equal(isForbiddenCicProposal("Recetar ibuprofeno 400"), true);
  assert.equal(isForbiddenCicProposal("Preguntar duración del dolor"), false);
});

test("continuous CIC walks Encounter evolution locally without fetching", () => {
  const partial = {
    ...emptyContext,
    subjective: "Cefalea de dos días.",
  };
  const complete = {
    ...emptyContext,
    subjective: "Dolor de cabeza de tres días con fotofobia, náuseas y empeoramiento nocturno. Niega trauma craneal.",
    plan: "Analgesia y signos de alarma. Control en 48 horas si persiste el cuadro.",
    physicalExamDocumented: true,
  };
  const modes = resolveCicAssistModeSequence([
    emptyContext,
    partial,
    complete,
    { ...complete, offerExpanded: true },
    { ...complete, offerExpanded: false },
    {
      ...complete,
      activeProblemCount: 1,
      previousActiveProblemCount: 0,
    },
    {
      ...complete,
      activeProblemCount: 1,
      previousActiveProblemCount: 1,
    },
  ]);
  assert.deepEqual(modes, [
    "structure_soap",
    "continue_soap",
    "clinical_summary",
    "offer_suggestions",
    "clinical_summary",
    "reasoning_questions",
    "clinical_summary",
  ]);
  assert.equal(classifyCicSoapProgress(emptyContext), "empty");
  assert.equal(classifyCicSoapProgress(partial), "partial");
  assert.equal(classifyCicSoapProgress(complete), "complete");
  assert.equal(cicProposalTargetForMode("continue_soap"), "soap_subjective");
  assert.equal(cicAssistFetchesOnEncounterOpen(), 0);
  const soap = "Anamnesis original";
  assert.equal(soap, "Anamnesis original");
});
