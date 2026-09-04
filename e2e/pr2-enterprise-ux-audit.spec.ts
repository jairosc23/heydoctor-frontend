import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import path from "node:path";

const OUT_DIR = path.join(process.cwd(), "visual-audit", "pr2");

const PUBLIC_ROUTES = [
  { name: "catalog", path: "/qa/pr2-ux" },
  { name: "landing", path: "/" },
  { name: "login", path: "/login" },
  { name: "register", path: "/register" },
  { name: "pricing", path: "/pricing" },
  { name: "privacy", path: "/privacy" },
  { name: "consultar", path: "/consultar" },
  { name: "medicos", path: "/medicos" },
] as const;

function viewportName(width: number): "desktop" | "tablet" | "mobile" {
  if (width >= 1280) return "desktop";
  if (width >= 700) return "tablet";
  return "mobile";
}

async function shot(page: Page, name: string) {
  const size = page.viewportSize();
  const vp = viewportName(size?.width ?? 1440);
  mkdirSync(OUT_DIR, { recursive: true });
  const dest = path.join(OUT_DIR, `${vp}-${name}.png`);
  try {
    await page.evaluate(
      () =>
        Promise.race([
          document.fonts.ready,
          new Promise<void>((resolve) => {
            setTimeout(resolve, 2500);
          }),
        ]),
    );
  } catch {
    /* navigation can abort fonts.ready */
  }
  try {
    await page.screenshot({
      path: dest,
      fullPage: true,
      animations: "disabled",
      timeout: 8_000,
    });
  } catch {
    await page.screenshot({
      path: dest,
      fullPage: false,
      animations: "disabled",
      timeout: 8_000,
    });
  }
}

test.describe("PR2 Enterprise UX visual audit", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem("heydoctor_cookie_consent", "accepted");
    });
  });

  for (const route of PUBLIC_ROUTES) {
    test(`captura ${route.name}`, async ({ page }) => {
      await page.goto(route.path, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(250);
      await shot(page, route.name);
    });
  }

  test("catálogo HD: landmarks, skip y teclado", async ({ page }) => {
    await page.goto("/qa/pr2-ux", { waitUntil: "domcontentloaded" });

    await expect(page.getByTestId("pr2-ux-catalog")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Catálogo Design System HD",
    );
    await expect(
      page.getByTestId("pr2-ux-catalog").locator("main#contenido-principal"),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Saltar al contenido" }),
    ).toHaveAttribute("href", "#contenido-principal");
    await expect(page.getByTestId("pr2-skeleton")).toHaveAttribute(
      "role",
      "status",
    );
    await expect(
      page.getByRole("alert").filter({ hasText: "No se pudo cargar" }),
    ).toBeVisible();
    await expect(page.getByText("Sin resultados")).toBeVisible();

    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Saltar al contenido" }),
    ).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(
      page.getByTestId("pr2-ux-catalog").locator("main#contenido-principal"),
    ).toBeFocused();

    const size = page.viewportSize();
    await shot(page, `catalog-focus-${viewportName(size?.width ?? 1440)}`);
  });

  test("login: heading y skip al formulario", async ({ page }) => {
    await page.goto("/login", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Acceso HeyDoctor" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Saltar al formulario" }),
    ).toHaveAttribute("href", "#login-form");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Saltar al formulario" }),
    ).toBeFocused();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña")).toBeVisible();
  });

  test("register: labels persistentes", async ({ page }) => {
    await page.goto("/register", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { name: "Crear Cuenta" }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirmar contraseña")).toBeVisible();
  });

  test("legal: skip y aria-current", async ({ page }) => {
    await page.goto("/privacy", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("legal-main").first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacidad" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
