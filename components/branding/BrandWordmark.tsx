type BrandWordmarkProps = {
  tagline?: string;
  className?: string;
};

export function BrandWordmark({ tagline, className = "" }: BrandWordmarkProps) {
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
