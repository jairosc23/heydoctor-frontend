"use client";

import type { NestConsultation } from "@/lib/services/consultations";
import type { OrdersSubTab } from "./OrdersTab";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import { ClinicalSurface } from "@/components/clinical/design";
import type { ActionResult } from "@/lib/services/consultation-actions";
import { EncounterLeftPane, type EncounterLeftPaneTab } from "./EncounterLeftPane";
import { EncounterRightPane, type EncounterRightPaneTab } from "./EncounterRightPane";
import { MobileConsultationWorkspace } from "./MobileConsultationWorkspace";
import type { PatientContextRailProps } from "./PatientContextRail";
import { ClinicalCollapsiblePanel } from "./ClinicalCollapsiblePanel";
import { ClinicalContextPanels } from "./ClinicalContextPanels";
import type { ClinicalEncounterChartProps } from "./chart/ClinicalEncounterChart";

export type WorkspaceTab =
  | "soap"
  | "orders"
  | "documents"
  | "chat";

export type { EncounterLeftPaneTab, EncounterRightPaneTab };

export interface ConsultationWorkspaceProps {
  consultation: NestConsultation;
  consultationId: string;
  clinicId: string | null;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  leftPaneTab: EncounterLeftPaneTab;
  onLeftPaneTabChange: (tab: EncounterLeftPaneTab) => void;
  rightPaneTab: EncounterRightPaneTab;
  onRightPaneTabChange: (tab: EncounterRightPaneTab) => void;
  ordersSubTab: OrdersSubTab;
  onOrdersSubTabChange: (tab: OrdersSubTab) => void;
  documentHandlers: ActionBarHandlers;
  documentLoading: ActionBarLoading;
  documentDisabled: Partial<Record<string, boolean>>;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
  diagnosisCode?: string;
  patientContext: PatientContextRailProps;
  ordersHighlight?: boolean;
  ordersRefreshKey?: number;
  actionWorkspaceEnabled?: boolean;
  smartWorkspaceEnabled?: boolean;
  encounterChart?: ClinicalEncounterChartProps | null;
}

export type MobileConsultationWorkspaceProps = Omit<
  ConsultationWorkspaceProps,
  | "leftPaneTab"
  | "onLeftPaneTabChange"
  | "rightPaneTab"
  | "onRightPaneTabChange"
  | "patientContext"
>;

export function ConsultationWorkspace({
  patientContext,
  leftPaneTab,
  onLeftPaneTabChange,
  rightPaneTab,
  onRightPaneTabChange,
  ordersHighlight,
  ordersRefreshKey,
  actionWorkspaceEnabled = false,
  smartWorkspaceEnabled = false,
  encounterChart,
  ...props
}: ConsultationWorkspaceProps) {
  const {
    consultation,
    consultationId,
    ordersSubTab,
    onOrdersSubTabChange,
    documentHandlers,
    documentLoading,
    documentDisabled,
    onLegacyInvoiceResult,
    diagnosisCode,
  } = props;

  return (
    <div className="clinical-workspace">
      <div className="xl:hidden">
        <MobileConsultationWorkspace
          {...props}
          encounterChart={encounterChart}
          ordersHighlight={ordersHighlight}
          ordersRefreshKey={ordersRefreshKey}
          smartWorkspaceEnabled={smartWorkspaceEnabled}
        />
      </div>
      <div
        className="hidden space-y-hd-4 xl:block"
        data-testid="encounter-split-layout"
        data-clinical-action-workspace={actionWorkspaceEnabled ? "true" : undefined}
        data-columns="1"
      >
        <ClinicalContextPanels
          {...patientContext}
          smartWorkspaceEnabled={smartWorkspaceEnabled}
        />

        <ClinicalSurface
          depth={3}
          focusPrimary
          className="soap-command-center-shell clinical-focus-primary mx-auto min-w-0 p-hd-3 shadow-hd-3 ring-1 ring-primary/10 xl:w-[78%] xl:max-w-[1280px]"
        >
          <EncounterLeftPane
            consultation={consultation}
            consultationId={consultationId}
            activeTab={leftPaneTab}
            onTabChange={onLeftPaneTabChange}
            encounterChart={encounterChart}
          />
        </ClinicalSurface>

        <ClinicalCollapsiblePanel
          title="Orders Command Center™"
          eyebrow="Órdenes y documentos"
          storageKey="clinical-encounter-panel-orders"
          defaultExpanded={false}
          className="mx-auto xl:w-[78%] xl:max-w-[1280px]"
        >
          <div data-testid="orders-command-center-collapsible">
            <EncounterRightPane
              patientId={consultation.patientId}
              consultationId={consultationId}
              activeTab={rightPaneTab}
              onTabChange={onRightPaneTabChange}
              ordersSubTab={ordersSubTab}
              onOrdersSubTabChange={onOrdersSubTabChange}
              diagnosisCode={diagnosisCode}
              documentHandlers={documentHandlers}
              documentLoading={documentLoading}
              documentDisabled={documentDisabled}
              onLegacyInvoiceResult={onLegacyInvoiceResult}
              ordersHighlight={ordersHighlight}
              ordersRefreshKey={ordersRefreshKey}
            />
          </div>
        </ClinicalCollapsiblePanel>
      </div>
    </div>
  );
}
