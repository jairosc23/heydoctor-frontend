"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { recordRc4LazyLoad, recordRc4Render } from "@/lib/medical-copilot/rc4-operational/performance-metrics";
import { recordRc5LazyHydration } from "@/lib/medical-copilot/rc5-operational/observability";

export type MedicalCopilotDeferredPanelProps = {
  title: string;
  children: ReactNode;
  /** Montar inmediatamente (paneles P0 / shell). */
  eager?: boolean;
  defaultOpen?: boolean;
  testId?: string;
};

/**
 * RC4 — lazy mount + viewport virtualization.
 * Children mount only when expanded AND (eager or near viewport).
 * Same UI: <details> accordion.
 */
export function MedicalCopilotDeferredPanel({
  title,
  children,
  eager = false,
  defaultOpen = false,
  testId,
}: MedicalCopilotDeferredPanelProps) {
  const [open, setOpen] = useState(eager || defaultOpen);
  const [inView, setInView] = useState(eager);
  const [mounted, setMounted] = useState(eager || defaultOpen);
  const ref = useRef<HTMLDetailsElement | null>(null);
  const mountedAt = useRef<number | null>(null);

  useEffect(() => {
    if (eager) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        setInView(visible);
        // Virtualization: if closed and far away, allow unmount to free memory
        if (!visible && !el.open) {
          setMounted(false);
          mountedAt.current = null;
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [eager]);

  useEffect(() => {
    if (mounted && mountedAt.current == null) {
      mountedAt.current = typeof performance !== "undefined" ? performance.now() : Date.now();
      recordRc4LazyLoad(title, 0);
      recordRc5LazyHydration(0);
    }
  }, [mounted, title]);

  useEffect(() => {
    if (!mounted) return;
    const start = typeof performance !== "undefined" ? performance.now() : Date.now();
    const id = requestAnimationFrame(() => {
      const end = typeof performance !== "undefined" ? performance.now() : Date.now();
      recordRc4Render(title, end - start);
    });
    return () => cancelAnimationFrame(id);
  }, [mounted, title]);

  const shouldMount = mounted && (eager || inView || open);

  return (
    <details
      ref={ref}
      className="rounded border border-slate-200 bg-slate-50/60 open:bg-white"
      data-testid={testId ?? "medical-copilot-deferred-panel"}
      open={open}
      onToggle={(e) => {
        const next = (e.currentTarget as HTMLDetailsElement).open;
        setOpen(next);
        if (next) setMounted(true);
      }}
    >
      <summary className="cursor-pointer select-none px-3 py-2 text-xs font-medium text-slate-700">
        {title}
        {!shouldMount ? (
          <span className="ml-2 text-[10px] font-normal uppercase tracking-wide text-slate-400">
            virtualized
          </span>
        ) : null}
      </summary>
      <div className="border-t border-slate-100 px-1 py-2">
        {shouldMount ? children : null}
      </div>
    </details>
  );
}
