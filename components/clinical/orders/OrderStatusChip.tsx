"use client";

import { ClinicalStatusBadge } from "@/components/clinical/design";
import {
  getOrderStatusPresentation,
  type OrderDisplayStatus,
} from "@/lib/orders-command-center";
import { orderStatusToClinical } from "@/lib/clinical-status-language";
import { cn } from "@/lib/utils";

export function OrderStatusChip({
  status,
  className,
  priority = false,
}: {
  status: OrderDisplayStatus;
  className?: string;
  priority?: boolean;
}) {
  const presentation = getOrderStatusPresentation(status);

  return (
    <ClinicalStatusBadge
      status={orderStatusToClinical(status)}
      label={presentation.label}
      className={cn(
        priority && "ring-1 ring-inset ring-black/5 shadow-hd-1",
        className,
      )}
    />
  );
}
