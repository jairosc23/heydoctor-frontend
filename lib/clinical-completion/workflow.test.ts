import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  clearClinicalCompletionSnapshots,
  loadClinicalActById,
  loadClinicalCompletionSnapshot,
  saveClinicalCompletionSnapshot,
} from "./store";
import { createPendingSnapshot, reconstructClinicalAct } from "./types";
import {
  getClinicalActAudit,
  markClinicalCompletionDelivered,
  runClinicalCompletion,
  supersedeClinicalAct,
  whatsAppHandoffUrl,
  type ClinicalCompletionPorts,
} from "./workflow";
import type { EmissionCandidateRecord } from "../emission-pipeline/api";
import type { PrescriptionRecord } from "../services/prescriptions";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "../..");

const CONSULTATION_ID = "11111111-1111-4111-8111-111111111111";
const PRESCRIPTION_ID = "22222222-2222-4222-8222-222222222222";
const EMISSION_ID = "33333333-3333-4333-8333-333333333333";

function prescription(
  overrides: Partial<PrescriptionRecord> = {},
): PrescriptionRecord {
  return {
    id: PRESCRIPTION_ID,
    patientId: "patient-1",
    consultationId: CONSULTATION_ID,
    medications: [{ name: "Losartan", dosage: "50 mg" }],
    validationCode: "HD-RX-1",
    ...overrides,
  };
}

function emission(
  overrides: Partial<EmissionCandidateRecord> = {},
): EmissionCandidateRecord {
  return {
    emissionId: EMISSION_ID,
    consultationId: CONSULTATION_ID,
    state: "emitted",
    emissionClass: "medication",
    habDecisionId: "hab-1",
    emissionPerformed: true,
    sources: [],
    ...overrides,
  };
}

function ports(overrides: Partial<ClinicalCompletionPorts> = {}) {
  const calls = {
    assemble: 0,
    emit: 0,
    authorize: 0,
    confirmHab: 0,
    markSignatureReady: 0,
  };
  const base: ClinicalCompletionPorts = {
    fetchConsultation: async () =>
      ({
        id: CONSULTATION_ID,
        patientId: "patient-1",
        status: "signed",
        signedAt: "2026-08-24T12:00:00.000Z",
      }) as Awaited<ReturnType<ClinicalCompletionPorts["fetchConsultation"]>>,
    fetchPrescriptionsByPatient: async () => [],
    listEmissions: async () => [],
    listHabDecisions: async () => [],
    assemble: async () => {
      calls.assemble += 1;
      return emission({ state: "assembling", emissionPerformed: false });
    },
    markSignatureReady: async (emissionId) => {
      calls.markSignatureReady += 1;
      return emission({
        emissionId,
        state: "ready_for_hab",
        emissionPerformed: false,
        signatureReadiness: "ready",
      });
    },
    authorize: async (emissionId, habDecisionId) => {
      calls.authorize += 1;
      return emission({
        emissionId,
        habDecisionId,
        state: "authorized_pending_pe",
        emissionPerformed: false,
      });
    },
    emit: async (emissionId) => {
      calls.emit += 1;
      return emission({ emissionId, state: "emitted", emissionPerformed: true });
    },
    confirmHab: async () => {
      calls.confirmHab += 1;
      return {
        decisionId: "hab-new",
        kind: "confirm",
        actKind: "prescription_pre_emit",
        actRef: null,
        consultationId: CONSULTATION_ID,
        patientId: "patient-1",
        clinicId: "clinic-1",
        actorUserId: "doc-1",
        actorRole: "doctor",
        rationale: null,
        modificationSummary: null,
        authorityChannel: "human_authority_boundary",
        emissionPerformed: false,
        clinicalPersistencePerformed: false,
        consumedAt: null,
        createdAt: new Date().toISOString(),
      };
    },
    ensurePrescriptionPdf: async () => undefined,
    ensureVisitSummaryPdf: async () => undefined,
    loadSnapshot: (id) =>
      overrides.loadSnapshot
        ? overrides.loadSnapshot(id)
        : (null as ReturnType<ClinicalCompletionPorts["loadSnapshot"]>),
    saveSnapshot: (snapshot) => snapshot,
    ...overrides,
  };
  return { ports: { ...base, ...overrides }, calls };
}

