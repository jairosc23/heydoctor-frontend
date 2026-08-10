"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { UnsavedChangesDialog } from "@/components/unsaved-changes/UnsavedChangesDialog";
import { resolveUnsavedNavigation } from "@/lib/unsaved-changes-guard/resolve-navigation";

export type UnsavedChangesHandlers = {
  isDirty: () => boolean;
  save: () => Promise<void>;
};

type PendingNavigation =
  | { kind: "href"; href: string }
  | { kind: "run"; run: () => void };

type UnsavedChangesGuardContextValue = {
  requestNavigation: (target: string | (() => void)) => void;
  register: (handlers: UnsavedChangesHandlers) => () => void;
};

const UnsavedChangesGuardContext =
  createContext<UnsavedChangesGuardContextValue | null>(null);

export function useUnsavedChangesGuard(): UnsavedChangesGuardContextValue {
  const ctx = useContext(UnsavedChangesGuardContext);
  if (!ctx) {
    throw new Error(
      "useUnsavedChangesGuard must be used within UnsavedChangesGuardProvider",
    );
  }
  return ctx;
}

export function useOptionalUnsavedChangesGuard(): UnsavedChangesGuardContextValue | null {
  return useContext(UnsavedChangesGuardContext);
}

export function UnsavedChangesGuardProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const handlersRef = useRef<UnsavedChangesHandlers | null>(null);
  const [pending, setPending] = useState<PendingNavigation | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const register = useCallback((handlers: UnsavedChangesHandlers) => {
    handlersRef.current = handlers;
    return () => {
      if (handlersRef.current === handlers) {
        handlersRef.current = null;
      }
    };
  }, []);

  const completeNavigation = useCallback(
    (nav: PendingNavigation) => {
      if (nav.kind === "href") {
        router.push(nav.href);
        return;
      }
      nav.run();
    },
    [router],
  );

  const requestNavigation = useCallback(
    (target: string | (() => void)) => {
      const nav: PendingNavigation =
        typeof target === "string"
          ? { kind: "href", href: target }
          : { kind: "run", run: target };
      const dirty = handlersRef.current?.isDirty() ?? false;
      if (resolveUnsavedNavigation(dirty) === "navigate") {
        completeNavigation(nav);
        return;
      }
      setError(null);
      setPending(nav);
    },
    [completeNavigation],
  );

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!(handlersRef.current?.isDirty() ?? false)) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  const value = useMemo(
    () => ({ requestNavigation, register }),
    [requestNavigation, register],
  );

  return (
    <UnsavedChangesGuardContext.Provider value={value}>
      {children}
      <UnsavedChangesDialog
        open={pending != null}
        saving={saving}
        error={error}
        onCancel={() => {
          if (saving) return;
          setPending(null);
          setError(null);
        }}
        onExitWithoutSaving={() => {
          if (!pending || saving) return;
          const nav = pending;
          setPending(null);
          setError(null);
          completeNavigation(nav);
        }}
        onSaveAndExit={() => {
          if (!pending || saving) return;
          const nav = pending;
          const save = handlersRef.current?.save;
          if (!save) {
            setPending(null);
            completeNavigation(nav);
            return;
          }
          setSaving(true);
          setError(null);
          void save()
            .then(() => {
              setPending(null);
              completeNavigation(nav);
            })
            .catch((err: unknown) => {
              setError(
                err instanceof Error
                  ? err.message
                  : "No se pudieron guardar los cambios.",
              );
            })
            .finally(() => {
              setSaving(false);
            });
        }}
      />
    </UnsavedChangesGuardContext.Provider>
  );
}
