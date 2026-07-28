import { describe, expect, it, vi, beforeEach } from "vitest";
import { JourneyNavigator } from "@/components/clinical/journey/JourneyNavigator";
import { renderWithProviders, screen } from "@/test/utils/render";

vi.mock("@/lib/journey-orchestrator/api", () => ({
  startConsultationJourney: vi.fn().mockResolvedValue({
    journeyId: "j1",
    consultationId: "c1",
    patientId: "p1",
    stage: "Opened",
    emissionPerformed: false,
    clinicalPersistencePerformed: false,
    authorityChannel: "consultation_journey_orchestrator",
  }),
  listLegalNextStages: vi.fn().mockResolvedValue(["Orienting"]),
  advanceConsultationJourney: vi.fn(),
  getConsultationJourney: vi.fn(),
}));

describe("JourneyNavigator (E03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders journey chrome and non-authority label", async () => {
    renderWithProviders(
      <JourneyNavigator
        consultationId="c1"
        patientId="p1"
        enabled
        contextBound
      />,
    );
    expect(await screen.findByTestId("journey-navigator")).toBeInTheDocument();
    expect(screen.getByTestId("journey-non-authority")).toHaveTextContent(
      /no emite/i,
    );
  });

  it("blocks when context unbound", () => {
    renderWithProviders(
      <JourneyNavigator
        consultationId="c1"
        patientId="p1"
        enabled
        contextBound={false}
      />,
    );
    expect(screen.getByText(/Contexto no vinculado/i)).toBeInTheDocument();
  });
});
