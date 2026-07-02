import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  tagline?: string;
  className?: string;
  variant?: "enterprise" | "landing" | "nav";
};

export function BrandWordmark({
  tagline,
  className = "",
  variant = "enterprise",
}: BrandWordmarkProps) {
  if (variant === "nav") {
    return (
      <span
        className={cn("text-lg font-semibold text-primaryMid", className)}
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        HeyDoctor
      </span>
    );
  }

  if (variant === "landing") {
    return (
      <div className={className}>
        <p
          className="text-2xl font-bold tracking-tight text-primaryMid sm:text-3xl"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          HeyDoctor
        </p>
        {tagline ? (
          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-600">{tagline}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <p className="text-sm font-bold uppercase tracking-[0.24em] text-indigo-200 sm:text-base sm:tracking-[0.28em]">
        HeyDoctor Enterprise
      </p>
      {tagline ? (
        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">{tagline}</p>
      ) : null}
    </div>
  );
}
