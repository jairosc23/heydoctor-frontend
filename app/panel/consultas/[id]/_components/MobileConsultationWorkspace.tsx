"use client";

import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import { ClinicalPanel } from "@/components/clinical/design";
import { clinicalTabClass } from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";
import { EncounterCarePathOffer } from "./EncounterCarePathOffer";
import { OrdersTab } from "./OrdersTab";
import { DocumentsTab } from "./DocumentsTab";
import {
  ClinicalEncounterChart,
  type ClinicalEncounterChartProps,
} from "./chart/ClinicalEncounterChart";
import { ClinicalNavigationRail } from "./ClinicalNavigationRail";
import type {
  ClinicalNavigationProgress,
  ClinicalNavigationSection,
} from "./clinical-navigation-rail-model";
import type {
  MobileConsultationWorkspaceProps,
  WorkspaceTab,
} from "./ConsultationWorkspace";

const MAIN_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "soap", label: "Ficha Clínica" },
  { id: "orders", label: "Órdenes" },
  { id: "documents", label: "Documentos" },
  { id: "chat", label: "Chat" },
];

export function MobileConsultationWorkspace({
  consultation,
  consultationId,
  activeTab,
  onTabChange,
  ordersSubTab,
  onOrdersSubTabChange,
  documentHandlers,
  documentLoading,
  documentDisabled,
  onLegacyInvoiceResult,
  diagnosisCode,
  ordersHighlight,
  ordersRefreshKey,
  ordersPanelExpandSignal,
  smartWorkspaceEnabled = false,
  encounterChart,
  navigationSections = [],
  navigationProgress,
  activeSectionId,
  onNavigateSection,
  disclosureExpanded = false,
  onDisclosureExpandedChange,
}: MobileConsultationWorkspaceProps & {
  encounterChart?: ClinicalEncounterChartProps | null;
  navigationSections?: ClinicalNavigationSection[];
  navigationProgress?: ClinicalNavigationProgress;
  activeSectionId?: string | null;
  onNavigateSection?: (sectionId: string) => void;
  disclosureExpanded?: boolean;
  onDisclosureExpandedChange?: (expanded: boolean) => void;
}) {
  const patientId = consultation.patientId;

  return (
    <ClinicalPanel
      depth={3}
      density="comfortable"
      focusPrimary
      className="clinical-focus-primary space-y-hd-4"
    >
      <div
        className="flex gap-1 overflow-x-auto rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-1 shadow-hd-1"
        role="tablist"
        aria-label="Secciones del encuentro"
        onKeyDown={(event) => {
          if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
          const index = MAIN_TABS.findIndex((tab) => tab.id === activeTab);
          if (index < 0) return;
          event.preventDefault();
          const delta = event.key === "ArrowRight" ? 1 : -1;
          const next =
            MAIN_TABS[(index + delta + MAIN_TABS.length) % MAIN_TABS.length];
          if (next) onTabChange(next.id);
        }}
      >
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`encounter-mobile-panel-${tab.id}`}
            id={`encounter-mobile-tab-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              clinicalTabClass(
                activeTab === tab.id,
                "rounded-hd-md border-b-0 text-sm",
              ),
              activeTab === tab.id && "bg-primary text-white hover:text-white",
              activeTab !== tab.id && "hover:bg-hd-surface-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {!patientId ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Esta consulta no tiene paciente asociado. Las órdenes y el chat no
          están disponibles.
        </p>
      ) : null}

      {/* Keep chart mounted across tabs so antecedents draft/ref survive navigation. */}
      {encounterChart ? (
        <div
          className={activeTab === "soap" ? "space-y-hd-3" : "hidden"}
          aria-hidden={activeTab !== "soap"}
          data-testid="encounter-chart-host-mobile"
          role="tabpanel"
          id="encounter-mobile-panel-soap"
          aria-labelledby="encounter-mobile-tab-soap"
        >
          {navigationSections.length > 0 && onNavigateSection ? (
            <ClinicalNavigationRail
              sections={navigationSections}
              progress={navigationProgress}
              activeSectionId={activeSectionId ?? null}
              onNavigate={onNavigateSection}
              orientation="horizontal"
              disclosureExpanded={disclosureExpanded}
              onDisclosureExpandedChange={onDisclosureExpandedChange}
            />
          ) : null}
          <ClinicalEncounterChart {...encounterChart} />
        </div>
      ) : null}

      {activeTab === "orders" && patientId ? (
        <div
          role="tabpanel"
          id="encounter-mobile-panel-orders"
          aria-labelledby="encounter-mobile-tab-orders"
        >
          <EncounterCarePathOffer
            collapsible={false}
            expandSignal={ordersPanelExpandSignal}
          >
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
          </EncounterCarePathOffer>
        </div>
      ) : null}

      {activeTab === "documents" ? (
        <div
          role="tabpanel"
          id="encounter-mobile-panel-documents"
          aria-labelledby="encounter-mobile-tab-documents"
        >
          <DocumentsTab
            handlers={documentHandlers}
            loading={documentLoading}
            disabled={documentDisabled}
          />
        </div>
      ) : null}

      {activeTab === "chat" && patientId ? (
        <div
          aria-label="Mensajería de consulta"
          role="tabpanel"
          id="encounter-mobile-panel-chat"
          aria-labelledby="encounter-mobile-tab-chat"
        >
          <p className="mb-3 text-[11px] text-slate-500">
            Mensajería clínica. Para análisis con IA use{" "}
            <span className="font-semibold text-primary">
              HeyDoctor Copilot
            </span>{" "}
            en la ficha.
          </p>
          <ChatPanel consultationId={consultationId} sender="doctor" />
        </div>
      ) : null}
    </ClinicalPanel>
  );
}
