import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSafePostLoginPath } from "../auth/safe-redirect";
import {
  myOrganizationsQueryKey,
  organizationDashboardQueryKey,
  portalIndexQueryKey,
} from "../queries/query-keys";
import {
  organizationDashboardPath,
  organizationPagePath,
  organizationPath,
  organizationsPath,
} from "./organizations";

describe("organization contracts", () => {
  it("builds API and page paths over the organization facade", () => {
    assert.equal(organizationsPath(), "/organizations");
    assert.equal(organizationPath("o1"), "/organizations/o1");
    assert.equal(organizationDashboardPath("o1"), "/organizations/o1/dashboard");
    assert.equal(organizationPagePath(), "/organizacion");
    assert.equal(organizationPagePath("o1"), "/organizacion/o1");
  });

  it("keeps the organization UX outside Patient Portal routes", () => {
    assert.equal(
      getSafePostLoginPath("/organizacion", "admin"),
      "/organizacion",
    );
    assert.equal(getSafePostLoginPath("/organizacion", "patient"), "/portal");
  });

  it("keeps organization and portal query keys on the existing cache facade", () => {
    assert.deepEqual(myOrganizationsQueryKey(), ["organizations", "mine"]);
    assert.deepEqual(organizationDashboardQueryKey("o1"), [
      "organizations",
      "dashboard",
      "o1",
    ]);
    assert.deepEqual(portalIndexQueryKey("exams"), ["portal", "index", "exams"]);
  });
});
