/**
 * Handler contracts shared by Documents / Closure / Module Sheet.
 * Encounter chrome actions live in encounter-action-registry.ts.
 */

export interface ActionBarHandlers {
  /** Alias histórico: en el encounter resuelve share-consultation. */
  onStartTeleconsultation: () => void;
  onOpenPrescription: () => void;
  onGenerateInvoice: () => void;
  onDownloadPdf: () => void;
  onToggleEdit: () => void;
  onAnalyzeWithAi: () => void;
  onDelete: () => void;
  onGenerateSignedPrescription: () => void;
  onGenerateSignedCertificate: () => void;
  onGenerateSignedReferral: () => void;
  onGeneratePremiumDocument: () => void;
}

export interface ActionBarLoading {
  starting?: boolean;
  invoice?: boolean;
  pdf?: boolean;
  ai?: boolean;
  deleting?: boolean;
  signedPrescription?: boolean;
  signedCertificate?: boolean;
  signedReferral?: boolean;
  premium?: boolean;
}

export interface ActionBarDisabled {
  startTele?: boolean;
  prescription?: boolean;
  invoice?: boolean;
  pdf?: boolean;
  edit?: boolean;
  ai?: boolean;
  delete?: boolean;
  signedPrescription?: boolean;
  signedCertificate?: boolean;
  signedReferral?: boolean;
  premium?: boolean;
}
