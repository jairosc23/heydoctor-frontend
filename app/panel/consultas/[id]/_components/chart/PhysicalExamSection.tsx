"use client";

import type { PhysicalExam } from "@/lib/physical-exam-framework";
import {
  PHYSICAL_EXAM_SECTION_LABELS,
  PHYSICAL_EXAM_SECTIONS,
} from "@/lib/physical-exam-framework";
import { ClinicalEncounterSection } from "./ClinicalEncounterSection";

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:bg-slate-50 disabled:text-slate-500";

const ENCOUNTER_EXAM_SECTIONS = PHYSICAL_EXAM_SECTIONS.filter(
  (key) => key !== "other",
);

export interface PhysicalExamSectionProps {
  exam: PhysicalExam;
  onChange: (exam: PhysicalExam) => void;
  editable: boolean;
  className?: string;
}

export function PhysicalExamSection({
  exam,
  onChange,
  editable,
  className,
}: PhysicalExamSectionProps) {
  const setSection = (key: (typeof PHYSICAL_EXAM_SECTIONS)[number], value: string) => {
    onChange({ ...exam, [key]: value });
  };

  return (
    <ClinicalEncounterSection
      sectionNumber={10}
      title="Examen físico"
      className={className}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {ENCOUNTER_EXAM_SECTIONS.map((key) => (
          <label key={key} className="block text-xs sm:col-span-1">
            <span className="mb-1 block font-semibold text-slate-700">
              {PHYSICAL_EXAM_SECTION_LABELS[key]}
            </span>
            <textarea
              rows={2}
              className={INPUT_CLASS}
              value={exam[key] ?? ""}
              disabled={!editable}
              placeholder={editable ? "Hallazgos documentados…" : ""}
              onChange={(e) => setSection(key, e.target.value)}
              data-testid={`physical-exam-${key}`}
            />
          </label>
        ))}
      </div>
    </ClinicalEncounterSection>
  );
}
