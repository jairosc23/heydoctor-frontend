"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { clinicalTabClass } from "@/lib/clinical-design-tokens";
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
  ordersHighlight?: boolean;
  ordersRefreshKey?: number;
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
  ordersHighlight = false,
  ordersRefreshKey = 0,
}: EncounterRightPaneProps) {
  return (
    <section
      aria-label="Órdenes y documentos"
      className="clinical-depth-secondary min-w-0"
      data-testid="encounter-right-pane"
    >
      <ClinicalPanel depth={4} density="compact" className="border-0 bg-transparent shadow-none">
        <ClinicalSection>
          <div
            className="mb-hd-3 flex gap-0.5 overflow-x-auto border-b border-hd-border-subtle"
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
                className={clinicalTabClass(activeTab === tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {!patientId && activeTab === "orders" ? (
            <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-4 py-hd-3 text-sm text-amber-900">
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
              highlight={ordersHighlight}
              refreshKey={ordersRefreshKey}
            />
          ) : null}

          {activeTab === "documents" ? (
            <DocumentsTab
              handlers={documentHandlers}
              loading={documentLoading}
              disabled={documentDisabled}
            />
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </section>
  );
}
