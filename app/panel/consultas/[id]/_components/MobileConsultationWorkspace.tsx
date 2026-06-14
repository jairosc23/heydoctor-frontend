"use client";

import { ClinicalRecordPanel } from "@/components/clinical";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import { ClinicalPanel } from "@/components/clinical/design";
import { clinicalTabClass } from "@/lib/clinical-design-tokens";
import { cn } from "@/lib/utils";
import { SoapSection } from "./SoapSection";
import { SoapStickyNav } from "./SoapStickyNav";
import { useSoapScrollSpy } from "@/hooks/useSoapScrollSpy";
import { OrdersTab } from "./OrdersTab";
import { DocumentsTab } from "./DocumentsTab";
import type {
  MobileConsultationWorkspaceProps,
  WorkspaceTab,
} from "./ConsultationWorkspace";

const MAIN_TABS: { id: WorkspaceTab; label: string }[] = [
  { id: "soap", label: "Nota (SOAP)" },
  { id: "record", label: "Ficha" },
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
  ordersHighlight,
  ordersRefreshKey,
  smartWorkspaceEnabled = false,
}: MobileConsultationWorkspaceProps) {
  const patientId = consultation.patientId;
  const activeSoapStep = useSoapScrollSpy(smartWorkspaceEnabled);

  return (
    <ClinicalPanel depth={3} density="comfortable" focusPrimary className="clinical-focus-primary space-y-hd-4">
      <div
        className="flex gap-1 overflow-x-auto rounded-hd-lg border border-hd-border-subtle bg-hd-surface-raised p-1 shadow-hd-1"
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
              clinicalTabClass(activeTab === tab.id, "rounded-hd-md border-b-0 text-sm"),
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

      {activeTab === "soap" ? (
        <>
          <SoapStickyNav
            enabled={smartWorkspaceEnabled}
            activeStep={activeSoapStep}
          />
          <SoapSection {...soap} smartWorkspaceEnabled={smartWorkspaceEnabled} />
        </>
      ) : null}

      {activeTab === "record" ? (
        <div id="clinical-record-section">
          <ClinicalRecordPanel
            consultationId={consultationId}
            patientId={patientId}
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
            activeDiagnosis={
              soap.diagnosisDescription || soap.diagnosisCode || soap.diagnosis
            }
            treatment={soap.treatment}
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

      {activeTab === "chat" && patientId ? (
        <div aria-label="Mensajería de consulta">
          <p className="mb-3 text-[11px] text-slate-500">
            Mensajería clínica. Para análisis con IA use{" "}
            <span className="font-semibold text-primary">Clinical Copilot™</span>.
          </p>
          <ChatPanel consultationId={consultationId} sender="doctor" />
        </div>
      ) : null}
    </ClinicalPanel>
  );
}
