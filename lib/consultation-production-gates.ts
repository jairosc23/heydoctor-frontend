/**
 * Phase 4.9.0 — Production gates for payment and signed documents.
 */

export type ConsultationStatusGate = string;

/** F1 — Pago solo tras firma legal (status signed), no en completed. */
export function resolveCanPay(status: ConsultationStatusGate): boolean {
  return status === "signed";
}

export type DocumentGateInput = {
  isSigned: boolean;
  isLocked: boolean;
};

/**
 * F3 — Documentos legales/exportables requieren consulta firmada o bloqueada.
 * Factura deshabilitada solo en locked (post-pago).
 */
export function buildConsultationDocumentDisabled({
  isSigned,
  isLocked,
}: DocumentGateInput) {
  const requiresSignature = !isSigned && !isLocked;
  return {
    pdf: requiresSignature,
    invoice: isLocked,
    signedPrescription: requiresSignature,
    signedCertificate: requiresSignature,
    signedReferral: requiresSignature,
    premium: requiresSignature,
  };
}
