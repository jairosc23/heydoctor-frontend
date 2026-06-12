"use client";

import { cn } from "@/lib/utils";
import type { OrdersSubTab } from "../OrdersTab";

const QUICK_ACTIONS: {
  id: OrdersSubTab;
  label: string;
  icon: string;
}[] = [
  { id: "prescriptions", label: "Receta", icon: "💊" },
  { id: "lab", label: "Laboratorio", icon: "🧪" },
  { id: "referrals", label: "Interconsulta", icon: "🔄" },
  { id: "invoices", label: "Factura", icon: "📄" },
];

export function OrdersQuickActions({
  activeSubTab,
  onSelect,
}: {
  activeSubTab: OrdersSubTab;
  onSelect: (tab: OrdersSubTab) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {QUICK_ACTIONS.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => onSelect(action.id)}
          className={cn(
            "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
            activeSubTab === action.id
              ? "border-primary/30 bg-primaryLight text-primary"
              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
          )}
        >
          <span aria-hidden>{action.icon}</span>
          {action.label}
        </button>
      ))}
    </div>
  );
}
