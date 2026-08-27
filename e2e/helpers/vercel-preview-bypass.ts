import type { BrowserContext } from "@playwright/test";

/**
 * Scope Vercel Deployment Protection bypass headers to the Preview origin.
 *
 * Playwright `extraHTTPHeaders` attach to every request in the context,
 * including cross-origin fetches to pro-api.heydoctor.health, which fails CORS
 * preflight. Route interception adds the headers only when the request origin
 * matches E2E_BASE_URL.
 */
export async function attachVercelPreviewBypass(
  context: BrowserContext,
): Promise<void> {
  const secret = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  const base = process.env.E2E_BASE_URL?.trim();
  if (!secret || !base) return;

  let previewOrigin: string;
  try {
    previewOrigin = new URL(base).origin;
  } catch {
    return;
  }

  await context.route("**/*", async (route) => {
    const url = route.request().url();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      await route.continue();
      return;
    }

    let origin: string;
    try {
      origin = new URL(url).origin;
    } catch {
      await route.continue();
      return;
    }

    if (origin !== previewOrigin) {
      await route.continue();
      return;
    }

    await route.continue({
      headers: {
        ...route.request().headers(),
        "x-vercel-protection-bypass": secret,
        "x-vercel-set-bypass-cookie": "true",
      },
    });
  });
}
