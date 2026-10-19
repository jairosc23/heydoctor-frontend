"use client";

import { useEffect, useState } from "react";
import { clinicalWorkspaceKernel } from "@/lib/clinical-workspace/kernel";

const SOAP_STEPS = [1, 2, 3, 4] as const;
export type SoapNavStep = (typeof SOAP_STEPS)[number];

/** Phase 4.4A — Scroll Spy™ para navegación SOAP sticky. */
export function useSoapScrollSpy(enabled: boolean): SoapNavStep {
  const [activeStep, setActiveStep] = useState<SoapNavStep>(1);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const elements = SOAP_STEPS.map((step) =>
      document.getElementById(`soap-block-${step}`),
    ).filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) return;

    const pickActive = () => {
      const chromePx = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--encounter-chrome-h",
        ),
      );
      const viewport = clinicalWorkspaceKernel.getViewport();
      const navOffset =
        (Number.isFinite(chromePx) ? chromePx : viewport.encounterChromeHeight) +
        40;
      let best: { step: SoapNavStep; top: number } | null = null;

      for (const el of elements) {
        const step = Number(el.id.replace("soap-block-", "")) as SoapNavStep;
        const rect = el.getBoundingClientRect();
        if (rect.bottom <= navOffset) continue;
        if (!best || rect.top < best.top) {
          best = { step, top: rect.top };
        }
      }

      if (best) {
        setActiveStep(best.step);
        return;
      }

      const last = elements[elements.length - 1];
      if (last && last.getBoundingClientRect().top < window.innerHeight) {
        setActiveStep(SOAP_STEPS[SOAP_STEPS.length - 1]);
      }
    };

    pickActive();
    window.addEventListener("scroll", pickActive, { passive: true });
    window.addEventListener("resize", pickActive);

    return () => {
      window.removeEventListener("scroll", pickActive);
      window.removeEventListener("resize", pickActive);
    };
  }, [enabled]);

  return activeStep;
}
