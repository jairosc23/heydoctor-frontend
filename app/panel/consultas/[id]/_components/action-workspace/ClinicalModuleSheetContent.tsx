"use client";

import {
  LabOrdersPanel,
  PrescriptionPanel,
  ReferralsPanel,
} from "@/components/clinical";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/lib/encounter/action-bar-types";
import {
  clinicalActionModuleLabel,
} from "@/lib/clinical-action-workspace";
import type { ActionResult } from "@/lib/services/consultation-actions";
import { cn } from "@/lib/utils";
import { DocumentsTab } from "../DocumentsTab";
import { InvoicesSubTab } from "../InvoicesSubTab";
import { OrdersTab, type OrdersSubTab } from "../OrdersTab";
import { useClinicalActionWorkspace } from "./ClinicalActionWorkspaceProvider";

export interface ClinicalModuleSheetContentProps {
  patientId: string | null | undefined;
  consultationId: string;
  diagnosisCode?: string;
  refreshKey?: number;
  ordersHighlight?: boolean;
  ordersSubTab: OrdersSubTab;
  onOrdersSubTabChange: (tab: OrdersSubTab) => void;
  documentHandlers: ActionBarHandlers;
  documentLoading: ActionBarLoading;
  documentDisabled: Partial<Record<string, boolean>>;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
}

export function ClinicalModuleSheetContent({
  patientId,
  consultationId,
  diagnosisCode,
  refreshKey = 0,
  ordersHighlight = false,
  ordersSubTab,
  onOrdersSubTabChange,
  documentHandlers,
  documentLoading,
  documentDisabled,
  onLegacyInvoiceResult,
}: ClinicalModuleSheetContentProps) {
  const { activeModule } = useClinicalActionWorkspace();

  if (!activeModule) return null;

  const moduleLabel = clinicalActionModuleLabel(activeModule);

  if (!patientId && activeModule !== "documents") {
    return (
      <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-4 py-hd-3 text-sm text-amber-900">
        Esta consulta no tiene paciente asociado. Las órdenes no están
        disponibles.
      </p>
    );
  }

  return (
    <div
      className={cn(
        "min-w-0 space-y-hd-4",
        ordersHighlight && "ring-2 ring-primary/20 ring-offset-2 rounded-hd-lg p-hd-1",
      )}
      data-testid="clinical-module-sheet-content"
      data-module={activeModule}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {moduleLabel}
      </p>

      {activeModule === "orders" && patientId ? (
        <OrdersTab
          patientId={patientId}
          consultationId={consultationId}
          diagnosisCode={diagnosisCode}
          activeSubTab={ordersSubTab}
          onSubTabChange={onOrdersSubTabChange}
          onLegacyInvoiceResult={onLegacyInvoiceResult}
          highlight={ordersHighlight}
          refreshKey={refreshKey}
        />
      ) : null}

      {activeModule === "prescriptions" && patientId ? (
        <div id="prescription-workspace">
          <PrescriptionPanel
            key={`rx-sheet-${refreshKey}`}
            patientId={patientId}
            consultationId={consultationId}
            diagnosisCode={diagnosisCode}
          />
        </div>
      ) : null}

      {activeModule === "lab" && patientId ? (
        <div id="lab-orders-workspace">
          <LabOrdersPanel
            key={`lab-sheet-${refreshKey}`}
            patientId={patientId}
            consultationId={consultationId}
            diagnosisCode={diagnosisCode}
          />
        </div>
      ) : null}

      {activeModule === "referrals" && patientId ? (
        <div id="referrals-workspace">
          <ReferralsPanel patientId={patientId} consultationId={consultationId} />
        </div>
      ) : null}

      {activeModule === "invoices" ? (
        <div id="invoices-workspace">
          <InvoicesSubTab
            consultationId={consultationId}
            onLegacyInvoiceResult={onLegacyInvoiceResult}
          />
        </div>
      ) : null}

      {activeModule === "documents" ? (
        <DocumentsTab
          handlers={documentHandlers}
          loading={documentLoading}
          disabled={documentDisabled}
        />
      ) : null}
    </div>
  );
}
