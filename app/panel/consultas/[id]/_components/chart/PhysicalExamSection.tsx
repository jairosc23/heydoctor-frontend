"use client";

import type { PhysicalExam } from "@/lib/physical-exam-framework";
import {
  MSK_EXAM_REGION_LABELS,
  MSK_EXAM_REGIONS,
  PHYSICAL_EXAM_SECTION_LABELS,
  PHYSICAL_EXAM_SECTIONS,
  emptyMskExam,
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
  const msk = exam.msk ?? emptyMskExam();

  const setSection = (key: (typeof PHYSICAL_EXAM_SECTIONS)[number], value: string) => {
    onChange({ ...exam, msk, [key]: value });
  };

  const setMskRegion = (region: string, value: string) => {
    onChange({
      ...exam,
      msk: { ...msk, [region]: value },
    });
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

      <div className="mt-4 space-y-2 border-t border-slate-100 pt-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Musculoesquelético
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {MSK_EXAM_REGIONS.map((region) => (
            <label key={region} className="block text-xs sm:col-span-1">
              <span className="mb-1 block font-semibold text-slate-700">
                {MSK_EXAM_REGION_LABELS[region]}
              </span>
              <textarea
                rows={2}
                className={INPUT_CLASS}
                value={msk[region] ?? ""}
                disabled={!editable}
                placeholder={
                  editable
                    ? "Inspección, palpación, movilidad, hallazgos…"
                    : ""
                }
                onChange={(e) => setMskRegion(region, e.target.value)}
                data-testid={`physical-exam-msk-${region}`}
              />
            </label>
          ))}
        </div>
      </div>
    </ClinicalEncounterSection>
  );
}
