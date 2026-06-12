"use client";

import {
  getOrderStatusPresentation,
  type OrderDisplayStatus,
} from "@/lib/orders-command-center";
import { cn } from "@/lib/utils";

export function OrderStatusChip({
  status,
  className,
}: {
  status: OrderDisplayStatus;
  className?: string;
}) {
  const presentation = getOrderStatusPresentation(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600",
        className,
      )}
    >
      <span aria-hidden>{presentation.dot}</span>
      {presentation.label}
    </span>
  );
}
