"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchPrescriptionsByPatient,
  createPrescription,
  updatePrescription,
  deletePrescription,
  downloadPrescriptionPdf,
  type PrescriptionRecord,
} from "@/lib/services";
import { toClinicalUserError } from "@/lib/clinical-user-error";
import { confirmEmitClassForPersist } from "@/lib/hab-authority/api";
import {
  formatPrescriptionTitle,
  inferPrescriptionStatus,
  sortOrdersByStatusThenDate,
} from "@/lib/orders-command-center";
import {
  emptySelectedMedication,
  type SelectedMedication,
} from "@/lib/types/selected-medication";
import {
  medicationItemsFromSelectedMedications,
  selectedMedicationsFromMedicationItems,
} from "@/lib/prescription-composer";
import {
  buildSafetyDecisionPayload,
  emptyDecisionState,
  type ClinicalDecisionState,
} from "@/lib/prescription-safety";
import { useAuth } from "@/lib/context/AuthContext";
import {
  assistMedicationsFromSelectedMedications,
  composerEditClinical,
  fetchCurrentProtocolAssistPrefill,
  hydrateFromAssistDraft,
  IntakeGateError,
  isComposerBusyForContinuityHandoff,
  projectCompositionStateToForm,
  protocolDraftAsCanonical,
  registerContinuityHydrationApplier,
  validateAssistIntakeEcho,
  type ClinicalAssistPrefillDraft,
  type CompositionState,
  type ContinuityHandoffRequest,
  type ContinuityHandoffResult,
} from "@/lib/composer-intake";
import { PrescriptionComposer } from "./PrescriptionComposer";
import { MedicationOrderBuilder } from "@/components/medication-order";
import {
  isMedicationOrderBuilderEnabled,
  orderLinesFromSelectedMedications,
  selectedMedicationsFromOrderLines,
} from "@/lib/medication-domain";
import { OrdersEmptyState } from "./orders/OrdersEmptyState";
import { UnifiedOrderCard } from "./orders/UnifiedOrderCard";

interface PrescriptionPanelProps {
  patientId: string;
  consultationId?: string | null;
  diagnosisCode?: string;
  onPrescriptionCreated?: () => void;
  className?: string;
  /** Optional pre-loaded assist draft (tests / external opt-in). */
  initialAssistDraft?: ClinicalAssistPrefillDraft | null;
}

