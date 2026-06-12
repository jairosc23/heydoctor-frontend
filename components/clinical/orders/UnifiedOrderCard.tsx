"use client";

import type { ReactNode } from "react";
import {
  formatOrderUpdatedAt,
  type OrderDisplayStatus,
} from "@/lib/orders-command-center";
import { orderPriorityAccentClass } from "@/lib/clinical-status-language";
import { cn } from "@/lib/utils";
import { OrderStatusChip } from "./OrderStatusChip";

export function UnifiedOrderCard({
  kind,
  title,
  status,
  updatedAt,
  actions,
}: {
  kind: string;
  title: string;
  status: OrderDisplayStatus;
  updatedAt?: string | null;
  actions: ReactNode;
}) {
  const isPriority =
    status === "pending" || status === "active" || status === "unexecuted";

  return (
    <article
      className={cn(
        "clinical-order-card clinical-interactive rounded-hd-md border border-hd-border-subtle border-l-[3px] bg-hd-surface-raised px-hd-3 py-hd-3 shadow-hd-1 transition-all duration-hd-base hover:shadow-hd-2",
        orderPriorityAccentClass(status),
        isPriority && "ring-1 ring-black/[0.03]",
      )}
    >
      <header className="mb-hd-3 space-y-hd-2">
        <div className="flex min-h-[1.375rem] items-center justify-between gap-hd-2">
          <p className="min-w-0 flex-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {kind}
          </p>
          <OrderStatusChip status={status} priority={isPriority} />
        </div>
        <p
          className={cn(
            "leading-snug text-slate-900",
            isPriority ? "text-sm font-semibold" : "text-sm font-medium",
          )}
        >
          {title}
        </p>
      </header>
      <div className="flex flex-wrap items-center justify-between gap-hd-2 border-t border-hd-border-subtle pt-hd-2">
        <p className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-600">Última actualización:</span>{" "}
          {formatOrderUpdatedAt(updatedAt)}
        </p>
        <div className="flex flex-wrap items-center gap-hd-2 text-xs">{actions}</div>
      </div>
    </article>
  );
}
