/**
 * RC12 controlled-web contract guards.
 * Source-boundary assertions complement (do not replace) E2E with a known
 * backend image. Fail closed if a future selective promotion widens scope.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

const source = (name: string) =>
  readFileSync(path.join(process.cwd(), name), "utf8");

describe("RC12 — invitation-only candidate boundaries", () => {
  it("opens the linked encounter via the appointment-scoped authorized endpoint", () => {
    const client = source("lib/services/consultations.ts");
    assert.match(client, /export async function openAppointmentConsultation\s*\(/);
    assert.match(
      client,
      /heydoctorApi\.post<[\s\S]*?\x60\$\{BASE\}\/from-appointment\/\$\{encodeURIComponent\(appointmentId\)\}\x60,\s*\{\}/,
    );
  });

  it("only presents the unlinked appointment flow to the doctor for a confirmed slot", () => {
    const modal = source("components/agenda/AppointmentFormModal.tsx");
    assert.match(modal, /const canOpenUnlinkedEncounter\s*=/);
    assert.match(modal, /!appointment\?\.consultationId\s*&&\s*!isAdmin/);
    assert.match(modal, /displayStatus\(appointment!\)\s*===\s*"CONFIRMED"/);
    assert.match(modal, /openEncounterMutation\.mutate\(\)/);
  });

  it("uses fragment-only guest token entry with a UUIDv4 gate", () => {
    const page = source("app/teleconsulta/invitado/page.tsx");
    assert.match(page, /window\.location\.hash\.slice\(1\)/);
    assert.match(page, /UUID_V4\.test\(candidate\)/);
    assert.match(page, /inviteTokenGate=\{token\}/);
    assert.doesNotMatch(page, /window\.location\.search|searchParams\.get\(/);
  });

  it("exposes only the intended exact guest entry in middleware", () => {
    const middleware = source("middleware.ts");
    assert.match(
      middleware,
      /if \(pathname === "\/teleconsulta\/invitado"\) return true;/,
    );
    assert.match(
      middleware,
      /if \(pathname\.startsWith\("\/teleconsulta\/invitado\/"\)\) return true;/,
    );
  });

  it("does not accidentally promote staging payment API paths", () => {
    const payments = source("lib/services/payments.ts");
    assert.match(payments, /"\/payku\/create-payment-session"/);
    assert.match(payments, /\x60\/payku\/consultation\/\$\{consultationId\}\/payment-status\x60/);
    assert.doesNotMatch(payments, /"\/payments\/create-payment-session"/);
  });
});
