import { resolveCanPay } from "../consultation-production-gates";
import {
  createEncounterInvoice,
  createEncounterPaymentSession,
  downloadEncounterInvoice,
  fetchEncounter,
  fetchEncounterPaymentStatus,
  fetchSettlementInvoiceAmount,
  findInvoiceForEncounter,
} from "./api";
import {
  loadSettlementByEncounterId,
  loadSettlementById,
  persistSettlementAtomic,
} from "./store";
import {
  SettlementGateError,
  SettlementIntegrityError,
  createPendingSettlement,
  reconstructCommercialSettlement,
  type CommercialSettlementAuditChain,
  type CommercialSettlementSnapshot,
  type EncounterId,
  type SettlementId,
} from "./types";

export type CommercialSettlementPorts = {
  fetchEncounter: (
    encounterId: EncounterId,
  ) => Promise<{ id: string; status?: string | null }>;
  fetchPaymentStatus: typeof fetchEncounterPaymentStatus;
  createPaymentSession: typeof createEncounterPaymentSession;
  findInvoice: typeof findInvoiceForEncounter;
  createInvoice: typeof createEncounterInvoice;
  fetchInvoiceAmount: typeof fetchSettlementInvoiceAmount;
  loadByEncounterId: typeof loadSettlementByEncounterId;
  loadById: typeof loadSettlementById;
  persist: typeof persistSettlementAtomic;
};

export const defaultCommercialSettlementPorts: CommercialSettlementPorts = {
  fetchEncounter,
  fetchPaymentStatus: fetchEncounterPaymentStatus,
  createPaymentSession: createEncounterPaymentSession,
  findInvoice: findInvoiceForEncounter,
  createInvoice: createEncounterInvoice,
  fetchInvoiceAmount: fetchSettlementInvoiceAmount,
  loadByEncounterId: loadSettlementByEncounterId,
  loadById: loadSettlementById,
  persist: persistSettlementAtomic,
};

function mergePorts(
  overrides?: Partial<CommercialSettlementPorts>,
): CommercialSettlementPorts {
  return { ...defaultCommercialSettlementPorts, ...overrides };
}

function touch(
  snapshot: CommercialSettlementSnapshot,
  patch: Partial<CommercialSettlementSnapshot>,
): CommercialSettlementSnapshot {
  return {
    ...snapshot,
    ...patch,
    settlementId: snapshot.settlementId,
    encounterId: snapshot.encounterId,
    updatedAt: new Date().toISOString(),
  };
}

async function requireEncounter(
  encounterId: EncounterId,
  ports: CommercialSettlementPorts,
) {
  const encounter = await ports.fetchEncounter(encounterId);
  if (!encounter?.id) {
    throw new SettlementIntegrityError("Encounter does not exist");
  }
  if (encounter.id !== encounterId) {
    throw new SettlementIntegrityError(
      "Encounter identity does not match settlement.encounterId",
    );
  }
  return encounter;
}

/**
 * CS-9 / CS-10 — mint or reuse a complete Settlement bound to one Encounter.
 */
export async function ensureSettlement(input: {
  encounterId: EncounterId;
  ports?: Partial<CommercialSettlementPorts>;
}): Promise<CommercialSettlementSnapshot> {
  const ports = mergePorts(input.ports);
  const encounter = await requireEncounter(input.encounterId, ports);
  const existing = ports.loadByEncounterId(input.encounterId);
  if (existing) {
    if (existing.encounterId !== input.encounterId) {
      throw new SettlementIntegrityError(
        "settlementId cannot be reassigned to another Encounter",
      );
    }
    return ports.persist(
      touch(existing, {
        encounterStatus: encounter.status ?? existing.encounterStatus,
      }),
    );
  }
  return ports.persist(
    createPendingSettlement(input.encounterId, {
      encounterStatus: encounter.status ?? "",
    }),
  );
}

function applyVerification(
  snapshot: CommercialSettlementSnapshot,
  isPaid: boolean,
): CommercialSettlementSnapshot {
  if (!isPaid) {
    return touch(snapshot, {
      isPaid: false,
      lockAnomaly: false,
    });
  }
  if (snapshot.isPaid && snapshot.paymentVerifiedAt) {
    return touch(snapshot, { isPaid: true });
  }
  return touch(snapshot, {
    isPaid: true,
    paymentVerifiedAt: snapshot.paymentVerifiedAt ?? new Date().toISOString(),
    state:
      snapshot.state === "locked" || snapshot.state === "invoiced"
        ? snapshot.state
        : "payment_verified",
  });
}

