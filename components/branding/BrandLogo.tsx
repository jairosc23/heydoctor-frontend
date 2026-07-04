"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { isBrandMarkSvg } from "@/lib/brand-mark.constants";
import { useBrandMarkSrc } from "./BrandMarkProvider";
import { BrandWordmark } from "./BrandWordmark";

type BrandLogoProps = {
  tagline?: string;
  className?: string;
  variant?: "enterprise" | "landing" | "nav" | "footer";
  priority?: boolean;
  markOnly?: boolean;
  markSize?: number;
};

const VARIANT_MARK_SIZE = {
  nav: 36,
  footer: 44,
  landing: 52,
} as const;

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
  markOnly = false,
  markSize,
}: BrandLogoProps) {
  const markSrc = useBrandMarkSrc();
  const resolvedMarkSize =
    markSize ?? VARIANT_MARK_SIZE[variant as keyof typeof VARIANT_MARK_SIZE] ?? 52;

  if (markOnly) {
    return (
      <div className={className}>
        <BrandMark src={markSrc} size={resolvedMarkSize} priority={priority} />
      </div>
    );
  }

  if (variant === "nav") {
    return (
      <div className={cn("flex min-w-0 items-center gap-2", className)}>
        <BrandMark src={markSrc} size={resolvedMarkSize} priority={priority} />
        <BrandWordmark variant="nav" />
      </div>
    );
  }

  if (variant === "footer") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <BrandMark
          src={markSrc}
          size={resolvedMarkSize}
          priority={priority}
        />
        <BrandWordmark
          variant="footer"
          tagline={tagline}
        />
      </div>
    );
  }

  if (variant === "landing") {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <BrandMark src={markSrc} size={resolvedMarkSize} priority={priority} />
        <BrandWordmark variant="landing" tagline={tagline} />
      </div>
    );
  }

  return <BrandWordmark tagline={tagline} className={className} />;
}
