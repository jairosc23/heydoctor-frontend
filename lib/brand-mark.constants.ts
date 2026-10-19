/** Public path to the official master icon (drop-in when design provides the file). */
export const BRAND_ICON_SVG = "/brand/heydoctor-icon.svg";

/** Safe PNG fallback while the master SVG is not in the repository. */
export const BRAND_ICON_PNG = "/logo-heydoctor.png";

export function isBrandMarkSvg(src: string): boolean {
  return src === BRAND_ICON_SVG || src.endsWith(".svg");
}
