import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  tagline?: string;
  className?: string;
  variant?: "enterprise" | "landing" | "nav" | "footer";
};

export function BrandWordmark({
  tagline,
  className = "",
  variant = "enterprise",
}: BrandWordmarkProps) {
  if (variant === "footer") {
    return (
      <div className={className}>
        <p
          className="text-[22px] font-bold tracking-tight text-white"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          HeyDoctor
        </p>
        {tagline ? (
          <p className="mt-1 max-w-sm text-sm leading-6 text-slate-300">{tagline}</p>
        ) : null}
      </div>
    );
  }

  if (variant === "nav") {
    return (
      <span
        className={cn(
          "inline-flex items-baseline text-[18px] leading-none text-primaryDark",
          className,
        )}
        style={{ fontFamily: "Montserrat, sans-serif" }}
      >
        <span className="font-bold">Hey</span>
        <span className="font-normal">Doctor</span>
      </span>
    );
  }

  if (variant === "landing") {
    return (
      <div className={className}>
        <p
          className="text-2xl font-bold tracking-tight text-primaryDark sm:text-[1.75rem]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          HeyDoctor
        </p>
        {tagline ? (
          <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">{tagline}</p>
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
