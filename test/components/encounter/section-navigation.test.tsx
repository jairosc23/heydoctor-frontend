import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  revealEncounterRailItem,
  navigateToEncounterSection,
} from "@/lib/encounter/navigation/section-navigation";

describe("P0-2 Signature Ready navigation", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("reveals the matching rail item inside the rail overflow", () => {
    document.body.innerHTML = `
      <nav data-testid="clinical-navigation-rail">
        <button data-section-id="encounter-section-1">ID</button>
        <button data-section-id="encounter-section-20">Firma</button>
      </nav>
    `;
    const rail = document.querySelector(
      '[data-testid="clinical-navigation-rail"]',
    ) as HTMLElement;
    const firma = document.querySelector(
      '[data-section-id="encounter-section-20"]',
    ) as HTMLElement;
    vi.spyOn(rail, "getClientRects").mockReturnValue([
      { width: 200, height: 400 } as DOMRect,
    ] as unknown as DOMRectList);
    vi.spyOn(firma, "getClientRects").mockReturnValue([
      { width: 180, height: 32 } as DOMRect,
    ] as unknown as DOMRectList);
    const scrollIntoView = vi.fn();
    firma.scrollIntoView = scrollIntoView;

    revealEncounterRailItem("encounter-section-20");
    expect(scrollIntoView).toHaveBeenCalledWith({
      block: "nearest",
      inline: "nearest",
    });
  });

  it("scrolls the chart section and then reveals Firma on the rail", () => {
    document.body.innerHTML = `
      <main style="overflow:auto">
        <section id="encounter-section-20">Firma</section>
      </main>
      <nav data-testid="clinical-navigation-rail">
        <button data-section-id="encounter-section-20">Firma</button>
      </nav>
    `;
    const section = document.getElementById("encounter-section-20") as HTMLElement;
    const main = document.querySelector("main") as HTMLElement;
    const firma = document.querySelector(
      '[data-section-id="encounter-section-20"]',
    ) as HTMLElement;
    const rail = document.querySelector(
      '[data-testid="clinical-navigation-rail"]',
    ) as HTMLElement;

    for (const el of [section, main, firma, rail]) {
      vi.spyOn(el, "getClientRects").mockReturnValue([
        { width: 100, height: 40 } as DOMRect,
      ] as unknown as DOMRectList);
    }
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue({
      top: 800,
      bottom: 900,
      left: 0,
      right: 100,
      width: 100,
      height: 100,
      x: 0,
      y: 800,
      toJSON() {
        return {};
      },
    });
    vi.spyOn(main, "getBoundingClientRect").mockReturnValue({
      top: 80,
      bottom: 700,
      left: 0,
      right: 400,
      width: 400,
      height: 620,
      x: 0,
      y: 80,
      toJSON() {
        return {};
      },
    });
    const scrollBy = vi.fn();
    main.scrollBy = scrollBy as typeof main.scrollBy;
    const scrollIntoView = vi.fn();
    firma.scrollIntoView = scrollIntoView;
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener() {},
      removeListener() {},
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() {
        return false;
      },
    }) as unknown as typeof window.matchMedia;

    const ok = navigateToEncounterSection("encounter-section-20", {
      skipFocus: true,
    });
    expect(ok).toBe(true);
    expect(scrollBy).toHaveBeenCalled();
    expect(scrollIntoView).toHaveBeenCalled();
  });
});
