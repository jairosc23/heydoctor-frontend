"use client";

import {
  AiInsightsPanel,
  ClinicalRecordPanel,
  ConsultationAssistPanel,
} from "@/components/clinical";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import type { NestConsultation } from "@/lib/services/consultations";
import { cn } from "@/lib/utils";
import { SoapSection, type SoapSectionProps } from "./SoapSection";
import { OrdersTab, type OrdersSubTab } from "./OrdersTab";
import { DocumentsTab } from "./DocumentsTab";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/components/clinical/ConsultationActionBar";
import type { ActionResult } from "@/lib/services/consultation-actions";

export type WorkspaceTab =
  | "soap"
  | "record"
  | "orders"
  | "documents"
  | "assist";

const MAIN_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "soap", label: "Nota (SOAP)" },
  { id: "record", label: "Ficha" },
  { id: "orders", label: "Órdenes" },
  { id: "documents", label: "Documentos" },
  { id: "assist", label: "Asistencia" },
];

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

export function ConsultationWorkspace({
  consultation,
  consultationId,
  clinicId,
  activeTab,
  onTabChange,
  ordersSubTab,
  onOrdersSubTabChange,
  soap,
  chiefComplaintDraft,
  onChiefComplaintChange,
  editMode,
  isEditable,
  aiTrigger,
  onSaveClinicalRecord,
  documentHandlers,
  documentLoading,
  documentDisabled,
  onLegacyInvoiceResult,
  diagnosisCode,
}: ConsultationWorkspaceProps) {
  const patientId = consultation.patientId;

  return (
    <div className="space-y-4">
      <div
        className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1"
        role="tablist"
      >
        {MAIN_TABS.map((tab) => (
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

      {!patientId ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Esta consulta no tiene paciente asociado. Las órdenes y asistencia no
          están disponibles.
        </p>
      ) : null}

      {activeTab === "soap" ? <SoapSection {...soap} /> : null}

      {activeTab === "record" ? (
        <div id="clinical-record-section">
          <ClinicalRecordPanel
            consultationId={consultationId}
            rawNotes={consultation.notes ?? ""}
            chiefComplaint={chiefComplaintDraft}
            onChiefComplaintChange={onChiefComplaintChange}
            createdAt={consultation.createdAt ?? null}
            editable={isEditable && editMode}
            patient={
              consultation.patient
                ? { name: consultation.patient.name ?? null }
                : null
            }
            onSave={onSaveClinicalRecord}
            autofillRequest={aiTrigger}
          />
        </div>
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

      {activeTab === "assist" && patientId ? (
        <div className="grid gap-5 lg:grid-cols-2">
          <ConsultationAssistPanel
            initialChiefComplaint={chiefComplaintDraft}
            initialSymptoms=""
            initialNotes={soap.notes}
          />
          <div className="space-y-5">
            <AiInsightsPanel
              patientId={patientId}
              consultationId={consultationId}
            />
            <ChatPanel consultationId={consultationId} sender="doctor" />
          </div>
        </div>
      ) : null}
    </div>
  );
}
