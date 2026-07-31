import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { StewardReviewPanel } from "@/components/aec1/steward/StewardReviewPanel";
import { renderWithProviders, screen, waitFor } from "@/test/utils/render";
import * as api from "@/lib/aec1/w5-clinical-steward-api";

describe("AEC-1 M1 Steward Review Mode UX", () => {
  it("shows disabled state when flag OFF", () => {
    renderWithProviders(<StewardReviewPanel enabled={false} />);
    expect(screen.getByTestId("aec1-steward-disabled")).toBeInTheDocument();
    expect(screen.queryByTestId("aec1-steward-review")).toBeNull();
  });

  it("displays NON_AUTHORITY advisory and omits Confirm/Emit/apply CTAs", () => {
    renderWithProviders(<StewardReviewPanel enabled />);
    expect(screen.getByTestId("aec1-steward-review")).toBeInTheDocument();
    expect(screen.getByTestId("hcx-workspace-container")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-steward-non-authority")).toHaveTextContent(
      /NON_AUTHORITY/,
    );
    expect(screen.getByTestId("aec1-steward-no-confirm")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-steward-no-emit")).toBeInTheDocument();
    expect(screen.getByTestId("aec1-steward-no-apply")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /Confirm HAB|Emit PE|apply-to-chart/i }),
    ).toBeNull();
  });

  it("loads insights and wires dismiss/ack semantics only", async () => {
    const list = vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [
        {
          insightId: "i1",
          title: "Advisory tip",
          summary: "Review labs",
          authorityClass: "NON_AUTHORITY",
        },
      ],
      authorityClass: "NON_AUTHORITY",
      disclaimer: api.W5_CLINICAL_DISCLAIMER,
    });
    const dismiss = vi
      .spyOn(api, "w5ClinicalDismissInsight")
      .mockResolvedValue({ ok: true });
    const ack = vi
      .spyOn(api, "w5ClinicalAckInsight")
      .mockResolvedValue({ ok: true });

    renderWithProviders(<StewardReviewPanel enabled />);
    screen.getByTestId("aec1-steward-load").click();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-steward-insight-i1")).toBeInTheDocument();
    });
    expect(list).toHaveBeenCalled();

    screen.getByTestId("aec1-steward-dismiss-i1").click();
    await waitFor(() => expect(dismiss).toHaveBeenCalledWith("i1", "steward-review"));

    screen.getByTestId("aec1-steward-ack-i1").click();
    await waitFor(() => expect(ack).toHaveBeenCalledWith("i1", "steward-review"));

    list.mockRestore();
    dismiss.mockRestore();
    ack.mockRestore();
  });

  it("fail-closed surfaces API deny code", async () => {
    vi.spyOn(api, "w5ClinicalListInsights").mockResolvedValue({
      insights: [],
      authorityClass: "NON_AUTHORITY",
      code: "W5_FLAG_OR_AUTHORITY_DENIED",
      message: "denied",
    });
    renderWithProviders(<StewardReviewPanel enabled />);
    screen.getByTestId("aec1-steward-load").click();
    await waitFor(() => {
      expect(screen.getByTestId("aec1-steward-api-status")).toHaveTextContent(
        "W5_FLAG_OR_AUTHORITY_DENIED",
      );
    });
    vi.restoreAllMocks();
  });

  it("issues attestation only when complete", async () => {
    renderWithProviders(<StewardReviewPanel enabled />);
    fireEvent.click(screen.getByTestId("aec1-steward-issue-attestation"));
    expect(screen.queryByTestId("aec1-steward-attestation-json")).toBeNull();

    fireEvent.change(screen.getByTestId("aec1-steward-identity"), {
      target: { value: "steward@test" },
    });

    for (const id of [
      "label-non-authority",
      "dismiss-not-hab",
      "ack-not-hab",
      "no-confirm-emit",
      "fail-closed",
    ]) {
      fireEvent.click(screen.getByTestId(`aec1-steward-scenario-${id}-pass`));
    }

    fireEvent.click(screen.getByTestId("aec1-steward-issue-attestation"));
    await waitFor(() => {
      const json = screen.getByTestId("aec1-steward-attestation-json");
      expect(json).toHaveTextContent("AEC1_STEWARD_ATTESTATION");
      expect(json).toHaveTextContent("dismissIsNotHab");
      expect(json).toHaveTextContent("confirmHabForbiddenInUi");
    });
  });
});
