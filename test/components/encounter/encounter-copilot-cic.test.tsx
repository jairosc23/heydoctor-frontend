import { describe, expect, it, vi, beforeEach } from "vitest";
import { EncounterCopilotCicStrip } from "@/app/panel/consultas/[id]/_components/copilot/EncounterCopilotCicStrip";
import { getConsultationAssist } from "@/lib/clinical-ai-facade";
import { renderWithProviders, screen } from "@/test/utils/render";

vi.mock("@/lib/clinical-ai-facade", () => ({
  getConsultationAssist: vi.fn(async () => ({
    requestId: "req-1",
    data: {
      assistiveOnlyNotice: "Solo asistencia.",
      possibleDiagnoses: [],
      recommendations: [
        "Preguntar duración del dolor",
        "Clarificar fiebre asociada",
        "Revisar alergias ya documentadas",
        "Cuarta propuesta que no debe verse",
      ],
      generalEducation: [],
    },
  })),
}));

describe("E6 EncounterCopilotCicStrip", () => {
  beforeEach(() => {
    vi.mocked(getConsultationAssist).mockClear();
  });

  it("mounts inside the encounter as propose-only CIC", () => {
    renderWithProviders(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="Cefalea"
        subjective=""
        plan=""
        onApplyToSubjective={vi.fn()}
        editable
      />,
    );
    const cic = screen.getByTestId("encounter-cic");
    expect(cic).toHaveAttribute("data-cic-authority", "propose");
    expect(cic).toHaveAttribute("data-cic-confirm", "false");
    expect(cic).toHaveAttribute("data-cic-emit", "false");
    expect(cic).toHaveAttribute("data-cic-mode", "structure_soap");
    expect(cic).toHaveAttribute("data-cic-guidance", "continuous");
    expect(cic).toHaveAttribute("data-hot-path", "true");
    expect(getConsultationAssist).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /confirmar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /emitir/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /firmar/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("suggests at most three proposals and applies one to SOAP", async () => {
    const onApply = vi.fn();
    const { user } = renderWithProviders(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="Cefalea"
        subjective="Inicio agudo"
        plan=""
        onApplyToSubjective={onApply}
        editable
      />,
    );

    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "continue_soap",
    );
    await user.click(screen.getByTestId("encounter-cic-suggest"));
    const items = await screen.findAllByText(/Preguntar duración del dolor|Clarificar fiebre asociada|Revisar alergias ya documentadas/);
    expect(items).toHaveLength(3);
    expect(
      screen.queryByText("Cuarta propuesta que no debe verse"),
    ).not.toBeInTheDocument();

    const applyButtons = screen.getAllByText("Aplicar a SOAP");
    await user.click(applyButtons[0]);
    expect(onApply).toHaveBeenCalledWith("Inicio agudo\nPreguntar duración del dolor");
  });

  it("follows Encounter evolution locally without fetching or interrupting", () => {
    const onApply = vi.fn();
    const { rerender } = renderWithProviders(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="HTA"
        subjective=""
        plan=""
        onApplyToSubjective={onApply}
        editable
      />,
    );
    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "structure_soap",
    );

    rerender(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="HTA"
        subjective="Control de hipertensión en consulta."
        plan=""
        onApplyToSubjective={onApply}
        editable
      />,
    );
    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "continue_soap",
    );

    rerender(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="HTA"
        subjective="Control de hipertensión en consulta con anamnesis extensa documentada por el médico tratante."
        plan="Ajuste de antihipertensivo y control en cuatro semanas."
        physicalExamDocumented
        onApplyToSubjective={onApply}
        onApplyToPlan={vi.fn()}
        editable
      />,
    );
    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "clinical_summary",
    );

    rerender(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="HTA"
        subjective="Control de hipertensión en consulta con anamnesis extensa documentada por el médico tratante."
        plan="Ajuste de antihipertensivo y control en cuatro semanas."
        physicalExamDocumented
        offerExpanded
        onApplyToSubjective={onApply}
        onApplyToPlan={vi.fn()}
        editable
      />,
    );
    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "offer_suggestions",
    );

    rerender(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="HTA"
        subjective="Control de hipertensión en consulta con anamnesis extensa documentada por el médico tratante."
        plan="Ajuste de antihipertensivo y control en cuatro semanas."
        physicalExamDocumented
        offerExpanded={false}
        onApplyToSubjective={onApply}
        onApplyToPlan={vi.fn()}
        editable
      />,
    );
    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "clinical_summary",
    );

    rerender(
      <EncounterCopilotCicStrip
        consultationId="c1"
        chiefComplaint="HTA"
        subjective="Control de hipertensión en consulta con anamnesis extensa documentada por el médico tratante."
        plan="Ajuste de antihipertensivo y control en cuatro semanas."
        physicalExamDocumented
        activeProblemCount={3}
        onApplyToSubjective={onApply}
        onApplyToPlan={vi.fn()}
        editable
      />,
    );
    expect(screen.getByTestId("encounter-cic")).toHaveAttribute(
      "data-cic-mode",
      "reasoning_questions",
    );

    expect(getConsultationAssist).not.toHaveBeenCalled();
    expect(onApply).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
