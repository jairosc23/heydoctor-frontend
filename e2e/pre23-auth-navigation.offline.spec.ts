import { createServer, type Server } from "node:http";
import { test, expect } from "@playwright/test";
import { loginAsDoctor } from "./helpers/auth";

let server: Server;
let origin: string;
let destination = "/dashboard";
let logins = 0;

test.beforeAll(async () => {
  // Local HTTP only; no app/QA/provider credentials or external service.
  server = createServer((req, res) => {
    if (req.url === "/login") {
      res.setHeader("Content-Type", "text/html");
      res.end(`<form><label>Correo<input name="email"></label><label>Contraseña<input type="password"></label><button>Ingresar</button></form>
        <script>document.querySelector('form').onsubmit=async(e)=>{e.preventDefault();await fetch('/api/auth/login',{method:'POST'});location.assign('/panel');}</script>`);
    } else if (req.url === "/api/auth/login" && req.method === "POST") {
      logins++;
      res.setHeader("Set-Cookie", "offline_session=synthetic; HttpOnly; SameSite=Lax");
      res.end("{}");
    } else if (req.url === "/panel") {
      res.writeHead(302, { Location: destination });
      res.end();
    } else if (req.url === destination) {
      if (!req.headers.cookie?.includes("offline_session=synthetic")) {
        res.writeHead(302, { Location: "/login" }); res.end(); return;
      }
      res.setHeader("Content-Type", "text/html");
      // A nonessential pending resource must not block authenticated UI readiness.
      res.end('<nav aria-label="Navegación del panel">Agenda</nav><img src="/pending-resource">');
    } else if (req.url === "/pending-resource") {
      // Intentionally stays pending until the browser/context closes.
      // DOM and authenticated navigation are already usable.
      return;
    } else { res.writeHead(404); res.end(); }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Local test server unavailable");
  origin = `http://127.0.0.1:${address.port}`;
  process.env.E2E_BASE_URL = origin;
  process.env.E2E_DOCTOR_EMAIL = "offline.synthetic@heydoctor.invalid";
  process.env.E2E_DOCTOR_PASSWORD = "OFFLINE_ONLY_NOT_A_CREDENTIAL";
});

test.afterAll(async () => {
  server.closeAllConnections();
  await new Promise<void>((resolve) => server.close(() => resolve()));
  delete process.env.E2E_BASE_URL;
  delete process.env.E2E_DOCTOR_EMAIL;
  delete process.env.E2E_DOCTOR_PASSWORD;
});

for (const finalPath of ["/dashboard", "/panel/consultas"]) {
  test(`AUTH-01 resolves authenticated redirect to ${finalPath} without document-load race`, async ({ page }) => {
    destination = finalPath;
    const before = logins;
    await page.route("**/*", async (route) => {
      if (new URL(route.request().url()).origin !== origin) throw new Error("External request forbidden");
      await route.continue();
    });
    await loginAsDoctor(page);
    await expect(page).toHaveURL(origin + finalPath);
    await expect(page.getByRole("navigation", { name: "Navegación del panel" })).toBeVisible();
    expect(logins - before).toBe(1);
  });
}
