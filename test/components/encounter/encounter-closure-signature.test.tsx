import { describe, expect, it } from "vitest";
import { EncounterClosureSection } from "@/app/panel/consultas/[id]/_components/chart/EncounterClosureSection";
import { renderWithProviders, screen } from "@/test/utils/render";

const noop = () => undefined;

const documentHandlers = {
  onStartTeleconsultation: noop,
  onOpenPrescription: noop,
  onGenerateInvoice: noop,
  onDownloadPdf: noop,
  onToggleEdit: noop,
  onAnalyzeWithAi: noop,
  onDelete: noop,
  onGenerateSignedPrescription: noop,
  onGenerateSignedCertificate: noop,
  onGenerateSignedReferral: noop,
  onGeneratePremiumDocument: noop,
};

describe("EncounterClosureSection signature roundtrip", () => {
  it("renders a persisted raw base64 signature after legal close", () => {
    renderWithProviders(
      <EncounterClosureSection
        status="signed"
        isSigned
        isLocked={false}
        canSign={false}
        signing={false}
        onSign={noop}
        signedAt="2026-08-20T20:00:00.000Z"
        doctorSignature="iVBORw0KGgo"
        documentHandlers={documentHandlers}
        documentLoading={{}}
        documentDisabled={{}}
      />,
    );
    const img = screen.getByTestId("encounter-signed-signature");
    expect(img).toHaveAttribute("src", "data:image/png;base64,iVBORw0KGgo");
    expect(screen.queryByTestId("encounter-sign-panel")).not.toBeInTheDocument();
  });

  it("does not double-prefix a data URL payload", () => {
    renderWithProviders(
      <EncounterClosureSection
        status="signed"
        isSigned
        isLocked={false}
        canSign={false}
        signing={false}
        onSign={noop}
        signedAt="2026-08-20T20:00:00.000Z"
        doctorSignature="data:image/png;base64,iVBORw0KGgo"
        documentHandlers={documentHandlers}
        documentLoading={{}}
        documentDisabled={{}}
      />,
    );
    expect(screen.getByTestId("encounter-signed-signature")).toHaveAttribute(
      "src",
      "data:image/png;base64,iVBORw0KGgo",
    );
  });

  it("fail-closes when status is signed but the signature payload is missing", () => {
    renderWithProviders(
      <EncounterClosureSection
        status="signed"
        isSigned
        isLocked={false}
        canSign={false}
        signing={false}
        onSign={noop}
        signedAt="2026-08-20T20:00:00.000Z"
        doctorSignature={null}
        documentHandlers={documentHandlers}
        documentLoading={{}}
        documentDisabled={{}}
      />,
    );
    expect(screen.getByTestId("encounter-signature-missing")).toBeInTheDocument();
    expect(screen.queryByTestId("encounter-signed-signature")).not.toBeInTheDocument();
  });
});
