"use client";

/**
 * EPIC-3 UC-04D — H2 approve → H3 persist → H4 sign orchestration hook.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildInitialCloseHitlAudit,
  runCloseHitlH2Approve,
  runCloseHitlH3Persist,
  runCloseHitlH4Sign,
  validatePreviewForPersistence,
  type CloseHitlAuditTrail,
} from "@/lib/epic3/close-hitl-execution";
import {
  loadCloseHitlAudit,
  saveCloseHitlAudit,
} from "@/lib/epic3/close-hitl-session";
import type { PersistencePreviewPayload } from "@/lib/epic3/persistence-preview";

export function useCloseHitlExecution(input: {
  open: boolean;
  preview: PersistencePreviewPayload;
  expectedVersion: string | null | undefined;
  existingNotes: string | null | undefined;
  /** W1.1 C2 — HAB Confirm id required for H3/H4. */
  habDecisionId?: string | null;
  /** Prefer page handleSign (flush + tracking). Falls back to API sign. */
  signConsultationFn?: (signatureBase64: string) => Promise<void>;
  onPersisted?: () => void;
  onSigned?: () => void;
}): {
  audit: CloseHitlAuditTrail | null;
  gateOk: boolean;
  gateReason: string | null;
  busy: boolean;
  error: string | null;
  approveH2: () => Promise<void>;
  executeH3: () => Promise<void>;
  signH4: (signatureBase64: string) => Promise<void>;
} {
  const [audit, setAudit] = useState<CloseHitlAuditTrail | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gate = useMemo(
    () => validatePreviewForPersistence(input.preview),
    [input.preview],
  );

  useEffect(() => {
    if (!input.open || !input.preview.sessionId) {
      setAudit(null);
      return;
    }
    const loaded = loadCloseHitlAudit(input.preview.sessionId);
    setAudit(loaded ?? buildInitialCloseHitlAudit(input.preview));
  }, [input.open, input.preview]);

  const persistAudit = useCallback((next: CloseHitlAuditTrail) => {
    setAudit(next);
    saveCloseHitlAudit(next);
  }, []);

  const approveH2 = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const { audit: next } = await runCloseHitlH2Approve({
        preview: input.preview,
      });
      persistAudit(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "h2_failed");
      persistAudit({
        ...(audit ?? buildInitialCloseHitlAudit(input.preview)),
        h2Status: "failed",
        reason: err instanceof Error ? err.message : "h2_failed",
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setBusy(false);
    }
  }, [audit, input.preview, persistAudit]);

  const executeH3 = useCallback(async () => {
    if (!audit) return;
    setBusy(true);
    setError(null);
    try {
      if (!input.expectedVersion) {
        throw new Error("missing_expected_version");
      }
      if (!input.habDecisionId?.trim()) {
        throw new Error("hab_confirm_required_before_h3");
      }
      const { audit: next, writeExecuted } = await runCloseHitlH3Persist({
        preview: input.preview,
        expectedVersion: input.expectedVersion,
        existingNotes: input.existingNotes,
        priorAudit: audit,
        habDecisionId: input.habDecisionId,
      });
      persistAudit(next);
      if (writeExecuted) {
        input.onPersisted?.();
      } else {
        setError(next.reason ?? "h3_not_executed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "h3_failed");
      persistAudit({
        ...audit,
        h3Status: "failed",
        reason: err instanceof Error ? err.message : "h3_failed",
        updatedAt: new Date().toISOString(),
      });
    } finally {
      setBusy(false);
    }
  }, [audit, input, persistAudit]);

  const signH4 = useCallback(
    async (signatureBase64: string) => {
      if (!audit) return;
      if (audit.h3Status !== "executed" || !audit.writeExecuted) {
        setError("h3_required_before_h4");
        return;
      }
      const consultationId = input.preview.consultationId;
      if (!consultationId && !input.signConsultationFn) {
        setError("missing_consultation_id");
        return;
      }
      setBusy(true);
      setError(null);
      try {
        if (input.signConsultationFn) {
          await input.signConsultationFn(signatureBase64);
          const next: CloseHitlAuditTrail = {
            ...audit,
            h4Status: "signed",
            reason: "h4_consultation_signed",
            updatedAt: new Date().toISOString(),
          };
          persistAudit(next);
        } else {
          if (!input.habDecisionId?.trim()) {
            throw new Error("hab_confirm_required_before_h4");
          }
          const { audit: next } = await runCloseHitlH4Sign({
            consultationId: consultationId!,
            signatureBase64,
            priorAudit: audit,
            habDecisionId: input.habDecisionId,
          });
          persistAudit(next);
        }
        input.onSigned?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "h4_failed");
        persistAudit({
          ...audit,
          h4Status: "failed",
          reason: err instanceof Error ? err.message : "h4_failed",
          updatedAt: new Date().toISOString(),
        });
      } finally {
        setBusy(false);
      }
    },
    [audit, input, persistAudit],
  );

  return {
    audit,
    gateOk: gate.ok,
    gateReason: gate.reason,
    busy,
    error,
    approveH2,
    executeH3,
    signH4,
  };
}
