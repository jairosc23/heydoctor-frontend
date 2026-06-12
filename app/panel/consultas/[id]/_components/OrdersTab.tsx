"use client";

import {
  LabOrdersPanel,
  PrescriptionPanel,
  ReferralsPanel,
} from "@/components/clinical";
import { cn } from "@/lib/utils";
import { InvoicesSubTab } from "./InvoicesSubTab";
import { OrdersOverview } from "./orders/OrdersOverview";
import { OrdersQuickActions } from "./orders/OrdersQuickActions";
import type { ActionResult } from "@/lib/services/consultation-actions";

export type OrdersSubTab =
  | "prescriptions"
  | "lab"
  | "referrals"
  | "invoices";

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
        "orders-priority-panel space-y-hd-3 rounded-hd-lg transition-shadow duration-hd-base",
        highlight && "ring-2 ring-primary/30 ring-offset-2",
      )}
      data-testid="orders-tab-panel"
    >
      <OrdersOverview
        patientId={patientId}
        consultationId={consultationId}
        refreshKey={refreshKey}
      />

      <OrdersQuickActions
        activeSubTab={activeSubTab}
        onSelect={onSubTabChange}
      />

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
        <div id="lab-orders-workspace">
          <LabOrdersPanel
            key={`lab-${refreshKey}`}
            patientId={patientId}
            consultationId={consultationId}
            diagnosisCode={diagnosisCode}
          />
        </div>
      ) : null}
      {activeSubTab === "referrals" ? (
        <div id="referrals-workspace">
          <ReferralsPanel patientId={patientId} consultationId={consultationId} />
        </div>
      ) : null}
      {activeSubTab === "invoices" ? (
        <div id="invoices-workspace">
          <InvoicesSubTab
            consultationId={consultationId}
            onLegacyInvoiceResult={onLegacyInvoiceResult}
          />
        </div>
      ) : null}
    </div>
  );
}
