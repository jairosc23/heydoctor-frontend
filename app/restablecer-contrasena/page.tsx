"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { HdSkipLink } from "@/components/ui/HdFeedback";
import Input from "@/components/ui/Input";
import { getApiBase } from "@/lib/api-base";
import {
  PASSWORD_REQUEST_PATH,
  PASSWORD_RESET_PATH,
  RESET_COPY,
  RESET_PASSWORD_API,
  LOGIN_PATH,
  classifyResetResponse,
  passwordMeetsPolicy,
  readResetFragment,
  type RecoveryLanguage,
  type ResetView,
} from "@/lib/password-recovery";

export default function PasswordResetPage() {
  const tokenRef = useRef<string | null>(null);
  const posting = useRef(false);
  const [view, setView] = useState<ResetView>("missing");
  const [language, setLanguage] = useState<RecoveryLanguage>("es");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [localError, setLocalError] = useState("");

  useLayoutEffect(() => {
    const read = readResetFragment(window.location.hash);
    tokenRef.current = read.view === "ready" ? read.token : null;
    setView(read.view);
    const browserLanguage = window.navigator.language.toLowerCase();
    setLanguage(browserLanguage.startsWith("en") ? "en" : "es");
    const strip = () => {
      if (!window.location.hash) {
        return;
      }
      window.history.replaceState(
        window.history.state,
        "",
        `${window.location.pathname}${window.location.search}`,
      );
    };
    strip();
    const timer = window.setTimeout(strip, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const token = tokenRef.current;
    const copy = RESET_COPY[language].ready;
    if (!token || posting.current || (view !== "ready" && view !== "error")) {
      return;
    }
    if (!passwordMeetsPolicy(password) || password !== confirm) {
      setLocalError(copy.body);
      return;
    }
    posting.current = true;
    setLocalError("");
    setView("submitting");
    try {
      const response = await fetch(`${getApiBase()}${RESET_PASSWORD_API}`, {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const body: unknown = await response.json().catch(() => null);
      const next = classifyResetResponse(response.status, body);
      if (next === "success" || next === "unusable") {
        tokenRef.current = null;
        setPassword("");
        setConfirm("");
      }
      setView(next);
    } catch {
      setView("error");
    } finally {
      posting.current = false;
    }
  }

  const copy = RESET_COPY[language][view];
  const showForm = view === "ready" || view === "error" || view === "submitting";
  const languageLabel = language === "es" ? "English" : "Español";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <HdSkipLink href="#password-reset-form" label={copy.action} />
      <Card className="w-full max-w-md text-center shadow-premium">
        <BrandLogo markOnly markSize={96} priority className="mx-auto mb-6" />
        <div className="mb-4 text-right">
          <button
            type="button"
            className="min-h-11 rounded px-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primaryLight"
            aria-pressed={language === "en"}
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
          >
            {languageLabel}
          </button>
        </div>
        <h1
          className="mb-3 text-2xl font-bold text-primary sm:text-[28px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {copy.title}
        </h1>
        <p className="mb-4 text-sm text-primaryDark/80" role="status">
          {localError || copy.body}
        </p>
        {showForm ? (
          <form
            id="password-reset-form"
            onSubmit={handleSubmit}
            className="text-left"
          >
            <label
              htmlFor="new-password"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              {language === "es" ? "Nueva contraseña" : "New password"}
            </label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={view === "submitting"}
              minLength={6}
              aria-invalid={Boolean(localError)}
            />
            <label
              htmlFor="confirm-password"
              className="mb-1.5 mt-3 block text-sm font-medium text-primaryDark"
            >
              {language === "es" ? "Confirmar" : "Confirm"}
            </label>
            <Input
              id="confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              disabled={view === "submitting"}
              minLength={6}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={view === "submitting"}
              className="mt-4 w-full rounded-lg border-0 bg-primary"
            >
              {copy.action}
            </Button>
          </form>
        ) : (
          <p className="text-sm">
            <Link
              href={view === "success" ? LOGIN_PATH : PASSWORD_REQUEST_PATH}
              className="inline-flex min-h-11 items-center rounded font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primaryLight"
            >
              {copy.action}
            </Link>
          </p>
        )}
      </Card>
    </div>
  );
}
