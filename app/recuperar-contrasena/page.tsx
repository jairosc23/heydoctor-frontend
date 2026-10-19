"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/branding";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { HdErrorState, HdSkipLink } from "@/components/ui/HdFeedback";
import Input from "@/components/ui/Input";
import { getApiBase } from "@/lib/api-base";
import {
  FORGOT_PASSWORD_API,
  LOGIN_PATH,
  REQUEST_COPY,
  classifyForgotResponse,
  type RecoveryLanguage,
} from "@/lib/password-recovery";

export default function PasswordRequestPage() {
  const [language, setLanguage] = useState<RecoveryLanguage>("es");
  const [email, setEmail] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const copy = REQUEST_COPY[language];

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (!email.trim()) {
      setError(copy.error);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${getApiBase()}${FORGOT_PASSWORD_API}`, {
        method: "POST",
        credentials: "omit",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (classifyForgotResponse(response.status) === "accepted") {
        setAccepted(true);
        return;
      }
      setError(copy.error);
    } catch {
      setError(copy.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <HdSkipLink href="#password-request-form" label={copy.action} />
      <Card className="w-full max-w-md text-center shadow-premium">
        <BrandLogo markOnly markSize={96} priority className="mx-auto mb-6" />
        <div className="mb-4 text-right">
          <button
            type="button"
            className="min-h-11 rounded px-3 text-sm font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primaryLight"
            aria-pressed={language === "en"}
            onClick={() => setLanguage(language === "es" ? "en" : "es")}
          >
            {copy.language}
          </button>
        </div>
        <h1
          className="mb-3 text-2xl font-bold text-primary sm:text-[28px]"
          style={{ fontFamily: "Montserrat, sans-serif" }}
        >
          {accepted ? copy.acceptedTitle : copy.title}
        </h1>
        <p className="mb-4 text-sm text-primaryDark/80">
          {accepted ? copy.acceptedBody : copy.body}
        </p>
        {accepted ? null : (
          <form
            id="password-request-form"
            onSubmit={handleSubmit}
            className="text-left"
          >
            <label
              htmlFor="recovery-email"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              {copy.email}
            </label>
            <Input
              id="recovery-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={loading}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "recovery-error" : undefined}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-4 w-full rounded-lg border-0 bg-primary"
            >
              {loading ? "…" : copy.action}
            </Button>
          </form>
        )}
        {error ? (
          <HdErrorState
            id="recovery-error"
            className="mt-3 text-left"
            message={error}
          />
        ) : null}
        <p className="mt-4 text-sm">
          <Link
            href={LOGIN_PATH}
            className="rounded font-semibold text-primary focus:outline-none focus:ring-2 focus:ring-primaryLight"
          >
            {copy.login}
          </Link>
        </p>
      </Card>
    </div>
  );
}
