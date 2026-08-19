"use client";

import { useEffect, useRef } from "react";
import {
  createTimeoutRegistry,
  type TimeoutRegistry,
} from "./timeout-registry";

export function useTimeoutRegistry(): TimeoutRegistry {
  const ref = useRef<TimeoutRegistry | null>(null);
  if (!ref.current) ref.current = createTimeoutRegistry();
  useEffect(() => {
    return () => {
      ref.current?.clearAll();
    };
  }, []);
  return ref.current;
}
