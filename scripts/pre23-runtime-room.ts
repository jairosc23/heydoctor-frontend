import { chromium } from "@playwright/test";
import { io, type Socket } from "socket.io-client";
import { writeFileSync } from "node:fs";
import { loginAsDoctor } from "../e2e/helpers/auth";

const APP = "https://heydoctor-frontend-rc17-qa-qa-isolated.up.railway.app";
const API = "https://heydoctor-backend-rc17-qa-qa-isolated.up.railway.app";
const CLINIC = "70ba993c-636b-4f2e-a43f-d0810ee77094";
const DOCTOR = "3f1b1118-72ca-468c-a996-ca977714cedb";
const GUEST_CONSULTATION = "5cacff71-9bc8-4565-9db7-30c4919af3cf";
const report: Record<string, unknown> = {
  frontendSha: "48a0bf5b063b641e4055d24a6d236b5f0da31b82",
  backendSha: "3e5e5ccf086517a84725625939d1e31db67c3f1d",
  startedAt: new Date().toISOString(),
  tests: {},
  result: "BLOCKED",
};
const results = report.tests as Record<string, string>;
let phase = "configuration";
function check(value: unknown, code: string): asserts value {
  if (!value) throw new Error(code);
}
function event(socket: Socket, name: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(name, done);
      reject(new Error("event_timeout"));
    }, 10000);
    function done(value: unknown) {
      clearTimeout(timer);
      socket.off(name, done);
      resolve(value);
    }
    socket.on(name, done);
  });
}
async function connect(token: string, guest = false): Promise<Socket> {
  const socket = io(`${API}/webrtc`, {
    autoConnect: false,
    transports: ["websocket"],
    reconnection: false,
    forceNew: true,
    timeout: 10000,
    auth: guest ? { token, channel: "guest" } : { token },
    extraHeaders: { Origin: APP },
  });
  const ready = event(socket, "connect");
  socket.connect();
  try {
    await ready;
  } catch {
    socket.disconnect();
    throw new Error("connect_failed");
  }
  return socket;
}