async function ensureInvoice(
  snapshot: CommercialSettlementSnapshot,
  ports: CommercialSettlementPorts,
): Promise<CommercialSettlementSnapshot> {
  if (!snapshot.isPaid) {
    return snapshot;
  }
  if (snapshot.invoiceId) {
    return snapshot.state === "pending" || snapshot.state === "payment_initiated"
      ? touch(snapshot, { state: "invoiced" })
      : snapshot.state === "payment_verified"
        ? touch(snapshot, { state: "invoiced" })
        : snapshot;
  }
  const existing = await ports.findInvoice(snapshot.encounterId);
  if (existing?.id) {
    return touch(snapshot, {
      invoiceId: existing.id,
      state: snapshot.state === "locked" ? "locked" : "invoiced",
    });
  }
  const amount = await ports.fetchInvoiceAmount();
  const created = await ports.createInvoice(snapshot.encounterId, amount);
  return touch(snapshot, {
    invoiceId: created.id,
    state: snapshot.state === "locked" ? "locked" : "invoiced",
  });
}

function applyLockObservation(
  snapshot: CommercialSettlementSnapshot,
  encounterStatus: string,
): CommercialSettlementSnapshot {
  const lockedEncounter = encounterStatus === "locked";
  if (lockedEncounter && !snapshot.isPaid) {
    return touch(snapshot, {
      encounterStatus,
      lockAnomaly: true,
    });
  }
  if (lockedEncounter && snapshot.isPaid && snapshot.invoiceId) {
    return touch(snapshot, {
      encounterStatus,
      lockAnomaly: false,
      state: "locked",
    });
  }
  return touch(snapshot, {
    encounterStatus,
    lockAnomaly: false,
  });
}

/**
 * Observe payment, invoice, and lock. Never treats ?payment= as verification (CS-5).
 * Never writes Clinical Completion (CS-3). Never requests a lock API (CS-2).
 */
export async function observeCommercialSettlement(input: {
  encounterId: EncounterId;
  paymentQuery?: string | null;
  ports?: Partial<CommercialSettlementPorts>;
}): Promise<CommercialSettlementSnapshot> {
  void input.paymentQuery;
  const ports = mergePorts(input.ports);
  let snapshot = await ensureSettlement({
    encounterId: input.encounterId,
    ports,
  });
  const encounter = await requireEncounter(input.encounterId, ports);
  const payment = await ports.fetchPaymentStatus(input.encounterId);
  snapshot = applyVerification(snapshot, payment.isPaid);
  snapshot = await ensureInvoice(snapshot, ports);
  snapshot = applyLockObservation(
    snapshot,
    encounter.status ?? snapshot.encounterStatus,
  );
  return ports.persist(snapshot);
}

export async function initiateCommercialPayment(input: {
  encounterId: EncounterId;
  ports?: Partial<CommercialSettlementPorts>;
}): Promise<{
  snapshot: CommercialSettlementSnapshot;
  paymentUrl: string | null;
}> {
  const ports = mergePorts(input.ports);
  let snapshot = await observeCommercialSettlement({
    encounterId: input.encounterId,
    ports,
  });
  if (
    snapshot.isPaid ||
    snapshot.state === "payment_verified" ||
    snapshot.state === "invoiced" ||
    snapshot.state === "locked"
  ) {
    return { snapshot, paymentUrl: null };
  }
  const encounter = await requireEncounter(input.encounterId, ports);
  const status = encounter.status ?? snapshot.encounterStatus;
  if (!resolveCanPay(status)) {
    throw new SettlementGateError(
      "Payment is only allowed when Encounter is signed",
    );
  }
  const session = await ports.createPaymentSession(input.encounterId);
  snapshot = ports.persist(
    touch(snapshot, {
      paymentSessionId: session.paymentId,
      state: "payment_initiated",
      encounterStatus: status,
    }),
  );
  return { snapshot, paymentUrl: session.paymentUrl };
}

export function getSettlementAudit(
  settlementId: SettlementId,
  ports: Pick<CommercialSettlementPorts, "loadById"> = defaultCommercialSettlementPorts,
): CommercialSettlementAuditChain | null {
  const snapshot = ports.loadById(settlementId);
  return snapshot ? reconstructCommercialSettlement(snapshot) : null;
}

export async function downloadSettlementReceipt(
  snapshot: CommercialSettlementSnapshot,
): Promise<void> {
  if (!snapshot.invoiceId) {
    throw new SettlementGateError("Invoice is required before downloading a receipt");
  }
  await downloadEncounterInvoice(snapshot.invoiceId);
}
