import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  adminRouteRedirect,
  canAccessOrganizationRoute,
  organizationRouteRedirect,
  patientStaffSurfaceRedirect,
  staffPatientSurfaceRedirect,
} from "./staff-route-access";

describe("P0-1 /organizacion access", () => {
  for (const role of ["doctor", "admin", "owner", "manager", "member"]) {
    it(`allows ${role} to keep /organizacion`, () => {
      assert.equal(canAccessOrganizationRoute(role), true);
      assert.equal(organizationRouteRedirect(role), null);
      assert.equal(patientStaffSurfaceRedirect("/organizacion", role), null);
      assert.equal(
        patientStaffSurfaceRedirect("/organizacion/org-1", role),
        null,
      );
      assert.equal(staffPatientSurfaceRedirect("/organizacion", role), null);
    });
  }

  it("redirects patient from /organizacion to /portal", () => {
    assert.equal(canAccessOrganizationRoute("patient"), false);
    assert.equal(organizationRouteRedirect("patient"), "/portal");
    assert.equal(
      patientStaffSurfaceRedirect("/organizacion", "patient"),
      "/portal",
    );
  });

  it("does not treat empty role as organization staff", () => {
    assert.equal(canAccessOrganizationRoute(null), false);
    assert.equal(organizationRouteRedirect(""), "/portal");
  });

  it("still sends staff away from /portal and /cierre", () => {
    assert.equal(staffPatientSurfaceRedirect("/portal", "doctor"), "/panel");
    assert.equal(staffPatientSurfaceRedirect("/cierre/c1", "admin"), "/panel");
    assert.equal(
      staffPatientSurfaceRedirect("/portal/register", "doctor"),
      null,
    );
  });
});

describe("P0-3 /admin/* fail-closed", () => {
  it("allows only admin to stay on /admin", () => {
    assert.equal(adminRouteRedirect("/admin/ops", "admin"), null);
    assert.equal(adminRouteRedirect("/admin", "admin"), null);
  });

  it("denies doctor, org roles, patient and missing role", () => {
    assert.equal(adminRouteRedirect("/admin/ops", "doctor"), "/panel");
    assert.equal(adminRouteRedirect("/admin/ops", "owner"), "/panel");
    assert.equal(adminRouteRedirect("/admin/ops", "manager"), "/panel");
    assert.equal(adminRouteRedirect("/admin/ops", "member"), "/panel");
    assert.equal(adminRouteRedirect("/admin/ops", "patient"), "/portal");
    assert.equal(adminRouteRedirect("/admin/ops", null), "/panel");
    assert.equal(adminRouteRedirect("/admin/ops", ""), "/panel");
  });

  it("does not apply admin redirect outside /admin", () => {
    assert.equal(adminRouteRedirect("/panel", "doctor"), null);
    assert.equal(adminRouteRedirect("/organizacion", "member"), null);
  });
});
