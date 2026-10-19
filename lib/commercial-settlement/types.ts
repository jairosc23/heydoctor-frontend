/**
 * Commercial Settlement Workflow — independent of Clinical Completion.
 * Encounter remains: draft → in_progress → completed → signed → locked.
 *
 * SettlementId identifies one commercial settlement. It is never ClinicalActId
 * and never CorrelationId.
 */

export const COMMERCIAL_SETTLEMENT_STATES = [
  "pending",
  "payment_initiated",
  "payment_verified",
  "invoiced",
  "locked",
] as const;

export type CommercialSettlementState =
  (typeof COMMERCIAL_SETTLEMENT_STATES)[number];

export type SettlementId = string;
export type EncounterId = string;

export type CommercialSettlementSnapshot = {
  settlementId: SettlementId;
  encounterId: EncounterId;
  /** Read-only mirror of Encounter.status. Never written back to Encounter. */
  encounterStatus: string;
  state: CommercialSettlementState;
  paymentSessionId: string | null;
  isPaid: boolean;
  paymentVerifiedAt: string | null;
  invoiceId: string | null;
  /** Encounter reports locked without payment_verified — CS-2 anomaly. */
  lockAnomaly: boolean;
  updatedAt: string;
};

export type CommercialSettlementAuditChain = {
  settlementId: SettlementId;
  encounter: { encounterId: EncounterId; status: string };
  paymentSession: { paymentSessionId: string | null };
  paymentVerification: {
    isPaid: boolean;
    verifiedAt: string | null;
  };
  invoice: { invoiceId: string | null };
  lock: {
    locked: boolean;
    encounterStatus: string;
    anomalous: boolean;
  };
};

export const COMMERCIAL_SETTLEMENT_STATE_LABELS: Record<
  CommercialSettlementState,
  string
> = {
  pending: "Pendiente",
  payment_initiated: "Pago iniciado",
  payment_verified: "Pago verificado",
  invoiced: "Comprobante emitido",
  locked: "Cierre comercial",
};

export class SettlementIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettlementIntegrityError";
  }
}

export class SettlementPersistenceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettlementPersistenceError";
  }
}

export class SettlementGateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SettlementGateError";
  }
}

export function newSettlementId(): SettlementId {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `set-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function isCompleteSettlementIdentity(
  snapshot: Pick<CommercialSettlementSnapshot, "settlementId" | "encounterId">,
): boolean {
  return Boolean(snapshot.settlementId?.trim() && snapshot.encounterId?.trim());
}

export function createPendingSettlement(
  encounterId: EncounterId,
  extras: Partial<CommercialSettlementSnapshot> = {},
): CommercialSettlementSnapshot {
  const resolvedEncounterId = (extras.encounterId ?? encounterId).trim();
  if (!resolvedEncounterId) {
    throw new SettlementIntegrityError(
      "settlementId and encounterId must be born together",
    );
  }
  if (extras.encounterId && extras.encounterId.trim() !== encounterId.trim()) {
    throw new SettlementIntegrityError(
      "settlementId cannot be bound to a different Encounter",
    );
  }
  const snapshot: CommercialSettlementSnapshot = {
    settlementId: extras.settlementId ?? newSettlementId(),
    encounterId: resolvedEncounterId,
    encounterStatus: extras.encounterStatus ?? "",
    state: extras.state ?? "pending",
    paymentSessionId: extras.paymentSessionId ?? null,
    isPaid: extras.isPaid ?? false,
    paymentVerifiedAt: extras.paymentVerifiedAt ?? null,
    invoiceId: extras.invoiceId ?? null,
    lockAnomaly: extras.lockAnomaly ?? false,
    updatedAt: extras.updatedAt ?? new Date().toISOString(),
  };
  if (!isCompleteSettlementIdentity(snapshot)) {
    throw new SettlementIntegrityError(
      "settlementId and encounterId must be born together",
    );
  }
  return snapshot;
}

export function reconstructCommercialSettlement(
  snapshot: CommercialSettlementSnapshot,
): CommercialSettlementAuditChain {
  return {
    settlementId: snapshot.settlementId,
    encounter: {
      encounterId: snapshot.encounterId,
      status: snapshot.encounterStatus,
    },
    paymentSession: { paymentSessionId: snapshot.paymentSessionId },
    paymentVerification: {
      isPaid: snapshot.isPaid,
      verifiedAt: snapshot.paymentVerifiedAt,
    },
    invoice: { invoiceId: snapshot.invoiceId },
    lock: {
      locked: snapshot.state === "locked",
      encounterStatus: snapshot.encounterStatus,
      anomalous: snapshot.lockAnomaly,
    },
  };
}
