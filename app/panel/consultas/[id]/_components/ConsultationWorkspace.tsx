"use client";

import type { NestConsultation } from "@/lib/services/consultations";
import type { SoapSectionProps } from "./SoapSection";
import type { OrdersSubTab } from "./OrdersTab";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import type { ActionResult } from "@/lib/services/consultation-actions";
import { EncounterLeftPane, type EncounterLeftPaneTab } from "./EncounterLeftPane";
import { EncounterRightPane, type EncounterRightPaneTab } from "./EncounterRightPane";
import { EncounterSplitLayout } from "./EncounterSplitLayout";
import { MobileConsultationWorkspace } from "./MobileConsultationWorkspace";
import {
  PatientContextRail,
  type PatientContextRailProps,
} from "./PatientContextRail";

export type WorkspaceTab =
  | "soap"
  | "record"
  | "orders"
  | "documents"
  | "assist";

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
  soap: SoapSectionProps;
  chiefComplaintDraft: string;
  onChiefComplaintChange: (value: string) => void;
  editMode: boolean;
  isEditable: boolean;
  aiTrigger: number;
  onSaveClinicalRecord: (payload: {
    notes: string;
    chiefComplaint: string;
  }) => Promise<void>;
  documentHandlers: ActionBarHandlers;
  documentLoading: ActionBarLoading;
  documentDisabled: Partial<Record<string, boolean>>;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
  diagnosisCode?: string;
  patientContext: PatientContextRailProps;
  ordersHighlight?: boolean;
  ordersRefreshKey?: number;
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
  ...props
}: ConsultationWorkspaceProps) {
  const {
    consultation,
    consultationId,
    soap,
    chiefComplaintDraft,
    onChiefComplaintChange,
    editMode,
    isEditable,
    aiTrigger,
    onSaveClinicalRecord,
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
          ordersHighlight={ordersHighlight}
          ordersRefreshKey={ordersRefreshKey}
        />
      </div>
      <EncounterSplitLayout
        rail={<PatientContextRail {...patientContext} />}
        left={
          <EncounterLeftPane
            consultation={consultation}
            consultationId={consultationId}
            activeTab={leftPaneTab}
            onTabChange={onLeftPaneTabChange}
            soap={soap}
            chiefComplaintDraft={chiefComplaintDraft}
            onChiefComplaintChange={onChiefComplaintChange}
            editMode={editMode}
            isEditable={isEditable}
            aiTrigger={aiTrigger}
            onSaveClinicalRecord={onSaveClinicalRecord}
          />
        }
        right={
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
        }
      />
    </div>
  );
}
