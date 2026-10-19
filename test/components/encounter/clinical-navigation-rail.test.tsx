import { describe, expect, it, vi, beforeAll } from "vitest";
import { ClinicalNavigationRail } from "@/app/panel/consultas/[id]/_components/ClinicalNavigationRail";
import type { ClinicalNavigationSection } from "@/app/panel/consultas/[id]/_components/clinical-navigation-rail-model";
import { renderWithProviders, screen } from "@/test/utils/render";

beforeAll(() => {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
  if (typeof HTMLElement.prototype.scrollIntoView !== "function") {
    HTMLElement.prototype.scrollIntoView = function scrollIntoView() {};
  }
});

const sections: ClinicalNavigationSection[] = [
  {
    id: "encounter-section-1",
    sectionNumber: 1,
    label: "Identificación",
    shortLabel: "ID",
    group: "context",
    lane: "primary",
    completion: "completed",
  },
  {
    id: "encounter-section-13",
    sectionNumber: 13,
    label: "Tratamiento",
    shortLabel: "Plan",
    group: "documentation",
    lane: "primary",
    completion: "completed",
  },
  {
    id: "encounter-section-21",
    sectionNumber: 21,
    label: "Clinical Documents",
    shortLabel: "CDE",
    group: "documentation",
    lane: "disclosure",
    completion: "completed",
  },
  {
    id: "encounter-section-44",
    sectionNumber: 44,
    label: "Clinical Knowledge Grounding",
    shortLabel: "Atribución",
    group: "documentation",
    lane: "disclosure",
    completion: "completed",
  },
  {
    id: "encounter-section-20",
    sectionNumber: 20,
    label: "Firma",
    shortLabel: "Firma",
    group: "closure",
    lane: "primary",
    completion: "blocked",
  },
  {
    id: "encounter-section-22",
    sectionNumber: 22,
    label: "Documentos",
    shortLabel: "Docs",
    group: "closure",
    lane: "primary",
    completion: "empty",
  },
];

describe("E2-2 ClinicalNavigationRail disclosure chrome", () => {
  it("opens showing only primary and keeps disclosure behind one click", async () => {
    const onNavigate = vi.fn();
    const { user } = renderWithProviders(
      <ClinicalNavigationRail
        sections={sections}
        activeSectionId="encounter-section-1"
        onNavigate={onNavigate}
      />,
    );

    expect(screen.getByTestId("clinical-navigation-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("clinical-navigation-item-13")).toBeInTheDocument();
    expect(screen.getByTestId("clinical-navigation-item-20")).toBeInTheDocument();
    expect(screen.getByTestId("clinical-navigation-item-22")).toBeInTheDocument();
    expect(
      screen.queryByTestId("clinical-navigation-item-21"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("clinical-navigation-item-44"),
    ).not.toBeInTheDocument();

    const toggle = screen.getByTestId("clinical-navigation-disclosure-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByTestId("clinical-navigation-item-21")).toHaveAttribute(
      "data-section-id",
      "encounter-section-21",
    );
    expect(screen.getByTestId("clinical-navigation-item-44")).toHaveAttribute(
      "data-section-id",
      "encounter-section-44",
    );
    expect(screen.getByTestId("clinical-navigation-rail")).toHaveAttribute(
      "data-disclosure-expanded",
      "true",
    );
  });

  it("shows Signature-ready order with oferta and HAB before firma", () => {
    renderWithProviders(
      <ClinicalNavigationRail
        sections={sections}
        activeSectionId="encounter-section-1"
        onNavigate={vi.fn()}
      />,
    );

    const rail = screen.getByTestId("clinical-navigation-rail");
    expect(rail).toHaveAttribute("data-care-path", "signature-ready");
    const offer = screen.getByTestId("clinical-navigation-offer");
    const hab = screen.getByTestId("clinical-navigation-authorization");
    const cic = screen.getByTestId("clinical-navigation-copilot");
    const firma = screen.getByTestId("clinical-navigation-item-20");
    const documentos = screen.getByTestId("clinical-navigation-item-22");
    const soap = screen.getByTestId("clinical-navigation-item-13");
    const toggle = screen.getByTestId("clinical-navigation-disclosure-toggle");
    const pin = screen.getByTestId("clinical-navigation-closure-pin");
    const scroll = screen.getByTestId("clinical-navigation-rail-scroll");

    expect(offer).toHaveAttribute("data-section-id", "encounter-offer");
    expect(hab).toHaveAttribute("data-section-id", "encounter-hab");
    expect(cic).toHaveAttribute("data-section-id", "encounter-cic");
    expect(soap.compareDocumentPosition(cic) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cic.compareDocumentPosition(offer) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(offer.compareDocumentPosition(hab) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(hab.compareDocumentPosition(firma) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(pin).toContainElement(firma);
    expect(pin).toContainElement(documentos);
    expect(scroll).toContainElement(toggle);
    expect(scroll).not.toContainElement(firma);
    expect(scroll).not.toContainElement(documentos);
  });

  it("keeps Firma and Documentos pinned when disclosure expands", async () => {
    const { user } = renderWithProviders(
      <ClinicalNavigationRail
        sections={sections}
        activeSectionId="encounter-section-1"
        onNavigate={vi.fn()}
      />,
    );

    await user.click(screen.getByTestId("clinical-navigation-disclosure-toggle"));
    const pin = screen.getByTestId("clinical-navigation-closure-pin");
    const scroll = screen.getByTestId("clinical-navigation-rail-scroll");
    expect(pin).toContainElement(screen.getByTestId("clinical-navigation-item-20"));
    expect(pin).toContainElement(screen.getByTestId("clinical-navigation-item-22"));
    expect(scroll).toContainElement(screen.getByTestId("clinical-navigation-item-21"));
    expect(scroll).not.toContainElement(
      screen.getByTestId("clinical-navigation-item-20"),
    );
  });

  it("pins Firma/Documentos on the horizontal rail so they stay out of overflow-x", () => {
    renderWithProviders(
      <ClinicalNavigationRail
        sections={sections}
        activeSectionId="encounter-section-1"
        onNavigate={vi.fn()}
        orientation="horizontal"
      />,
    );

    const pin = screen.getByTestId("clinical-navigation-closure-pin");
    expect(pin).toContainElement(screen.getByTestId("clinical-navigation-item-20"));
    expect(pin).toContainElement(screen.getByTestId("clinical-navigation-item-22"));
    expect(screen.getByTestId("clinical-navigation-rail-scroll")).not.toContainElement(
      screen.getByTestId("clinical-navigation-item-20"),
    );
  });
});
