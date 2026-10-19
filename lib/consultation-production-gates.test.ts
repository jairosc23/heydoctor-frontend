import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildConsultationDocumentDisabled,
  resolveCanPay,
} from "./consultation-production-gates";

describe("consultation-production-gates Phase 4.9.0", () => {
  it("F1 — canPay solo en signed", () => {
    assert.equal(resolveCanPay("signed"), true);
    assert.equal(resolveCanPay("locked"), false);
    assert.equal(resolveCanPay("completed"), false);
    assert.equal(resolveCanPay("in_progress"), false);
    assert.equal(resolveCanPay("draft"), false);
  });

  it("F3 — documentos firmados bloqueados hasta firma", () => {
    const preSign = buildConsultationDocumentDisabled({
      isSigned: false,
      isLocked: false,
    });
    assert.equal(preSign.signedPrescription, true);
    assert.equal(preSign.signedCertificate, true);
    assert.equal(preSign.signedReferral, true);
    assert.equal(preSign.premium, true);
    assert.equal(preSign.pdf, true);

    const signed = buildConsultationDocumentDisabled({
      isSigned: true,
      isLocked: false,
    });
    assert.equal(signed.signedPrescription, false);
    assert.equal(signed.pdf, false);
    assert.equal(signed.invoice, false);

    const locked = buildConsultationDocumentDisabled({
      isSigned: true,
      isLocked: true,
    });
    assert.equal(locked.invoice, true);
    assert.equal(locked.pdf, false);
  });
});
