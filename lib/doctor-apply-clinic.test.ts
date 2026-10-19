import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildDoctorApplyInvitePath,
  canSubmitDoctorApplication,
  nextUrlWithoutInvite,
  resolveDoctorApplyInviteToken,
  stripDoctorApplyInviteFromUrl,
} from "./doctor-apply-clinic";

const inviteA =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiZG9jdG9yX2FwcGxpY2F0aW9uIiwiY2xpbmljSWQiOiJjbGluaWMtYSJ9.signatureA";
const inviteB =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwdXJwb3NlIjoiZG9jdG9yX2FwcGxpY2F0aW9uIiwiY2xpbmljSWQiOiJjbGluaWMtYiJ9.signatureB";
const clinicA = "11111111-1111-4111-8111-111111111111";

describe("resolveDoctorApplyInviteToken", () => {
  it("reads invite A or B from the query and never treats raw clinicId as authority", () => {
    assert.equal(resolveDoctorApplyInviteToken(`?invite=${inviteA}`), inviteA);
    assert.equal(
      resolveDoctorApplyInviteToken(new URLSearchParams({ invite: inviteB })),
      inviteB,
    );
    assert.notEqual(
      resolveDoctorApplyInviteToken(`?invite=${inviteA}`),
      resolveDoctorApplyInviteToken(`?invite=${inviteB}`),
    );
    assert.equal(resolveDoctorApplyInviteToken(`?clinicId=${clinicA}`), null);
    assert.equal(resolveDoctorApplyInviteToken(`?clinicId=${inviteA}`), null);
  });

  it("blocks missing or invalid invite so the form cannot submit", () => {
    assert.equal(resolveDoctorApplyInviteToken(null), null);
    assert.equal(resolveDoctorApplyInviteToken(""), null);
    assert.equal(resolveDoctorApplyInviteToken("?foo=bar"), null);
    assert.equal(resolveDoctorApplyInviteToken("?invite="), null);
    assert.equal(resolveDoctorApplyInviteToken("?invite=not-a-jwt"), null);
    assert.equal(canSubmitDoctorApplication(null), false);
    assert.equal(canSubmitDoctorApplication(clinicA), false);
    assert.equal(canSubmitDoctorApplication(inviteA), true);
  });
});

describe("stripDoctorApplyInviteFromUrl", () => {
  it("removes invite from the URL via history.replaceState and does not persist it", () => {
    const replaced: string[] = [];
    const storage: string[] = [];
    const location = {
      href: `https://app.heydoctor.health/for-doctors/apply?invite=${inviteA}&utm=1`,
      pathname: "/for-doctors/apply",
      search: `?invite=${inviteA}&utm=1`,
      hash: "",
    };
    const previousWindow = globalThis.window;
    globalThis.window = {
      location,
      history: {
        state: { from: "test" },
        replaceState: (_state: unknown, _title: string, url: string) => {
          replaced.push(url);
          const next = new URL(url, "https://app.heydoctor.health");
          location.pathname = next.pathname;
          location.search = next.search;
          location.hash = next.hash;
          location.href = next.toString();
        },
      },
      localStorage: {
        setItem: (key: string) => storage.push(key),
      },
    } as unknown as Window & typeof globalThis;
    try {
      assert.equal(
        nextUrlWithoutInvite(location.href),
        "/for-doctors/apply?utm=1",
      );
      stripDoctorApplyInviteFromUrl();
      assert.deepEqual(replaced, ["/for-doctors/apply?utm=1"]);
      assert.equal(location.search.includes("invite"), false);
      assert.equal(location.search.includes(inviteA), false);
      assert.equal(storage.length, 0);
      assert.equal(
        buildDoctorApplyInvitePath(inviteA).startsWith("/for-doctors/apply?"),
        true,
      );
      assert.equal(
        buildDoctorApplyInvitePath(inviteA).includes("clinicId"),
        false,
      );
    } finally {
      globalThis.window = previousWindow;
    }
  });
});
