"use client";

import {
  AiInsightsPanel,
  ClinicalRecordPanel,
  ConsultationAssistPanel,
} from "@/components/clinical";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { clinicalTabClass } from "@/lib/clinical-design-tokens";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import type { NestConsultation } from "@/lib/services/consultations";
import { SoapSection, type SoapSectionProps } from "./SoapSection";

export type EncounterLeftPaneTab = "soap" | "record" | "assist";

const LEFT_TABS: { id: EncounterLeftPaneTab; label: string }[] = [
  { id: "soap", label: "Nota (SOAP)" },
  { id: "record", label: "Ficha" },
  { id: "assist", label: "Asistencia" },
];

export interface EncounterLeftPaneProps {
  consultation: NestConsultation;
  consultationId: string;
  activeTab: EncounterLeftPaneTab;
  onTabChange: (tab: EncounterLeftPaneTab) => void;
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
}

export function EncounterLeftPane({
  consultation,
  consultationId,
  activeTab,
  onTabChange,
  soap,
  chiefComplaintDraft,
  onChiefComplaintChange,
  editMode,
  isEditable,
  aiTrigger,
  onSaveClinicalRecord,
}: EncounterLeftPaneProps) {
  const patientId = consultation.patientId;

  return (
    <section
      aria-label="Documentación clínica"
      className="clinical-focus-primary min-w-0"
      data-testid="encounter-left-pane"
    >
      <ClinicalPanel depth={3} density="compact" focusPrimary className="border-0 bg-transparent shadow-none">
        <ClinicalSection>
          <div
            className="mb-hd-3 flex gap-0.5 overflow-x-auto border-b border-hd-border-subtle"
            role="tablist"
            aria-label="Sección clínica"
          >
            {LEFT_TABS.map((tab) => (
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

          {!patientId && (activeTab === "assist" || activeTab === "record") ? (
            <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-4 py-hd-3 text-sm text-amber-900">
              Esta consulta no tiene paciente asociado. La asistencia no está
              disponible.
            </p>
          ) : null}

          {activeTab === "soap" ? <SoapSection {...soap} /> : null}

          {activeTab === "record" ? (
            <div id="clinical-record-section-desktop">
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

          {activeTab === "assist" && patientId ? (
            <div className="grid gap-hd-5 xl:grid-cols-1 2xl:grid-cols-2">
              <ConsultationAssistPanel
                initialChiefComplaint={chiefComplaintDraft}
                initialSymptoms=""
                initialNotes={soap.notes}
              />
              <div className="space-y-hd-5">
                <AiInsightsPanel
                  patientId={patientId}
                  consultationId={consultationId}
                />
                <ChatPanel consultationId={consultationId} sender="doctor" />
              </div>
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </section>
  );
}
