"use client";

import type { ReactNode } from "react";
import {
  formatOrderUpdatedAt,
  type OrderDisplayStatus,
} from "@/lib/orders-command-center";
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
  return (
    <article className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
      <div className="mb-1 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {kind}
          </p>
          <p className="text-sm font-medium leading-snug text-slate-900">
            {title}
          </p>
        </div>
        <OrderStatusChip status={status} className="shrink-0" />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2">
        <p className="text-[10px] text-slate-500">
          <span className="font-medium text-slate-600">Última actualización:</span>{" "}
          {formatOrderUpdatedAt(updatedAt)}
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs">{actions}</div>
      </div>
    </article>
  );
}
