import { useState } from "react";
import { describe, expect, it } from "vitest";
import { useEncounterNotesDraft } from "@/hooks/useEncounterNotesDraft";
import { composeEncounterNotes } from "@/lib/compose-encounter-notes";
import { EMPTY_PHYSICAL_EXAM, emptyMskExam } from "@/lib/physical-exam-framework";
import { AnamnesisSection } from "@/app/panel/consultas/[id]/_components/chart/AnamnesisSection";
import { PhysicalExamSection } from "@/app/panel/consultas/[id]/_components/chart/PhysicalExamSection";
import { TreatmentSection } from "@/app/panel/consultas/[id]/_components/chart/TreatmentSection";
import { renderWithProviders, screen } from "@/test/utils/render";

function emptyExam() {
  return { ...EMPTY_PHYSICAL_EXAM, msk: emptyMskExam() };
}

function EncounterNotesHarness({
  rawNotes,
  consultationId = "c1",
}: {
  rawNotes: string | null;
  consultationId?: string;
}) {
  const draft = useEncounterNotesDraft(rawNotes, "", consultationId);
  return (
    <div>
      <AnamnesisSection
        value={draft.presentIllnessHistory}
        onChange={draft.setPresentIllnessHistory}
        editable
      />
      <PhysicalExamSection
        exam={draft.physicalExam}
        onChange={draft.setPhysicalExam}
        editable
      />
      <pre data-testid="composed-notes">{draft.composeNotes()}</pre>
    </div>
  );
}

function PlanHarness() {
  const [treatment, setTreatment] = useState("Plan inicial.");
  const [tick, setTick] = useState(0);
  return (
    <div>
      <TreatmentSection value={treatment} onChange={setTreatment} editable />
      <button type="button" onClick={() => setTick((n) => n + 1)}>
        rerender-{tick}
      </button>
    </div>
  );
}

async function typeInMiddle(
  field: HTMLTextAreaElement,
  user: Awaited<ReturnType<typeof renderWithProviders>>["user"],
  insert: string,
  at: number,
) {
  field.focus();
  field.setSelectionRange(at, at);
  await user.keyboard(insert);
}