describe("Clinical Completion Workflow", () => {
  it("CC-1 keeps Encounter status as a read-only mirror", async () => {
    const { ports: p } = ports({
      fetchPrescriptionsByPatient: async () => [prescription()],
    });
    const snapshot = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.equal(snapshot.encounterStatus, "signed");
    assert.notEqual(snapshot.state, "signed");
    assert.equal(snapshot.state, "document_ready");
  });

  it("CC-2 does not emit when HAB confirm is missing", async () => {
    const { ports: p, calls } = ports({
      listEmissions: async () => [
        emission({
          state: "ready_for_hab",
          emissionPerformed: false,
          signatureReadiness: "ready",
          sources: [
            {
              sourceKind: "therapy_intent",
              sourceId: "intent-1",
              label: "Plan",
              payload: { medications: [{ name: "Losartan" }] },
            },
          ],
        }),
      ],
      confirmHab: async () => {
        throw Object.assign(new Error("HAB required"), { status: 403 });
      },
    });
    await assert.rejects(
      () =>
        runClinicalCompletion({
          consultationId: CONSULTATION_ID,
          encounterStatus: "signed",
          ports: p,
        }),
      /HAB required/,
    );
    assert.equal(calls.emit, 0);
  });

  it("CC-3 / CC-8 reuses an existing prescription and does not emit again", async () => {
    const { ports: p, calls } = ports({
      fetchPrescriptionsByPatient: async () => [prescription()],
      listEmissions: async () => [emission()],
    });
    const first = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    const second = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.equal(first.prescriptionId, PRESCRIPTION_ID);
    assert.equal(second.prescriptionId, PRESCRIPTION_ID);
    assert.equal(first.emissionId, EMISSION_ID);
    assert.equal(second.emissionId, EMISSION_ID);
    assert.equal(calls.assemble, 0);
    assert.equal(calls.emit, 0);
    assert.equal(calls.confirmHab, 0);
  });

  it("CC-4 uses visit_summary when there is no medication", async () => {
    let visitSummary = 0;
    const { ports: p } = ports({
      ensureVisitSummaryPdf: async () => {
        visitSummary += 1;
      },
    });
    const snapshot = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.equal(snapshot.state, "document_ready");
    assert.equal(snapshot.documentKind, "visit_summary");
    assert.equal(visitSummary, 1);
  });

  it("CC-5 / delivered is idempotent after handoff", async () => {
    clearClinicalCompletionSnapshots();
    saveClinicalCompletionSnapshot({
      ...createPendingSnapshot(CONSULTATION_ID, "signed"),
      state: "document_ready",
      documentKind: "prescription",
      prescriptionId: PRESCRIPTION_ID,
    });
    const first = await markClinicalCompletionDelivered(CONSULTATION_ID);
    const second = await markClinicalCompletionDelivered(CONSULTATION_ID);
    assert.equal(first?.state, "delivered");
    assert.equal(second?.state, "delivered");
    assert.equal(first?.deliveredAt, second?.deliveredAt);
  });

  it("CC-6 does not advance Encounter to locked", async () => {
    const { ports: p } = ports({
      fetchPrescriptionsByPatient: async () => [prescription()],
    });
    const snapshot = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.equal(snapshot.encounterStatus, "signed");
    assert.notEqual(snapshot.encounterStatus, "locked");
  });

  it("CC-8 resumes a delivered snapshot without emitting", async () => {
    const { ports: p, calls } = ports({
      loadSnapshot: () => ({
        ...createPendingSnapshot(CONSULTATION_ID, "signed"),
        state: "delivered",
        prescriptionId: PRESCRIPTION_ID,
        emissionId: EMISSION_ID,
        deliveredAt: "2026-08-24T00:00:00.000Z",
        documentKind: "prescription",
      }),
    });
    const snapshot = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      ports: p,
    });
    assert.equal(snapshot.state, "delivered");
    assert.equal(snapshot.prescriptionId, PRESCRIPTION_ID);
    assert.equal(calls.emit, 0);
    assert.equal(calls.assemble, 0);
  });

  it("builds a doctor-mediated WhatsApp handoff without the global FAB", () => {
    const url = whatsAppHandoffUrl({
      phone: "+56 9 1234 5678",
      validationCode: "HD-RX-1",
    });
    assert.ok(url?.startsWith("https://wa.me/56912345678"));
    assert.ok(url?.includes("HD-RX-1"));
  });

  it("CC-9 reconstructs the clinical act chain from ClinicalActId", async () => {
    clearClinicalCompletionSnapshots();
    const { ports: p } = ports({
      fetchPrescriptionsByPatient: async () => [prescription()],
      listEmissions: async () => [emission({ habDecisionId: "hab-emit-1" })],
      listHabDecisions: async () => [
        {
          decisionId: "hab-sign-1",
          kind: "confirm",
          actKind: "documentation_finalize",
          actRef: null,
          consultationId: CONSULTATION_ID,
          patientId: "patient-1",
          clinicId: "clinic-1",
          actorUserId: "doc-1",
          actorRole: "doctor",
          rationale: null,
          modificationSummary: null,
          authorityChannel: "human_authority_boundary",
          emissionPerformed: false,
          clinicalPersistencePerformed: false,
          consumedAt: null,
          createdAt: "2026-08-24T12:00:00.000Z",
        },
      ],
      loadSnapshot: loadClinicalCompletionSnapshot,
      saveSnapshot: saveClinicalCompletionSnapshot,
      loadActById: loadClinicalActById,
    });
    const snapshot = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.ok(snapshot.clinicalActId);
    assert.equal("correlationId" in snapshot, false);
    const chain = getClinicalActAudit(snapshot.clinicalActId, p);
    assert.ok(chain);
    assert.equal(chain.clinicalActId, snapshot.clinicalActId);
    assert.equal(chain.encounter.consultationId, CONSULTATION_ID);
    assert.equal(chain.signature.signedAt, "2026-08-24T12:00:00.000Z");
    assert.equal(chain.signature.habDecisionId, "hab-sign-1");
    assert.equal(chain.hab.decisionId, "hab-emit-1");
    assert.equal(chain.authorize.emissionId, EMISSION_ID);
    assert.equal(chain.emit.emissionId, EMISSION_ID);
    assert.equal(chain.prescription.prescriptionId, PRESCRIPTION_ID);
    assert.equal(chain.document.kind, "prescription");
    assert.deepEqual(
      reconstructClinicalAct(snapshot).clinicalActId,
      snapshot.clinicalActId,
    );
  });

  it("CC-10 resumes document_ready without sign, HAB or emit", async () => {
    clearClinicalCompletionSnapshots();
    let pdfs = 0;
    const { ports: p, calls } = ports({
      fetchPrescriptionsByPatient: async () => [prescription()],
      listEmissions: async () => [emission()],
      ensurePrescriptionPdf: async () => {
        pdfs += 1;
      },
      loadSnapshot: loadClinicalCompletionSnapshot,
      saveSnapshot: saveClinicalCompletionSnapshot,
      loadActById: loadClinicalActById,
    });
    const first = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.equal(first.state, "document_ready");
    const second = await runClinicalCompletion({
      consultationId: CONSULTATION_ID,
      encounterStatus: "signed",
      patientId: "patient-1",
      ports: p,
    });
    assert.equal(second.clinicalActId, first.clinicalActId);
    assert.equal(second.state, "document_ready");
    assert.equal(second.prescriptionId, first.prescriptionId);
    assert.equal(calls.emit, 0);
    assert.equal(calls.confirmHab, 0);
    assert.equal(calls.assemble, 0);
    assert.equal(pdfs, 1);
  });

  it("CC-11 keeps a frozen act immutable and mints a new ClinicalActId", () => {
    clearClinicalCompletionSnapshots();
    const frozen = saveClinicalCompletionSnapshot({
      ...createPendingSnapshot(CONSULTATION_ID, "signed"),
      state: "document_ready",
      documentKind: "prescription",
      prescriptionId: PRESCRIPTION_ID,
      emissionId: EMISSION_ID,
      emissionHabDecisionId: "hab-emit-1",
      signatureHabDecisionId: "hab-sign-1",
      signedAt: "2026-08-24T12:00:00.000Z",
    });
    const next = supersedeClinicalAct(CONSULTATION_ID, "signed");
    assert.ok(next);
    assert.notEqual(next.clinicalActId, frozen.clinicalActId);
    assert.equal(next.supersedes, frozen.clinicalActId);
    assert.equal(next.state, "pending");
    const archived = loadClinicalActById(frozen.clinicalActId);
    assert.equal(archived?.prescriptionId, PRESCRIPTION_ID);
    assert.equal(archived?.emissionId, EMISSION_ID);
    assert.equal(archived?.signatureHabDecisionId, "hab-sign-1");
    assert.equal(archived?.documentKind, "prescription");
    assert.equal(archived?.supersededBy, next.clinicalActId);
    assert.equal(loadClinicalCompletionSnapshot(CONSULTATION_ID)?.clinicalActId, next.clinicalActId);
  });
});

describe("Clinical Completion freeze", () => {
  it("does not import Copilot, Foundation, payments, portal, or overlay chrome", () => {
    const files = [
      "lib/clinical-completion/workflow.ts",
      "lib/clinical-completion/store.ts",
      "lib/clinical-completion/types.ts",
      "lib/emission-pipeline/api.ts",
      "app/panel/consultas/[id]/_components/chart/ClinicalCompletionSection.tsx",
    ];
    const forbidden = [
      "ClinicalCopilotDrawer",
      "clinical-foundation",
      "ShareConsultationDialog",
      "GlobalWhatsAppFab",
      "PanelLayout",
      "/portal/",
      "generateConsultationInvoice",
      "visual-surfaces",
      "getOrCreateClientCorrelationId",
    ];
    for (const file of files) {
      const source = readFileSync(join(ROOT, file), "utf8");
      for (const token of forbidden) {
        assert.equal(
          source.includes(token),
          false,
          `${file} must not contain ${token}`,
        );
      }
    }
  });
});
