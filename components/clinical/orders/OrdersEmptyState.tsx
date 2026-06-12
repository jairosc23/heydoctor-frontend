"use client";

export function OrdersEmptyState({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel: string;
  onAction?: () => void;
}) {
  return (
    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center">
      <p className="text-sm text-slate-500">{message}</p>
      {onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
