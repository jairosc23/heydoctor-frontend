"use client";

import { useEffect, useRef, useState } from "react";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getApiBase } from "@/lib/api-base";
import {
  LOGIN_PATH,
  VERIFICATION_COPY,
  VERIFICATION_PAGE_PATH,
  VERIFY_PATIENT_EMAIL_PATH,
  canSubmitVerification,
  classifyVerifyResponse,
  readVerificationFragment,
  type VerificationLanguage,
  type VerificationView,
} from "@/lib/patient-email-verification";

export default function VerifyEmailCard() {
  const tokenRef = useRef<string | null>(null);
  const posting = useRef(false);
  const [view, setView] = useState<VerificationView>("missing");
  const [language, setLanguage] = useState<VerificationLanguage>("es");

  useEffect(() => {
    const read = readVerificationFragment(window.location.hash);
    tokenRef.current = read.view === "ready" ? read.token : null;
    setView(read.view);
    const browserLanguage = window.navigator.language.toLowerCase();
    setLanguage(browserLanguage.startsWith("en") ? "en" : "es");
    window.history.replaceState(null, "", VERIFICATION_PAGE_PATH);
  }, []);

  async function verify() {
    const token = tokenRef.current;
    if (!token || posting.current || !canSubmitVerification(view)) {
      return;
    }
    posting.current = true;
    setView("verifying");
    try {
      const response = await fetch(`${getApiBase()}${VERIFY_PATIENT_EMAIL_PATH}`, {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const body: unknown = await response.json().catch(() => null);
      const next = classifyVerifyResponse(response.status, body);
      if (next === "success" || next === "unusable") {
        tokenRef.current = null;
      }
      setView(next);
    } catch {
      setView("error");
    } finally {
      posting.current = false;
    }
  }

  const copy = VERIFICATION_COPY[language][view];
  const other = language === "es" ? "en" : "es";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <Card className="w-full max-w-md text-center shadow-premium">
        <BrandLogo markOnly markSize={96} priority className="mx-auto mb-6" />
        <div className="mb-4 flex justify-end">
          <Button
            variant="secondary"
            className="min-h-9 px-3 py-1 text-sm"
            onClick={() => setLanguage(other)}
          >
            {other.toUpperCase()}
          </Button>
        </div>
        <h1
          className="mb-3 text-2xl font-bold text-primary"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {copy.title}
        </h1>
        <p className="mb-6 text-sm text-primaryDark/70">{copy.body}</p>
        {canSubmitVerification(view) ? (
          <Button className="w-full" disabled={view === "verifying"} onClick={() => void verify()}>
            {copy.action}
          </Button>
        ) : null}
        {view === "success" ? (
          <Button href={LOGIN_PATH} className="w-full" rel="noreferrer">
            {copy.action}
          </Button>
        ) : null}
      </Card>
    </div>
  );
}
