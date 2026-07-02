import Image from "next/image";
import { cn } from "@/lib/utils";
import { isBrandMarkSvg } from "@/lib/brand-mark.constants";
import { BrandWordmark } from "./BrandWordmark";
import { getBrandMarkSrc } from "@/lib/brand-mark.server";

type BrandLogoProps = {
  tagline?: string;
  className?: string;
  variant?: "enterprise" | "landing" | "nav";
  /** Prioritize LCP mark (hero / nav). */
  priority?: boolean;
};

function BrandMark({
  src,
  size = 52,
  priority = false,
  className,
}: {
  src: string;
  size?: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 justify-center leading-none", className)}
      style={{
        filter: "drop-shadow(0 10px 25px rgba(0, 150, 136, 0.2))",
      }}
      aria-hidden
    >
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        priority={priority}
        unoptimized={isBrandMarkSvg(src)}
        className="object-contain"
      />
    </span>
  );
}

export function BrandLogo({
  tagline,
  className = "",
  variant = "enterprise",
  priority = false,
}: BrandLogoProps) {
  const markSrc = getBrandMarkSrc();

  if (variant === "nav") {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <BrandMark src={markSrc} size={36} priority={priority} />
        <BrandWordmark variant="nav" />
      </div>
    );
  }

  if (variant === "landing") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <BrandMark src={markSrc} size={52} priority={priority} />
        <BrandWordmark variant="landing" tagline={tagline} />
      </div>
    );
  }

  return <BrandWordmark tagline={tagline} className={className} />;
}