describe("P0-1 Encounter clinical editor", () => {
  it("hydrates HEA and exam from server notes on first load", () => {
    const rawNotes = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Cefalea de 48h",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: { ...emptyExam(), general: "Buen estado general" },
    });

    renderWithProviders(
      <EncounterNotesHarness rawNotes={rawNotes} consultationId="c1" />,
    );

    expect(screen.getByTestId("anamnesis-present-illness")).toHaveValue(
      "Cefalea de 48h",
    );
    expect(screen.getByTestId("physical-exam-general")).toHaveValue(
      "Buen estado general",
    );
  });

  it("keeps caret and in-progress HEA when autosave echoes stale notes", async () => {
    const initial = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "abc def",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });

    const { user, rerender } = renderWithProviders(
      <EncounterNotesHarness rawNotes={initial} consultationId="c1" />,
    );

    const hea = screen.getByTestId(
      "anamnesis-present-illness",
    ) as HTMLTextAreaElement;
    await typeInMiddle(hea, user, "X", 3);

    expect(hea).toHaveValue("abcX def");
    expect(hea.selectionStart).toBe(4);

    const staleEcho = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "abc def",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    rerender(
      <EncounterNotesHarness rawNotes={`${staleEcho}\n`} consultationId="c1" />,
    );

    expect(hea).toHaveValue("abcX def");
    expect(hea.selectionStart).toBe(4);
    expect(screen.getByTestId("composed-notes").textContent).toContain(
      "abcX def",
    );

    hea.setSelectionRange(3, 4);
    await user.keyboard("{Backspace}");
    expect(hea).toHaveValue("abc def");
    expect(hea.selectionStart).toBe(3);

    rerender(
      <EncounterNotesHarness
        rawNotes={`${staleEcho}\n\n`}
        consultationId="c1"
      />,
    );
    expect(hea).toHaveValue("abc def");
    expect(hea.selectionStart).toBe(3);

    const matchingEcho = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "abc def",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    rerender(
      <EncounterNotesHarness rawNotes={matchingEcho} consultationId="c1" />,
    );
    expect(hea).toHaveValue("abc def");
    expect(hea.selectionStart).toBe(3);
  });

  it("does not glue, overwrite, or jump to the end after paste plus autosave echo", async () => {
    const initial = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "dolor toracico",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });

    const { user, rerender } = renderWithProviders(
      <EncounterNotesHarness rawNotes={initial} consultationId="c1" />,
    );

    const hea = screen.getByTestId(
      "anamnesis-present-illness",
    ) as HTMLTextAreaElement;
    hea.focus();
    hea.setSelectionRange(5, 5);
    await user.paste(" intenso");

    expect(hea).toHaveValue("dolor intenso toracico");
    expect(hea.selectionStart).toBe(13);

    const staleSaved = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "dolor tora",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    rerender(
      <EncounterNotesHarness rawNotes={staleSaved} consultationId="c1" />,
    );

    expect(hea).toHaveValue("dolor intenso toracico");
    expect(hea.selectionStart).toBe(13);
    expect(hea.selectionStart).not.toBe(hea.value.length);
  });

  it("preserves physical exam edits while HEA autosave rewrites notes", async () => {
    const initial = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Cefalea",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: { ...emptyExam(), abdomen: "Blando" },
    });

    const { user, rerender } = renderWithProviders(
      <EncounterNotesHarness rawNotes={initial} consultationId="c1" />,
    );

    const abdomen = screen.getByTestId(
      "physical-exam-abdomen",
    ) as HTMLTextAreaElement;
    abdomen.focus();
    abdomen.setSelectionRange(6, 6);
    await user.keyboard(", sin dolor");

    expect(abdomen).toHaveValue("Blando, sin dolor");
    expect(abdomen.selectionStart).toBe(17);

    const heaOnlySave = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Cefalea pulsatil",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: { ...emptyExam(), abdomen: "Blando" },
    });
    rerender(
      <EncounterNotesHarness rawNotes={heaOnlySave} consultationId="c1" />,
    );

    expect(abdomen).toHaveValue("Blando, sin dolor");
    expect(screen.getByTestId("anamnesis-present-illness")).toHaveValue(
      "Cefalea",
    );
    expect(screen.getByTestId("composed-notes").textContent).toContain(
      "Blando, sin dolor",
    );
  });

  it("rehydrates after reload of the same encounter when the editor is clean", () => {
    const first = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Primera carga",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    const { rerender } = renderWithProviders(
      <EncounterNotesHarness rawNotes={first} consultationId="c1" />,
    );
    expect(screen.getByTestId("anamnesis-present-illness")).toHaveValue(
      "Primera carga",
    );

    const reloaded = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Tras F5",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    rerender(
      <EncounterNotesHarness rawNotes={reloaded} consultationId="c1" />,
    );
    expect(screen.getByTestId("anamnesis-present-illness")).toHaveValue(
      "Tras F5",
    );
  });

  it("hydrates the new encounter when consultation identity changes", () => {
    const notesA = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Consulta A",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    const { rerender } = renderWithProviders(
      <EncounterNotesHarness rawNotes={notesA} consultationId="a" />,
    );

    const notesB = composeEncounterNotes({
      clinicalRecord: {
        presentIllnessHistory: "Consulta B",
        systemsReview: {
          skin: "",
          digestive: "",
          neurological: "",
          respiratory: "",
          cardiovascular: "",
          genitourinary: "",
        },
        freeNotes: "",
      },
      vitals: {},
      physicalExam: emptyExam(),
    });
    rerender(<EncounterNotesHarness rawNotes={notesB} consultationId="b" />);
    expect(screen.getByTestId("anamnesis-present-illness")).toHaveValue(
      "Consulta B",
    );
  });

  it("does not move the plan caret on unrelated parent re-renders", async () => {
    const { user } = renderWithProviders(<PlanHarness />);
    const plan = screen.getByTestId("encounter-treatment") as HTMLTextAreaElement;
    await typeInMiddle(plan, user, "X", 4);
    expect(plan).toHaveValue("PlanX inicial.");
    expect(plan.selectionStart).toBe(5);

    await user.click(screen.getByRole("button", { name: /rerender-0/ }));
    expect(plan).toHaveValue("PlanX inicial.");
    expect(plan.selectionStart).toBe(5);
  });
});
