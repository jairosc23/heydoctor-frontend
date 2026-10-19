import type { ProductEpicContract, ProductEpicMetrics } from "../contract";

export const REVENUE_INTEGRITY_BUCKETS = [
  "lock_anomaly",
  "commercially_locked",
  "invoiced",
  "payment_verified",
  "signed_unpaid",
  "unclassified",
] as const;

export type RevenueIntegrityBucket = (typeof REVENUE_INTEGRITY_BUCKETS)[number];

export type RevenueIntegrityItem = {
  encounterId: string;
  settlementId: string | null;
  asOf: string;
  encounterStatus: string;
  settlementState: string | null;
  isPaid: boolean;
  invoiceId: string | null;
  lockAnomaly: boolean;
  bucket: RevenueIntegrityBucket;
};

export type RevenueIntegrityMetrics = ProductEpicMetrics & {
  signedUnpaidCount: number;
  verifiedWithoutInvoiceCount: number;
  invoicedUnlockedCount: number;
  lockAnomalyCount: number;
  commerciallyLockedCount: number;
  encountersScanned: number;
  settlementAbsentCount: number;
  unclassifiedCount: number;
};

export type RevenueIntegrityDashboard = {
  kind: "revenue_integrity_dashboard";
  items: RevenueIntegrityItem[];
  metrics: RevenueIntegrityMetrics;
};

export const REVENUE_INTEGRITY_CONTRACT: ProductEpicContract = {
  Objective:
    "Visualizar el funnel comercial certificado por Encounter, a nivel de clínica.",
  Dependencies:
    "READ ONLY: enumeración Encounter signed/locked + loadClinicalOperationsView. Settlement solo vía slice COD.",
  "Read Model":
    "RevenueIntegrityDashboard efímero; buckets exclusivos; métricas PRODUCT-1.",
  "No Writes":
    "No workflows Core. Acción = abrir ficha certificada.",
  PASS: [
    "REV-1",
    "REV-2",
    "REV-3",
    "REV-4",
    "REV-5",
    "REV-6",
    "REV-7",
    "REV-8",
    "REV-9",
    "REV-10",
    "REV-11",
    "REV-12",
  ],
  Metrics: [
    "signedUnpaidCount",
    "verifiedWithoutInvoiceCount",
    "invoicedUnlockedCount",
    "lockAnomalyCount",
    "commerciallyLockedCount",
  ],
};

export class RevenueIntegrityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RevenueIntegrityError";
  }
}
