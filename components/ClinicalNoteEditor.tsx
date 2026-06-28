"use client";

import { useState } from "react";

export type ClinicalNoteData = {
  chief_complaint: string;
  history_of_present_illness: string;
  assessment: string;
  plan: string;
};

interface ClinicalNoteEditorProps {
  note: ClinicalNoteData;
  onSave: (note: ClinicalNoteData) => void;
  onCancel: () => void;
}

export function ClinicalNoteEditor({ note, onSave, onCancel }: ClinicalNoteEditorProps) {
  const [chiefComplaint, setChiefComplaint] = useState(note.chief_complaint);
  const [hpi, setHpi] = useState(note.history_of_present_illness);
  const [assessment, setAssessment] = useState(note.assessment);
  const [plan, setPlan] = useState(note.plan);

  const handleSave = () => {
    onSave({
      chief_complaint: chiefComplaint,
      history_of_present_illness: hpi,
      assessment,
      plan,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="clinical-note-editor-title"
      >
        <div className="border-b p-4">
          <h3 id="clinical-note-editor-title" className="font-semibold text-gray-800">
            Nota clínica (editar antes de guardar)
          </h3>
        </div>
        <div className="space-y-4 p-4">
          <div>
            <label
              htmlFor="clinical-note-chief-complaint"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Chief Complaint
            </label>
            <textarea
              id="clinical-note-chief-complaint"
              value={chiefComplaint}
              onChange={(event) => setChiefComplaint(event.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="clinical-note-hpi"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              History of Present Illness
            </label>
            <textarea
              id="clinical-note-hpi"
              value={hpi}
              onChange={(event) => setHpi(event.target.value)}
              rows={4}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="clinical-note-assessment"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Assessment
            </label>
            <textarea
              id="clinical-note-assessment"
              value={assessment}
              onChange={(event) => setAssessment(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="clinical-note-plan"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Plan
            </label>
            <textarea
              id="clinical-note-plan"
              value={plan}
              onChange={(event) => setPlan(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t p-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}
