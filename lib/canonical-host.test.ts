import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { canonicalHostRedirectTarget } from "./canonical-host";

describe("canonical apex host", () => {
  it("redirects the apex root to www", () => {
    assert.equal(
      canonicalHostRedirectTarget("heydoctor.health", "/", ""),
      "https://www.heydoctor.health/",
    );
  });

  it("redirects an apex path to www", () => {
    assert.equal(
      canonicalHostRedirectTarget("heydoctor.health", "/consultar", ""),
      "https://www.heydoctor.health/consultar",
    );
  });

  it("preserves the apex path and query", () => {
    assert.equal(
      canonicalHostRedirectTarget(
        "heydoctor.health",
        "/medicos",
        "?q=ana&specialty=cardio&patientCountry=CL",
      ),
      "https://www.heydoctor.health/medicos?q=ana&specialty=cardio&patientCountry=CL",
    );
  });

  it("does not redirect www", () => {
    assert.equal(
      canonicalHostRedirectTarget("www.heydoctor.health", "/medicos", "?q=1"),
      null,
    );
  });

  it("does not redirect app", () => {
    assert.equal(
      canonicalHostRedirectTarget("app.heydoctor.health", "/panel", ""),
      null,
    );
  });

  it("does not redirect staging-app", () => {
    assert.equal(
      canonicalHostRedirectTarget(
        "staging-app.heydoctor.health",
        "/login",
        "?redirect=/panel",
      ),
      null,
    );
  });

  it("does not redirect localhost", () => {
    assert.equal(
      canonicalHostRedirectTarget("localhost", "/", "?q=1"),
      null,
    );
  });

  it("does not redirect railway.app hosts", () => {
    assert.equal(
      canonicalHostRedirectTarget(
        "heydoctor-frontend-production.up.railway.app",
        "/medicos",
        "",
      ),
      null,
    );
  });
});
