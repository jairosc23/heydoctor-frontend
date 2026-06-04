"use client";

import type { NestConsultation } from "@/lib/services/consultations";
import type { SoapSectionProps } from "./SoapSection";
import type { OrdersSubTab } from "./OrdersTab";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import type { ActionResult } from "@/lib/services/consultation-actions";
import { EncounterLeftPane } from "./EncounterLeftPane";
import { EncounterRightPane } from "./EncounterRightPane";
import {
  EncounterRailPlaceholder,
  EncounterSplitLayout,
} from "./EncounterSplitLayout";
import { MobileConsultationWorkspace } from "./MobileConsultationWorkspace";

export type WorkspaceTab =
  | "soap"
  | "record"
  | "orders"
  | "documents"
  | "assist";

export interface ConsultationWorkspaceProps {
  consultation: NestConsultation;
  consultationId: string;
  clinicId: string | null;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
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
}

export function ConsultationWorkspace(props: ConsultationWorkspaceProps) {
  return (
    <>
      <div className="xl:hidden">
        <MobileConsultationWorkspace {...props} />
      </div>
      <EncounterSplitLayout
        rail={<EncounterRailPlaceholder />}
        left={<EncounterLeftPane />}
        right={<EncounterRightPane />}
      />
    </>
  );
}
