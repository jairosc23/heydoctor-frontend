import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pointerToCanvasPoint } from "../components/clinical/signature-canvas-geometry";
import {
  adoptConsultationSignatureEcho,
  doctorSignatureImageSrc,
  isPersistedDoctorSignatureMissing,
  toPersistedDoctorSignature,
} from "./consultation-signature";

describe("consultation-signature roundtrip", () => {
  it("strips a canvas data URL for persistence", () => {
    assert.equal(
      toPersistedDoctorSignature("data:image/png;base64,iVBOR"),
      "iVBOR",
    );
    assert.equal(toPersistedDoctorSignature("iVBOR"), "iVBOR");
  });

  it("builds an img src without double-prefixing", () => {
    assert.equal(
      doctorSignatureImageSrc("iVBOR"),
      "data:image/png;base64,iVBOR",
    );
    assert.equal(
      doctorSignatureImageSrc("data:image/png;base64,iVBOR"),
      "data:image/png;base64,iVBOR",
    );
    assert.equal(doctorSignatureImageSrc(undefined), null);
    assert.equal(doctorSignatureImageSrc(""), null);
  });

  it("fail-closes signed status without a payload", () => {
    assert.equal(isPersistedDoctorSignatureMissing("signed", null), true);
    assert.equal(isPersistedDoctorSignatureMissing("signed", "iVBOR"), false);
    assert.equal(isPersistedDoctorSignatureMissing("in_progress", null), false);
  });

  it("does not hydrate a SOAP echo that dropped the signature", () => {
    const local = {
      status: "signed",
      doctorSignature: "iVBOR",
      signedAt: "2026-08-20T20:00:00.000Z",
    };
    const incoming = {
      status: "in_progress",
      doctorSignature: null,
      signedAt: null,
    };
    const adopted = adoptConsultationSignatureEcho(local, incoming);
    assert.equal(adopted.status, "signed");
    assert.equal(adopted.doctorSignature, "iVBOR");
    assert.equal(adopted.signedAt, "2026-08-20T20:00:00.000Z");
  });

  it("adopts GET when the signature is present", () => {
    const local = {
      status: "signed",
      doctorSignature: "old",
      signedAt: "2026-08-20T19:00:00.000Z",
    };
    const incoming = {
      status: "signed",
      doctorSignature: "new",
      signedAt: "2026-08-20T20:00:00.000Z",
    };
    const adopted = adoptConsultationSignatureEcho(local, incoming);
    assert.equal(adopted.doctorSignature, "new");
  });

  it("maps pointer coordinates onto the canvas bitmap when CSS scales it", () => {
    const point = pointerToCanvasPoint(
      160,
      50,
      { left: 0, top: 0, width: 250, height: 100 },
      { width: 500, height: 200 },
    );
    assert.equal(point.x, 320);
    assert.equal(point.y, 100);
  });
});
