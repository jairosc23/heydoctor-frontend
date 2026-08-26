"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  COMMERCIAL_SETTLEMENT_STATE_LABELS,
  type CommercialSettlementSnapshot,
} from "@/lib/commercial-settlement/types";
import {
  downloadSettlementReceipt,
  initiateCommercialPayment,
  observeCommercialSettlement,
} from "@/lib/commercial-settlement/workflow";
import { cn } from "@/lib/utils";

export function CommercialSettlementSection({
  encounterId,
  encounterStatus,
  enabled,
}: {
  encounterId?: string | null;
  encounterStatus: string;
  enabled: boolean;
}) {
  const params = useParams();
  const resolvedId =
    encounterId || (typeof params?.id === "string" ? params.id : "") || "";
  const [snapshot, setSnapshot] = useState<CommercialSettlementSnapshot | null>(
    null,
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hydrate = useCallback(async () => {
    if (!enabled || !resolvedId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await observeCommercialSettlement({
        encounterId: resolvedId,
        paymentQuery: null,
      });
      setSnapshot(next);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cargar el cierre comercial.",
      );
    } finally {
      setBusy(false);
    }
  }, [enabled, resolvedId]);

  useEffect(() => {
    void hydrate();
  }, [hydrate, encounterStatus]);

  const pay = useCallback(async () => {
    if (!resolvedId) return;
    setBusy(true);
    setError(null);
    try {
      const result = await initiateCommercialPayment({
        encounterId: resolvedId,
      });
      setSnapshot(result.snapshot);
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo iniciar el pago.",
      );
      setBusy(false);
    }
  }, [resolvedId]);

  const verify = useCallback(async () => {
    if (!resolvedId) return;
    setBusy(true);
    setError(null);
    try {
      const next = await observeCommercialSettlement({
        encounterId: resolvedId,
        paymentQuery: null,
      });
      setSnapshot(next);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo verificar el pago.",
      );
    } finally {
      setBusy(false);
    }
  }, [resolvedId]);

  const download = useCallback(async () => {
    if (!snapshot) return;
    setBusy(true);
    setError(null);
    try {
      await downloadSettlementReceipt(snapshot);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo descargar el comprobante.",
      );
    } finally {
      setBusy(false);
    }
  }, [snapshot]);

  if (!enabled || !resolvedId) return null;

  const state = snapshot?.state ?? "pending";
  const canStartPayment =
    !snapshot?.isPaid &&
    (state === "pending" || state === "payment_initiated") &&
    encounterStatus === "signed";

  return (
    <div
      className="mt-hd-3 space-y-hd-2 rounded-hd-md border border-slate-200 bg-white p-hd-3"
      data-testid="commercial-settlement-section"
      data-settlement-state={state}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-800">
          Cierre comercial
        </h4>
        <span
          className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700"
          data-testid="commercial-settlement-state"
        >
          {COMMERCIAL_SETTLEMENT_STATE_LABELS[state]}
        </span>
      </div>
      <p className="text-xs text-slate-600">
        Pago verificado, comprobante y bloqueo comercial. Independiente del acto
        clínico.
      </p>
      {snapshot?.settlementId ? (
        <p
          className="break-all font-mono text-[10px] text-slate-500"
          data-testid="commercial-settlement-id"
        >
          SettlementId {snapshot.settlementId}
        </p>
      ) : null}
      {snapshot?.lockAnomaly ? (
        <p className="text-xs text-red-700" role="alert">
          El Encounter figura bloqueado sin pago verificado. El cierre comercial
          no se considera válido.
        </p>
      ) : null}
      {snapshot?.isPaid && state !== "locked" ? (
        <p className="text-xs text-slate-700">
          Pago verificado. El bloqueo comercial se observa cuando el Encounter
          pasa a locked.
        </p>
      ) : null}
      {busy ? <p className="text-xs text-slate-500">Procesando…</p> : null}
      {error ? (
        <p className="text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          data-testid="commercial-settlement-pay"
          disabled={busy || !canStartPayment}
          onClick={() => void pay()}
          className={cn(
            "inline-flex h-8 items-center rounded-hd-md border border-primary/20 bg-white px-3 text-xs font-semibold text-primary shadow-sm hover:bg-white",
            (busy || !canStartPayment) && "cursor-not-allowed opacity-55",
          )}
        >
          Iniciar pago
        </button>
        <button
          type="button"
          data-testid="commercial-settlement-verify"
          disabled={busy || !snapshot}
          onClick={() => void verify()}
          className={cn(
            "inline-flex h-8 items-center rounded-hd-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50",
            (busy || !snapshot) && "cursor-not-allowed opacity-55",
          )}
        >
          Verificar pago
        </button>
        <button
          type="button"
          data-testid="commercial-settlement-receipt"
          disabled={busy || !snapshot?.invoiceId}
          onClick={() => void download()}
          className={cn(
            "inline-flex h-8 items-center rounded-hd-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50",
            (busy || !snapshot?.invoiceId) && "cursor-not-allowed opacity-55",
          )}
        >
          Descargar comprobante
        </button>
      </div>
    </div>
  );
}
