"use client";

import { cn } from "@/lib/utils";
import { OrdersTab, type OrdersSubTab } from "./OrdersTab";
import { DocumentsTab } from "./DocumentsTab";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import type { ActionResult } from "@/lib/services/consultation-actions";

export type EncounterRightPaneTab = "orders" | "documents";

const RIGHT_TABS: { id: EncounterRightPaneTab; label: string }[] = [
  { id: "orders", label: "Órdenes" },
  { id: "documents", label: "Documentos" },
];

export interface EncounterRightPaneProps {
  patientId: string | null | undefined;
  consultationId: string;
  activeTab: EncounterRightPaneTab;
  onTabChange: (tab: EncounterRightPaneTab) => void;
  ordersSubTab: OrdersSubTab;
  onOrdersSubTabChange: (tab: OrdersSubTab) => void;
  diagnosisCode?: string;
  documentHandlers: ActionBarHandlers;
  documentLoading: ActionBarLoading;
  documentDisabled: Partial<Record<string, boolean>>;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
}

export function EncounterRightPane({
  patientId,
  consultationId,
  activeTab,
  onTabChange,
  ordersSubTab,
  onOrdersSubTabChange,
  diagnosisCode,
  documentHandlers,
  documentLoading,
  documentDisabled,
  onLegacyInvoiceResult,
}: EncounterRightPaneProps) {
  return (
    <section
      aria-label="Órdenes y documentos"
      className="min-w-0 space-y-4"
      data-testid="encounter-right-pane"
    >
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
        role="tablist"
        aria-label="Gestión clínica"
      >
        {RIGHT_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              activeTab === tab.id
                ? "bg-primary text-white"
                : "text-slate-600 hover:bg-slate-50",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!patientId && activeTab === "orders" ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Esta consulta no tiene paciente asociado. Las órdenes no están
          disponibles.
        </p>
      ) : null}

      {activeTab === "orders" && patientId ? (
        <OrdersTab
          patientId={patientId}
          consultationId={consultationId}
          diagnosisCode={diagnosisCode}
          activeSubTab={ordersSubTab}
          onSubTabChange={onOrdersSubTabChange}
          onLegacyInvoiceResult={onLegacyInvoiceResult}
        />
      ) : null}

      {activeTab === "documents" ? (
        <DocumentsTab
          handlers={documentHandlers}
          loading={documentLoading}
          disabled={documentDisabled}
        />
      ) : null}
    </section>
  );
}
