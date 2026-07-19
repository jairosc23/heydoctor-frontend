import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafePostLoginPath } from "./safe-redirect";

describe("getSafePostLoginPath (GA-FIX BUG-1)", () => {
  it("preserves medical-copilot deep-link", () => {
    const path =
      "/panel/consultas/549cb299-a827-4872-88ea-8e2e77250685/medical-copilot";
    assert.equal(getSafePostLoginPath(path), path);
  });

  it("defaults to /panel when redirect missing or unsafe", () => {
    assert.equal(getSafePostLoginPath(null), "/panel");
    assert.equal(getSafePostLoginPath(undefined), "/panel");
    assert.equal(getSafePostLoginPath(""), "/panel");
    assert.equal(getSafePostLoginPath("//evil.example/phish"), "/panel");
    assert.equal(getSafePostLoginPath("https://evil.example"), "/panel");
  });

  it("defaults patients to /portal and blocks staff panel for patients", () => {
    assert.equal(getSafePostLoginPath(null, "patient"), "/portal");
    assert.equal(getSafePostLoginPath("/panel/agenda", "patient"), "/portal");
  });

  it("never collapses a safe redirect to bare /panel", () => {
    assert.notEqual(
      getSafePostLoginPath("/panel/consultas/abc/medical-copilot"),
      "/panel",
    );
  });
});
