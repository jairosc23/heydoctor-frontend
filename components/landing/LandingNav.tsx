import { getBrandMarkSrc } from "@/lib/brand-mark.server";
import { LandingNavClient } from "./LandingNavClient";

export function LandingNav() {
  const brandMarkSrc = getBrandMarkSrc();
  return <LandingNavClient brandMarkSrc={brandMarkSrc} />;
}
