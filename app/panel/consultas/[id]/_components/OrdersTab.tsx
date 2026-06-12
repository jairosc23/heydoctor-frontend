"use client";

import {
  LabOrdersPanel,
  PrescriptionPanel,
  ReferralsPanel,
} from "@/components/clinical";
import { cn } from "@/lib/utils";
import { InvoicesSubTab } from "./InvoicesSubTab";
import type { ActionResult } from "@/lib/services/consultation-actions";

export type OrdersSubTab =
  | "prescriptions"
  | "lab"
  | "referrals"
  | "invoices";

const SUB_TABS: { id: OrdersSubTab; label: string }[] = [
  { id: "prescriptions", label: "Recetas" },
  { id: "lab", label: "Laboratorios" },
  { id: "referrals", label: "Interconsultas" },
  { id: "invoices", label: "Facturas" },
];

export function OrdersTab({
  patientId,
  consultationId,
  diagnosisCode,
  activeSubTab,
  onSubTabChange,
  onLegacyInvoiceResult,
  highlight = false,
  refreshKey = 0,
}: {
  patientId: string;
  consultationId: string;
  diagnosisCode?: string;
  activeSubTab: OrdersSubTab;
  onSubTabChange: (tab: OrdersSubTab) => void;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
  highlight?: boolean;
  refreshKey?: number;
}) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg transition-shadow",
        highlight && "ring-2 ring-violet-400 ring-offset-2",
      )}
      data-testid="orders-tab-panel"
    >
      <div className="flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1">
        {SUB_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSubTabChange(tab.id)}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              activeSubTab === tab.id
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === "prescriptions" ? (
        <div id="prescription-workspace">
          <PrescriptionPanel
            key={`rx-${refreshKey}`}
            patientId={patientId}
            consultationId={consultationId}
            diagnosisCode={diagnosisCode}
          />
        </div>
      ) : null}
      {activeSubTab === "lab" ? (
        <LabOrdersPanel
          key={`lab-${refreshKey}`}
          patientId={patientId}
          consultationId={consultationId}
          diagnosisCode={diagnosisCode}
        />
      ) : null}
      {activeSubTab === "referrals" ? (
        <ReferralsPanel patientId={patientId} consultationId={consultationId} />
      ) : null}
      {activeSubTab === "invoices" ? (
        <InvoicesSubTab
          consultationId={consultationId}
          onLegacyInvoiceResult={onLegacyInvoiceResult}
        />
      ) : null}
    </div>
  );
}
