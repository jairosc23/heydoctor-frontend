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
        "rounded-2xl bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium",
        className,
      )}
    >
      {children}
    </div>
  );
}
