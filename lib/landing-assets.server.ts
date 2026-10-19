import fs from "node:fs";
import path from "node:path";
import {
  LANDING_HERO_DOCTOR_FALLBACK,
  LANDING_HERO_DOCTOR_OFFICIAL_BASENAME,
  LANDING_PATIENT_PIP_OFFICIAL_BASENAME,
} from "@/lib/landing-assets.constants";

const BRAND_DIR = path.join(process.cwd(), "public", "brand");
const ASSET_EXTENSIONS = [".jpg", ".jpeg", ".webp", ".png"] as const;

export type LandingHeroAssets = {
  doctorImageSrc: string;
  patientPipSrc: string | null;
};

function resolveBrandAsset(basename: string): string | null {
  for (const extension of ASSET_EXTENSIONS) {
    const filePath = path.join(BRAND_DIR, `${basename}${extension}`);
    try {
      if (fs.existsSync(filePath)) {
        return `/brand/${basename}${extension}`;
      }
    } catch {
      // Non-Node runtimes: keep fallback behavior.
    }
  }
  return null;
}

/**
 * Resolves landing hero assets at build/render time (server only).
 * Official files live in `public/brand/`; missing assets use safe fallbacks.
 */
export function getLandingHeroAssets(): LandingHeroAssets {
  const doctorImageSrc =
    resolveBrandAsset(LANDING_HERO_DOCTOR_OFFICIAL_BASENAME) ??
    LANDING_HERO_DOCTOR_FALLBACK;

  const patientPipSrc = resolveBrandAsset(LANDING_PATIENT_PIP_OFFICIAL_BASENAME);

  return { doctorImageSrc, patientPipSrc };
}
