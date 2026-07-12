/**
 * RC-2 — E2E hardening: Kill Switch, Session Ownership, Auth Recovery.
 *
 * Uses Playwright route mocks so it can run without live backend credentials.
 * Injects a non-verified JWT cookie so Edge middleware allows /panel access
 * (middleware only checks exp, not signature) and mocks auth bootstrap so
 * PanelLayout does not redirect to /login.
 */
import { test, expect } from "@playwright/test";
import {
  MEDICAL_COPILOT_API_VERSION,
  MEDICAL_COPILOT_GOVERNANCE,
} from "../lib/medical-copilot/types";

const CONSULTATION_ID = "e2e-rc2-consultation";
const PATIENT_ID = "e2e-rc2-patient";
const SESSION_ID = "e2e-rc2-session-owned";

function fakeSessionJwt(ttlSeconds = 60 * 60): string {
  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  return `${encode({ alg: "none", typ: "JWT" })}.${encode({
    sub: "e2e-rc2",
    exp,
  })}.e2e`;
}

async function injectPanelSessionCookie(
  page: import("@playwright/test").Page,
): Promise<void> {
  const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";
  await page.context().addCookies([
    {
      name: "heydoctor_session",
      value: fakeSessionJwt(),
      url: baseURL,
    },
  ]);
}

/** Keep PanelLayout authenticated without real Nest credentials. */
async function mockAuthBootstrap(page: import("@playwright/test").Page) {
  const accessToken = fakeSessionJwt();

  await page.route("**/auth/refresh", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        ok: true,
        access_token: accessToken,
        csrfToken: "e2e-csrf-token-ok",
      }),
    });
  });

  await page.route("**/auth/me**", async (route) => {
    if (route.request().method() !== "GET") {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "e2e-doctor-1",
        email: "e2e-rc2@heydoctor.health",
        role: "doctor",
        clinicId: "e2e-clinic",
        plan: "pro",
      }),
    });
  });

  await page.route("**/auth/csrf**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ csrfToken: "e2e-csrf-token-ok" }),
    });
  });

  // Prevent bootstrap failure from wiping the Edge cookie mid-test.
  await page.route("**/api/auth/session", async (route) => {
    const method = route.request().method();
    if (method === "DELETE" || method === "POST") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true }),
      });
      return;
    }
    await route.continue();
  });
}

function facadeEnvelope<T>(data: T) {
  return {
    source: "medical_copilot_facade",
    apiVersion: MEDICAL_COPILOT_API_VERSION,
    status: "ok",
    data,
    governance: { ...MEDICAL_COPILOT_GOVERNANCE },
    reason: null,
    generatedAt: new Date().toISOString(),
  };
}

async function mockConsultationApis(page: import("@playwright/test").Page) {
  await mockAuthBootstrap(page);

  await page.route(`**/consultations/${CONSULTATION_ID}**`, async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: CONSULTATION_ID,
          patientId: PATIENT_ID,
          status: "in_progress",
        }),
      });
      return;
    }
    await route.continue();
  });

  await page.route("**/medical-copilot/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (
      method === "POST" &&
      url.includes("/medical-copilot/session") &&
      !url.includes("/session/")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          facadeEnvelope({
            session: {
              sessionId: SESSION_ID,
              consultationId: CONSULTATION_ID,
              patientId: PATIENT_ID,
            },
            workspace: { workspaceId: "ws", sessionId: SESSION_ID },
            memory: { memoryId: "mem", sessionId: SESSION_ID },
            timeline: { timelineId: "tl", sessionId: SESSION_ID },
          }),
        ),
      });
      return;
    }

    if (url.includes(`/session/${SESSION_ID}`) && method === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          facadeEnvelope({
            session: {
              sessionId: SESSION_ID,
              consultationId: CONSULTATION_ID,
              patientId: PATIENT_ID,
            },
          }),
        ),
      });
      return;
    }

    if (
      url.includes("/workspace") ||
      url.includes("/timeline") ||
      url.includes("/memory") ||
      url.includes("/actions")
    ) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          facadeEnvelope(
            url.includes("/actions")
              ? { actions: [] }
              : url.includes("/workspace")
                ? { workspace: { workspaceId: "ws", sessionId: SESSION_ID } }
                : url.includes("/timeline")
                  ? {
                      timeline: {
                        timelineId: "tl",
                        sessionId: SESSION_ID,
                        entries: [],
                      },
                    }
                  : {
                      memory: {
                        memoryId: "mem",
                        sessionId: SESSION_ID,
                        entries: [],
                      },
                    },
          ),
        ),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(facadeEnvelope({})),
    });
  });
}

