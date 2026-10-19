"use client";

import { useState } from "react";
import {
  HcxBreadcrumbs,
  HcxConnectivityBanner,
  HcxContextHeader,
  HcxContextShellGate,
  HcxEmptyContext,
  HcxErrorContext,
  HcxNotificationRegion,
  HcxOfflineBanner,
  HcxToastProvider,
  HcxWorkspaceStatusBar,
  useHcxToast,
  type HcxConnectivityState,
} from "@/components/hcx/context";
import { HcxButton } from "@/components/hcx/foundation";
import { HcxBox, HcxSpacer, HcxText } from "@/components/hcx/primitive";
import { isHcxContextShellEnabled } from "@/lib/hcx/flags";

function ToastDemoButton() {
  const { push } = useHcxToast();
  return (
    <HcxButton
      variant="secondary"
      data-testid="hcx-toast-demo"
      onClick={() =>
        push({
          title: "Aviso de experiencia",
          body: "Toast no sustituye autoridad clínica.",
          tone: "info",
        })
      }
    >
      Mostrar toast
    </HcxButton>
  );
}

/**
 * HCX Phase 14 — Context & Offline chrome showcase.
 * No clinical data, HAB, AI, docs, therapy, orders, protocol, longitudinal, emission.
 */
export default function HcxContextShellShowcasePage() {
  const enabled = isHcxContextShellEnabled();
  const [connectivity, setConnectivity] =
    useState<HcxConnectivityState>("online");
  const [showError, setShowError] = useState(false);

  if (!enabled) {
    return (
      <main style={{ padding: 24, fontFamily: "system-ui" }}>
        <p data-testid="hcx-context-shell-disabled">
          HCX Context Shell (`hcx.context_shell`) desactivado. Define{" "}
          <code>NEXT_PUBLIC_HCX_CONTEXT_SHELL=true</code>.
        </p>
      </main>
    );
  }

  return (
    <HcxContextShellGate enabled>
      <HcxToastProvider>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <HcxContextHeader
            workspaceTitle="Chrome de contexto"
            environment="development"
            sessionLabel="Sesión demo"
          />
          <HcxBreadcrumbs
            items={[
              { id: "app", label: "App", href: "#" },
              { id: "shell", label: "Shell", href: "#" },
              { id: "context", label: "Contexto", current: true },
            ]}
          />
          <HcxConnectivityBanner state={connectivity} />
          <HcxOfflineBanner visible={connectivity === "offline"} />
          <main
            style={{ flex: 1, padding: "var(--hcx-space-4)", maxWidth: 800, margin: "0 auto", width: "100%" }}
          >
            <HcxText variant="bodySm" tone="secondary">
              Phase 14 — solo chrome estructural. Sin datos clínicos ni COS.
            </HcxText>
            <HcxSpacer size={4} />
            <HcxBox display="flex" direction="row" gap={2} className="hcx-stack hcx-stack-md-row">
              <HcxButton
                variant="secondary"
                onClick={() => setConnectivity("online")}
              >
                Online
              </HcxButton>
              <HcxButton
                variant="secondary"
                onClick={() => setConnectivity("degraded")}
              >
                Degradado
              </HcxButton>
              <HcxButton
                variant="secondary"
                onClick={() => setConnectivity("offline")}
              >
                Offline
              </HcxButton>
              <HcxButton
                variant="ghost"
                onClick={() => setShowError((v) => !v)}
              >
                Toggle error
              </HcxButton>
              <ToastDemoButton />
            </HcxBox>
            <HcxSpacer size={4} />
            {showError ? <HcxErrorContext /> : <HcxEmptyContext />}
            <HcxSpacer size={4} />
            <HcxNotificationRegion />
          </main>
          <HcxWorkspaceStatusBar
            syncStatus={connectivity === "offline" ? "error" : "synced"}
            environment="development"
            extra="hcx.context_shell"
          />
        </div>
      </HcxToastProvider>
    </HcxContextShellGate>
  );
}
