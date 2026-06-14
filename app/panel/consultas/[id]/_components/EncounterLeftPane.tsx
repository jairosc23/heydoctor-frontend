"use client";

import { ClinicalRecordPanel } from "@/components/clinical";
import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { clinicalTabClass } from "@/lib/clinical-design-tokens";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import type { NestConsultation } from "@/lib/services/consultations";
import { SoapSection, type SoapSectionProps } from "./SoapSection";
import { SoapStickyNav } from "./SoapStickyNav";
import { useSoapScrollSpy } from "@/hooks/useSoapScrollSpy";

export type EncounterLeftPaneTab = "soap" | "record" | "chat";

const LEFT_TABS: { id: EncounterLeftPaneTab; label: string }[] = [
  { id: "soap", label: "Nota (SOAP)" },
  { id: "record", label: "Ficha" },
  { id: "chat", label: "Chat" },
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
  smartWorkspaceEnabled?: boolean;
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
  smartWorkspaceEnabled = false,
}: EncounterLeftPaneProps) {
  const patientId = consultation.patientId;
  const activeSoapStep = useSoapScrollSpy(smartWorkspaceEnabled);

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

          {!patientId && (activeTab === "chat" || activeTab === "record") ? (
            <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-4 py-hd-3 text-sm text-amber-900">
              Esta consulta no tiene paciente asociado. El chat y la ficha no
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
            <div id="clinical-record-section-desktop">
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

          {activeTab === "chat" && patientId ? (
            <div aria-label="Mensajería de consulta">
              <p className="mb-hd-3 text-[11px] text-slate-500">
                Mensajería clínica. Para análisis con IA use{" "}
                <span className="font-semibold text-primary">Clinical Copilot™</span>{" "}
                (✨ en la cabecera).
              </p>
              <ChatPanel consultationId={consultationId} sender="doctor" />
            </div>
          ) : null}
        </ClinicalSection>
      </ClinicalPanel>
    </section>
  );
}
