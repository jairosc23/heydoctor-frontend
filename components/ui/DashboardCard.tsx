import { cn } from "@/lib/utils";

export default function DashboardCard({
  title,
  value,
  className,
  accentColor,
}: {
  title: string;
  value: React.ReactNode;
  className?: string;
  /** Borde izquierdo (hex), p. ej. métricas con código de color */
  accentColor?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-100 bg-white p-6 shadow-soft transition-all duration-200 hover:shadow-premium",
        accentColor != null && "border-l-4",
        className,
      )}
      style={accentColor ? { borderLeftColor: accentColor } : undefined}
    >
      <p className="text-sm text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold text-primary">{value}</h2>
    </div>
  );
}
