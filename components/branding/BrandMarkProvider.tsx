"use client";

import { createContext, useContext } from "react";
import { BRAND_ICON_PNG } from "@/lib/brand-mark.constants";

const BrandMarkContext = createContext(BRAND_ICON_PNG);

type BrandMarkProviderProps = {
  markSrc: string;
  children: React.ReactNode;
};

export function BrandMarkProvider({ markSrc, children }: BrandMarkProviderProps) {
  return (
    <BrandMarkContext.Provider value={markSrc}>{children}</BrandMarkContext.Provider>
  );
}

export function useBrandMarkSrc(): string {
  return useContext(BrandMarkContext);
}
