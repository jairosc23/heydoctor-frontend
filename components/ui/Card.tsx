import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white p-6 shadow-soft transition-all duration-[180ms] ease hover:shadow-premium active:scale-[0.99]",
        className,
      )}
    >
      {children}
    </div>
  );
}