async function main() {
  check(process.env.E2E_BASE_URL === APP, "qa_origin");
  check(
    process.env.E2E_DOCTOR_EMAIL === "rc18.doctor@heydoctor.invalid",
    "synthetic_doctor",
  );
  const target = process.env.E2E_CONSULTATION_HTA;
  check(
    target && /^[a-f0-9-]{36}$/.test(target) && target !== GUEST_CONSULTATION,
    "distinct_room",
  );
  const browser = await chromium.launch();
  const context = await browser.newContext(); // No tracing, recordings, storage state or credentials on disk.
  const page = await context.newPage();
  const authHttp: { path: string; status: number }[] = [];
  report.authHttp = authHttp;
  page.on("response", (r) => {
    const path = new URL(r.url()).pathname;
    if (/\/(?:hd-api|api)\/auth\/(?:csrf|login|me)$/.test(path)) {
      authHttp.push({ path, status: r.status() });
    }
  });
  let member: Socket | undefined;
  let outsider: Socket | undefined;
  try {
    phase = "synthetic_login";
    const loginResponse = page.waitForResponse(
      (r) =>
        /\/auth\/login$/.test(new URL(r.url()).pathname) &&
        r.request().method() === "POST",
      { timeout: 45000 },
    );
    await loginAsDoctor(page);
    phase = "login_http";
    const response = await loginResponse;
    check(response.status() === 200, "login_http");
    const login = await response.json();
    phase = "login_payload";
    const token = login.access_token;
    check(
      typeof token === "string" &&
        token.length > 30 &&
        login.kind !== "mfa_pending",
      "legitimate_session",
    );
    const read = async (path: string, authenticated = true) => {
      const r = await fetch(`${API}/api${path}`, {
        method: "GET",
        redirect: "error",
        headers: {
          Origin: APP,
          ...(authenticated ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: AbortSignal.timeout(15000),
      });
      check(r.ok, "read_denied");
      return r.json();
    };
    phase = "identity";
    const me = await read("/auth/me");
    const identity = me.user ?? me;
    check(
      (identity.id ?? identity.sub) === DOCTOR &&
        identity.email === process.env.E2E_DOCTOR_EMAIL &&
        identity.role === "doctor" &&
        identity.clinicId === CLINIC,
      "identity_mismatch",
    );
    results.synthetic_identity = "PASS";
    phase = "existing_guest_fixture";
    const list = await read(
      "/appointments?from=2026-11-23T00%3A00%3A00.000Z&to=2026-11-30T00%3A00%3A00.000Z&limit=50",
    );
    check(Array.isArray(list.data), "appointment_contract");
    const fixtures = list.data.filter(
      (a: Record<string, unknown>) => a.consultationId === GUEST_CONSULTATION,
    );
    check(fixtures.length === 1, "guest_fixture_unique");
    const appointment = fixtures[0];
    check(
      appointment.clinicId === CLINIC &&
        appointment.doctorId === DOCTOR &&
        appointment.status === "confirmed" &&
        appointment.paymentStatus === "not_required" &&
        appointment.reminderSummary?.telemedicineChannel ===
          "physician_direct" &&
        appointment.reminderSummary?.channel !== "public" &&
        appointment.consultationId === GUEST_CONSULTATION &&
        typeof appointment.telemedicineAccessToken === "string" &&
        Date.parse(appointment.telemedicineAccessTokenExpiresAt) > Date.now(),
      "guest_fixture_eligibility",
    );
    // This official GET mints only a scoped JWT. Existing consultationId prevents creation/linking.
    const prepared = await read(
      `/public/bookings/${appointment.telemedicineAccessToken}/telemedicine`,
      false,
    );
    check(
      prepared.consultationId === GUEST_CONSULTATION &&
        typeof prepared.signalingToken === "string",
      "guest_scope",
    );
    const payload = JSON.parse(
      Buffer.from(
        prepared.signalingToken.split(".")[1],
        "base64url",
      ).toString(),
    );
    check(
      payload.sub !== DOCTOR &&
        payload.sub === `guest:${appointment.id}` &&
        payload.consultationId === GUEST_CONSULTATION &&
        payload.clinicId === CLINIC,
      "distinct_guest_identity",
    );
    results.existing_scoped_guest = "PASS";
    phase = "member_join";
    member = await connect(token);
    // A normal authenticated HTTP round trip precedes signaling; no readiness sleep or join retry.
    await read("/auth/me");
    const initialState = event(member, "room-state");
    const ack = await member
      .timeout(10000)
      .emitWithAck("join-consultation", { consultationId: target });
    const initial = (await initialState) as {
      consultationId: string;
      peerCount: number;
    };
    check(
      ack?.ok && initial.consultationId === target && initial.peerCount === 1,
      "target_room_occupied_or_ineligible",
    );
    const seen: Record<string, number> = {};
    for (const name of [
      "peer-left",
      "peer-joined",
      "offer",
      "answer",
      "ice-candidate",
      "peer-ice-state",
    ]) {
      member.on(name, () => {
        seen[name] = (seen[name] ?? 0) + 1;
      });
    }
    outsider = await connect(prepared.signalingToken, true);
    await read("/auth/me");
    // The same member transport receives broadcasts before the subsequent room-state.
    // This FIFO barrier checks absence without sleeps or AV/media negotiation.
    async function barrier() {
      const statePromise = event(member!, "room-state");
      const a = await member!
        .timeout(10000)
        .emitWithAck("join-consultation", { consultationId: target });
      const state = (await statePromise) as { peerCount: number };
      check(
        a?.ok &&
          state.peerCount === 1 &&
          Object.values(seen).every((n) => n === 0),
        "outsider_affected_room",
      );
    }
    phase = "outsider_leave";
    for (let i = 0; i < 3; i++) {
      const a = await outsider
        .timeout(10000)
        .emitWithAck("leave", { consultationId: target });
      check(a?.ok === true, "leave_not_idempotent");
      await barrier();
    }
    results.outsider_leave_no_peer_left = "PASS";
    results.leave_idempotency_three_operations = "PASS";
    phase = "outsider_relay";
    for (const name of ["offer", "answer", "ice-candidate"]) {
      const denied = event(outsider, "exception");
      outsider.emit(name, {
        consultationId: target,
        sdp: { type: "qa-denied" },
        candidate: { candidate: "qa-denied" },
      });
      const rejection = (await denied) as { message?: string };
      check(
        rejection.message === "Join the consultation room first",
        "relay_not_membership_denied",
      );
      await barrier();
      results[`outsider_${name}_denied`] = "PASS";
    }
    phase = "cross_patient_join";
    const deniedJoin = event(outsider, "exception");
    outsider.emit("join-consultation", { consultationId: target });
    const rejection = (await deniedJoin) as { message?: string };
    check(
      typeof rejection.message === "string" &&
        !/Unauthorized|PRO plan/.test(rejection.message),
      "guest_scope_denial_missing",
    );
    await barrier();
    results.guest_other_consultation_join_denied = "PASS";
    phase = "invalid_identifier";
    const invalid = event(outsider, "exception");
    outsider.emit("leave", { consultationId: "invalid-qa-identifier" });
    check(
      ((await invalid) as { message?: string }).message ===
        "Invalid consultationId",
      "invalid_identifier_accepted",
    );
    await barrier();
    results.invalid_identifier_denied = "PASS";
    report.observedUnsolicitedEvents = seen;
    // Compare the existing appointment reference and version: no clinical write during this probe.
    phase = "fixture_unchanged";
    const after = await read(`/appointments/${appointment.id}`);
    check(
      after.consultationId === appointment.consultationId &&
        after.version === appointment.version &&
        after.status === appointment.status &&
        after.paymentStatus === appointment.paymentStatus,
      "fixture_changed",
    );
    results.existing_appointment_unchanged = "PASS";
    report.result = "PASS";
  } finally {
    report.finalPagePath = new URL(page.url()).pathname;
    outsider?.disconnect();
    member?.disconnect();
    await context.close();
    await browser.close();
  }
}

main()
  .catch((error: unknown) => {
    report.result = "BLOCKED";
    report.blockedPhase = phase;
    const message = error instanceof Error ? error.message : "";
    report.reason = /^[a-z_]+$/.test(message)
      ? message
      : message.includes("Navegación del panel")
        ? "staff_navigation_not_visible"
        : message.includes("toHaveURL")
          ? "staff_navigation_url"
          : "unclassified_sanitized_error";
    process.exitCode = 1;
  })
  .finally(() => {
    report.finishedAt = new Date().toISOString();
    writeFileSync(
      "pre23-runtime-room-result.json",
      JSON.stringify(report, null, 2),
    );
    console.log(JSON.stringify(report));
  });
