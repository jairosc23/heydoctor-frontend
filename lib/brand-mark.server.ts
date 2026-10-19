import fs from "node:fs";
import path from "node:path";
import {
  BRAND_ICON_PNG,
  BRAND_ICON_SVG,
} from "@/lib/brand-mark.constants";

const SVG_ON_DISK = path.join(process.cwd(), "public", "brand", "heydoctor-icon.svg");

/**
 * Resolves the brand mark source at build/render time (server only).
 * Uses the official SVG only when the file exists on disk.
 */
export function getBrandMarkSrc(): typeof BRAND_ICON_SVG | typeof BRAND_ICON_PNG {
  try {
    if (fs.existsSync(SVG_ON_DISK)) {
      return BRAND_ICON_SVG;
    }
  } catch {
    // Non-Node runtimes: fall back to PNG.
  }
  return BRAND_ICON_PNG;
}
