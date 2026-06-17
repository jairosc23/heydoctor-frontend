"use client";

import { ClinicalPanel, ClinicalSection } from "@/components/clinical/design";
import { clinicalTabClass } from "@/lib/clinical-design-tokens";
import { ChatPanel } from "@/components/telemedicine/ChatPanel";
import type { NestConsultation } from "@/lib/services/consultations";
import {
  ClinicalEncounterChart,
  type ClinicalEncounterChartProps,
} from "./chart/ClinicalEncounterChart";

export type EncounterLeftPaneTab = "soap" | "chat";

const LEFT_TABS: { id: EncounterLeftPaneTab; label: string }[] = [
  { id: "soap", label: "Ficha Clínica" },
  { id: "chat", label: "Chat" },
];

export interface EncounterLeftPaneProps {
  consultation: NestConsultation;
  consultationId: string;
  activeTab: EncounterLeftPaneTab;
  onTabChange: (tab: EncounterLeftPaneTab) => void;
  encounterChart?: ClinicalEncounterChartProps | null;
}

export function EncounterLeftPane({
  consultation,
  consultationId,
  activeTab,
  onTabChange,
  encounterChart,
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

          {!patientId && activeTab === "chat" ? (
            <p className="rounded-hd-md border border-amber-200 bg-amber-50 px-hd-4 py-hd-3 text-sm text-amber-900">
              Esta consulta no tiene paciente asociado. El chat no está
              disponible.
            </p>
          ) : null}

          {activeTab === "soap" ? (
            encounterChart ? (
              <ClinicalEncounterChart {...encounterChart} />
            ) : null
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