test.describe("RC-2 Medical Copilot hardening", () => {
  test.beforeEach(async ({ page }) => {
    await injectPanelSessionCookie(page);
  });

  test("P0-1 Kill Switch deshabilita Copilot y preserva enlace a consulta", async ({
    page,
  }) => {
    await mockConsultationApis(page);
    await page.addInitScript(() => {
      window.localStorage.setItem("hd_mc_kill_switch", "1");
    });

    await page.goto(`/panel/consultas/${CONSULTATION_ID}/medical-copilot`);

    await expect(page.getByTestId("medical-copilot-kill-switch")).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByTestId("medical-copilot-active-shell")).toHaveCount(
      0,
    );
    await expect(
      page.getByRole("link", { name: /consulta clínica/i }),
    ).toBeVisible();
  });

  test("P0-2 Session Ownership restaura la misma sessionId", async ({
    page,
  }) => {
    await mockConsultationApis(page);
    await page.addInitScript(
      ({ consultationId, sessionId }) => {
        window.localStorage.removeItem("hd_mc_kill_switch");
        window.sessionStorage.setItem(
          "hd_mc_session_ownership_v1",
          JSON.stringify({
            [consultationId]: {
              consultationId,
              sessionId,
              updatedAt: new Date().toISOString(),
            },
          }),
        );
      },
      { consultationId: CONSULTATION_ID, sessionId: SESSION_ID },
    );

    let createSessionPosts = 0;
    page.on("request", (req) => {
      if (
        req.method() === "POST" &&
        req.url().includes("/medical-copilot/session") &&
        !req.url().includes(`/session/${SESSION_ID}`)
      ) {
        createSessionPosts += 1;
      }
    });

    await page.goto(`/panel/consultas/${CONSULTATION_ID}/medical-copilot`);
    await expect(page.getByTestId("medical-copilot-active-shell")).toBeVisible({
      timeout: 30_000,
    });

    expect(createSessionPosts).toBe(0);
  });

  test("P0-3 Auth Recovery conserva ownership y no ejecuta acciones clínicas", async ({
    page,
  }) => {
    let phase: "unauthorized" | "ok" = "unauthorized";

    await mockAuthBootstrap(page);

    await page.route(`**/consultations/${CONSULTATION_ID}**`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: CONSULTATION_ID,
          patientId: PATIENT_ID,
          status: "in_progress",
        }),
      });
    });

    await page.route("**/medical-copilot/**", async (route) => {
      const url = route.request().url();
      if (phase === "unauthorized") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ message: "unauthorized jwt expired" }),
        });
        return;
      }
      if (url.includes(`/session/${SESSION_ID}`)) {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(
            facadeEnvelope({
              session: {
                sessionId: SESSION_ID,
                consultationId: CONSULTATION_ID,
                patientId: PATIENT_ID,
              },
            }),
          ),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          facadeEnvelope({
            workspace: { workspaceId: "ws", sessionId: SESSION_ID },
            timeline: {
              timelineId: "tl",
              sessionId: SESSION_ID,
              entries: [],
            },
            memory: { memoryId: "mem", sessionId: SESSION_ID, entries: [] },
            actions: [],
          }),
        ),
      });
    });

    await page.addInitScript(
      ({ consultationId, sessionId }) => {
        window.localStorage.removeItem("hd_mc_kill_switch");
        window.sessionStorage.setItem(
          "hd_mc_session_ownership_v1",
          JSON.stringify({
            [consultationId]: {
              consultationId,
              sessionId,
              updatedAt: new Date().toISOString(),
            },
          }),
        );
      },
      { consultationId: CONSULTATION_ID, sessionId: SESSION_ID },
    );

    await page.goto(`/panel/consultas/${CONSULTATION_ID}/medical-copilot`);

    const owned = await page.evaluate(() =>
      window.sessionStorage.getItem("hd_mc_session_ownership_v1"),
    );
    expect(owned).toContain(SESSION_ID);

    phase = "ok";
    await injectPanelSessionCookie(page);
    await page.reload();
    await expect(page.getByTestId("medical-copilot-active-shell")).toBeVisible({
      timeout: 30_000,
    });

    const ownedAfter = await page.evaluate(() =>
      window.sessionStorage.getItem("hd_mc_session_ownership_v1"),
    );
    expect(ownedAfter).toContain(SESSION_ID);

    await expect(page.getByRole("button", { name: /aprobar/i })).toHaveCount(0);
  });
});