export function PrescriptionPanel({
  patientId,
  consultationId,
  diagnosisCode,
  onPrescriptionCreated,
  className = "",
  initialAssistDraft = null,
}: PrescriptionPanelProps) {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const emitInFlightRef = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftLines, setDraftLines] = useState<SelectedMedication[]>([
    emptySelectedMedication(),
  ]);
  const [diagnosis, setDiagnosis] = useState(diagnosisCode ?? "");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [safetyDecisionState, setSafetyDecisionState] =
    useState<ClinicalDecisionState>(() => emptyDecisionState());

  /** PR-8 M2 — Composer-owned Composition State (assist path). */
  const [compositionState, setCompositionState] =
    useState<CompositionState | null>(null);
  const [confirmationGateChecked, setConfirmationGateChecked] = useState(false);
  const [protocolIdInput, setProtocolIdInput] = useState("");
  const [hydrating, setHydrating] = useState(false);

  const assistActive = Boolean(compositionState?.assistanceSession);

  const handleSafetyDecisionStateChange = useCallback(
    (state: ClinicalDecisionState) => {
      setSafetyDecisionState(state);
    },
    [],
  );

  const applyCompositionToForm = useCallback((state: CompositionState) => {
    const projected = projectCompositionStateToForm(state);
    setDiagnosis(projected.diagnosis);
    setNotes(projected.notes);
    setDraftLines(projected.lines);
  }, []);

  const compositionStateRef = useRef(compositionState);
  compositionStateRef.current = compositionState;

  const hydrateFromDraft = useCallback(
    async (rawDraft: ClinicalAssistPrefillDraft) => {
      if (!user?.id || !user.clinicId) {
        throw new Error("Sesión de médico requerida para intake asistido");
      }
      if (!patientId?.trim()) {
        throw new Error("patient_required");
      }

      const canonical =
        rawDraft.sourceAssetType === "clinical_protocol"
          ? protocolDraftAsCanonical(rawDraft)
          : rawDraft;

      const echoed = await validateAssistIntakeEcho(canonical);
      const state = hydrateFromAssistDraft(echoed.draft, {
        actorDoctorId: user.id,
        clinicId: user.clinicId,
        patientId,
        consultationId: consultationId ?? null,
      });

      setCompositionState(state);
      applyCompositionToForm(state);
      setConfirmationGateChecked(false);
      setEditingId(null);
      setSafetyDecisionState(emptyDecisionState());
    },
    [user, patientId, consultationId, applyCompositionToForm],
  );

  /**
   * PR-11 C2 — sole Continuity → Composer entry (applyContinuityHydrationDraft).
   * Busy block-only; validate-echo only for clinical_protocol gate; no emit.
   */
  useEffect(() => {
    const applier = async (
      req: ContinuityHandoffRequest,
    ): Promise<ContinuityHandoffResult> => {
      const lifecycle = compositionStateRef.current?.lifecycle ?? null;
      if (isComposerBusyForContinuityHandoff(lifecycle)) {
        return { ok: false, handoffId: req.handoffId, code: "composer_busy" };
      }
      if (req.patientId !== patientId) {
        return {
          ok: false,
          handoffId: req.handoffId,
          code: "patient_mismatch",
        };
      }
      if (!user?.id || !user.clinicId) {
        return {
          ok: false,
          handoffId: req.handoffId,
          code: "handoff_rejected",
        };
      }

      try {
        // TDR4 — copy draft fields into CompositionState; do not mutate req.draft
        let draftForHydrate: ClinicalAssistPrefillDraft = {
          ...req.draft,
          medications: req.draft.medications.map((m) => ({ ...m })),
        };

        if (req.hydrationGate === "validate-echo") {
          const canonical =
            draftForHydrate.sourceAssetType === "clinical_protocol"
              ? protocolDraftAsCanonical(draftForHydrate)
              : draftForHydrate;
          const echoed = await validateAssistIntakeEcho(canonical);
          draftForHydrate = echoed.draft;
        }

        const state = hydrateFromAssistDraft(draftForHydrate, {
          actorDoctorId: user.id,
          clinicId: user.clinicId,
          patientId,
          consultationId: consultationId ?? req.encounterId ?? null,
        });

        setCompositionState(state);
        applyCompositionToForm(state);
        setConfirmationGateChecked(false);
        setEditingId(null);
        setSafetyDecisionState(emptyDecisionState());
        setError(null);

        return {
          ok: true,
          handoffId: req.handoffId,
          composerLifecycle: "HYDRATED",
        };
      } catch {
        return {
          ok: false,
          handoffId: req.handoffId,
          code: "handoff_rejected",
        };
      }
    };

    registerContinuityHydrationApplier(applier);
    return () => registerContinuityHydrationApplier(null);
  }, [user, patientId, consultationId, applyCompositionToForm]);

  const reload = async () => {
    const list = await fetchPrescriptionsByPatient(patientId);
    setPrescriptions(list);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setListError(null);
    fetchPrescriptionsByPatient(patientId)
      .then((list) => {
        if (!cancelled) setPrescriptions(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setPrescriptions([]);
          setListError(
            toClinicalUserError(e, "No se pudieron cargar recetas."),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  useEffect(() => {
    if (!compositionState) {
      setDiagnosis(diagnosisCode ?? "");
    }
  }, [diagnosisCode, compositionState]);

  useEffect(() => {
    if (!initialAssistDraft) return;
    let cancelled = false;
    setHydrating(true);
    setError(null);
    hydrateFromDraft(initialAssistDraft)
      .catch((e) => {
        if (!cancelled) {
          setError(
            e instanceof IntakeGateError
              ? e.message
              : toClinicalUserError(e, "No se pudo hidratar asistencia"),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setHydrating(false);
      });
    return () => {
      cancelled = true;
    };
  }, [initialAssistDraft, hydrateFromDraft]);

  const clearAssistSession = () => {
    setCompositionState(null);
    setConfirmationGateChecked(false);
  };

  const resetForm = () => {
    setEditingId(null);
    setDraftLines([emptySelectedMedication()]);
    setNotes("");
    setSafetyDecisionState(emptyDecisionState());
    clearAssistSession();
  };

  const handleDiagnosisChange = (value: string) => {
    setDiagnosis(value);
    if (compositionState) {
      setCompositionState(
        composerEditClinical(compositionState, { diagnosis: value }),
      );
      setConfirmationGateChecked(false);
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    if (compositionState) {
      setCompositionState(
        composerEditClinical(compositionState, { notes: value }),
      );
      setConfirmationGateChecked(false);
    }
  };

  const handleLinesChange = (lines: SelectedMedication[]) => {
    setDraftLines(lines);
    if (compositionState) {
      setCompositionState(
        composerEditClinical(compositionState, {
          medications: assistMedicationsFromSelectedMedications(lines),
        }),
      );
      setConfirmationGateChecked(false);
    }
  };

  const handleHydrateProtocol = async () => {
    const protocolId = protocolIdInput.trim();
    if (!protocolId) {
      setError("Indique el ID del protocolo publicado");
      return;
    }
    setHydrating(true);
    setError(null);
    try {
      const draft = await fetchCurrentProtocolAssistPrefill(protocolId);
      await hydrateFromDraft(draft);
    } catch (e) {
      setError(
        e instanceof IntakeGateError
          ? e.message
          : toClinicalUserError(
              e,
              "No se pudo cargar asistencia del protocolo",
            ),
      );
    } finally {
      setHydrating(false);
    }
  };

  const handleSave = async () => {
    if (creating || emitInFlightRef.current) return;
    emitInFlightRef.current = true;
    setCreating(true);
    setError(null);
    const safetyDecision = buildSafetyDecisionPayload(safetyDecisionState);
    try {
      if (assistActive && compositionState) {
        if (!confirmationGateChecked) {
          setError("Confirmation Gate: confirme antes de emitir");
          return;
        }
        // W1.1 C6 — confirmAndEmit removed; require HAB then PE (E11).
        setError(
          "Confirmación y emisión están separadas. Use Confirmación de autoridad (HAB); la emisión queda para el motor de prescripción (E11).",
        );
        return;
      }

      const meds = medicationItemsFromSelectedMedications(draftLines);
      if (meds.length === 0) return;

      const habDecisionId = await confirmEmitClassForPersist({
        consultationId,
        actKind: "prescription_pre_emit",
      });

      if (editingId) {
        await updatePrescription(editingId, {
          diagnosis: diagnosis || undefined,
          medications: meds,
          notes: notes || undefined,
          safetyDecision,
          habDecisionId,
        });
      } else {
        await createPrescription({
          patientId,
          consultationId: consultationId ?? undefined,
          diagnosis: diagnosis || undefined,
          medications: meds,
          notes: notes || undefined,
          safetyDecision,
          habDecisionId,
        });
        onPrescriptionCreated?.();
      }
      resetForm();
      await reload();
    } catch (e) {
      setError(toClinicalUserError(e, "Error al guardar receta"));
    } finally {
      emitInFlightRef.current = false;
      setCreating(false);
    }
  };

  const startEdit = (p: PrescriptionRecord) => {
    clearAssistSession();
    setEditingId(p.id);
    setDraftLines(selectedMedicationsFromMedicationItems(p.medications));
    setDiagnosis(p.diagnosis ?? "");
    setNotes(p.notes ?? "");
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Eliminar esta receta?")) return;
    setError(null);
    try {
      const target = prescriptions.find((item) => item.id === id);
      const habDecisionId = await confirmEmitClassForPersist({
        consultationId: target?.consultationId ?? consultationId,
        actKind: "prescription_pre_emit",
      });
      await deletePrescription(id, habDecisionId);
      if (editingId === id) resetForm();
      await reload();
    } catch (e) {
      setError(toClinicalUserError(e, "No se pudo eliminar"));
    }
  };

  const handlePdf = async (id: string) => {
    setPdfLoadingId(id);
    setError(null);
    try {
      await downloadPrescriptionPdf(id);
    } catch (e) {
      setError(toClinicalUserError(e, "No se pudo generar el PDF"));
    } finally {
      setPdfLoadingId(null);
    }
  };

  const assistBanner =
    compositionState?.assistanceSession != null
      ? {
          sourceAssetType: compositionState.assistanceSession.sourceAssetType,
          sourceAssetId: compositionState.assistanceSession.sourceAssetId,
          sourceRevisionId: compositionState.assistanceSession.sourceRevisionId,
          cie10Hints:
            compositionState.assistanceSession.assistanceContext.cie10Hints,
          omittedMedicationLines:
            compositionState.assistanceSession.assistanceContext
              .omittedMedicationLines.length,
          physicianEdited: compositionState.physicianEdited,
        }
      : null;

  return (
    <section
      className={`rounded-lg border border-gray-200 p-4 ${className}`}
      style={{ background: "white" }}
      data-testid="prescription-panel"
    >
      <h3 className="mb-3 flex items-center gap-2 font-medium text-gray-700">
        <span>💊</span> Recetas médicas
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando recetas...</p>
      ) : (
        <>
          {listError && (
            <p
              role="alert"
              className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 text-xs text-amber-800"
            >
              {listError}{" "}
              <button
                type="button"
                className="font-semibold underline"
                onClick={() => void reload()}
              >
                Reintentar
              </button>
            </p>
          )}
          {prescriptions.length === 0 ? (
            <div className="mb-4">
              <OrdersEmptyState
                message="Sin órdenes registradas"
                actionLabel="Crear nueva receta"
                onAction={() => {
                  document
                    .getElementById("prescription-form")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              />
            </div>
          ) : (
            <div className="mb-4 max-h-56 space-y-2 overflow-y-auto">
              {sortOrdersByStatusThenDate(
                prescriptions,
                (item) => inferPrescriptionStatus(item.status),
                (item) => item.createdAt,
              ).map((p) => (
                <UnifiedOrderCard
                  key={p.id}
                  kind="Receta médica"
                  title={formatPrescriptionTitle(p)}
                  status={inferPrescriptionStatus(p.status)}
                  updatedAt={p.createdAt}
                  actions={
                    <>
                      <button
                        type="button"
                        onClick={() => startEdit(p)}
                        className="rounded font-medium text-slate-600 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
                        aria-label={`Editar receta ${formatPrescriptionTitle(p)}`}
                      >
                        Editar
                      </button>
                      <span className="text-slate-300" aria-hidden>
                        |
                      </span>
                      <button
                        type="button"
                        onClick={() => void handlePdf(p.id)}
                        disabled={pdfLoadingId === p.id}
                        className="rounded font-medium text-slate-600 hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:opacity-50"
                        aria-label={`Descargar PDF de ${formatPrescriptionTitle(p)}`}
                      >
                        {pdfLoadingId === p.id ? "PDF…" : "PDF"}
                      </button>
                      <span className="text-slate-300" aria-hidden>
                        |
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleDelete(p.id)}
                        className="rounded font-medium text-slate-500 hover:text-red-600 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        aria-label={`Eliminar receta ${formatPrescriptionTitle(p)}`}
                      >
                        Eliminar
                      </button>
                    </>
                  }
                />
              ))}
            </div>
          )}

          {!editingId ? (
            <div
              className="mb-3 space-y-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              data-testid="composer-assist-intake"
            >
              <p className="text-xs font-medium text-slate-700">
                Asistencia de protocolo (opt-in)
              </p>
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[12rem] flex-1 text-xs text-slate-600">
                  ID protocolo publicado
                  <input
                    type="text"
                    value={protocolIdInput}
                    onChange={(e) => setProtocolIdInput(e.target.value)}
                    placeholder="UUID del protocolo"
                    className="mt-1 w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    data-testid="assist-protocol-id-input"
                    disabled={hydrating}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void handleHydrateProtocol()}
                  disabled={hydrating || !protocolIdInput.trim()}
                  className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  data-testid="assist-hydrate-button"
                >
                  {hydrating ? "Hidratando…" : "Usar en composición"}
                </button>
                {assistActive ? (
                  <button
                    type="button"
                    onClick={clearAssistSession}
                    className="rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
                    data-testid="assist-discard-button"
                  >
                    Descartar asistencia
                  </button>
                ) : null}
              </div>
              <p className="text-[11px] text-slate-500">
                Contrato de entrada: ClinicalAssistPrefillDraft. No evalúa
                reglas ni emite automáticamente.
              </p>
            </div>
          ) : null}

          {isMedicationOrderBuilderEnabled() ? (
            <MedicationOrderBuilder
              lines={orderLinesFromSelectedMedications(draftLines)}
              onChange={(orderLines) =>
                handleLinesChange(selectedMedicationsFromOrderLines(orderLines))
              }
              patientId={patientId}
              consultationId={consultationId}
              diagnosis={diagnosis}
              onDiagnosisChange={handleDiagnosisChange}
              notes={notes}
              onNotesChange={handleNotesChange}
              error={error}
              saving={creating || hydrating}
              editing={Boolean(editingId)}
              onSave={() => void handleSave()}
              onCancelEdit={editingId ? resetForm : undefined}
              onSafetyDecisionStateChange={handleSafetyDecisionStateChange}
              assistSession={assistBanner}
              assistEmitMode={assistActive && !editingId}
              confirmationGateChecked={confirmationGateChecked}
              onConfirmationGateChange={setConfirmationGateChecked}
            />
          ) : (
            <PrescriptionComposer
              lines={draftLines}
              onChange={handleLinesChange}
              patientId={patientId}
              consultationId={consultationId}
              diagnosis={diagnosis}
              onDiagnosisChange={handleDiagnosisChange}
              notes={notes}
              onNotesChange={handleNotesChange}
              error={error}
              saving={creating || hydrating}
              editing={Boolean(editingId)}
              onSave={() => void handleSave()}
              onCancelEdit={editingId ? resetForm : undefined}
              onSafetyDecisionStateChange={handleSafetyDecisionStateChange}
              assistSession={assistBanner}
              assistEmitMode={assistActive && !editingId}
              confirmationGateChecked={confirmationGateChecked}
              onConfirmationGateChange={setConfirmationGateChecked}
            />
          )}
        </>
      )}
    </section>
  );
}
