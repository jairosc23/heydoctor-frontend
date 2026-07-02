import { BrandWordmark } from "./BrandWordmark";

type BrandLogoProps = {
  tagline?: string;
  className?: string;
};

export function BrandLogo({ tagline, className = "" }: BrandLogoProps) {
  // Integration point: replace this fallback with the official master SVG once it
  // exists in the repository. Do not recreate or approximate the Hey! stethoscope.
  return <BrandWordmark tagline={tagline} className={className} />;
}
