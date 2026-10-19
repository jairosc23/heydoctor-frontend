"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ApiError, heydoctorApi } from "@/lib/heydoctor-api";
import { BrandLogo } from "@/components/branding";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { HdErrorState, HdSkipLink } from "@/components/ui/HdFeedback";
import {
  CLINIC_REGISTER_COPY,
  OWN_CLINIC_REGISTER_PATH,
  OWN_CLINIC_RESEND_PATH,
  buildOwnClinicRegisterBody,
  buildOwnClinicResendBody,
  clinicRegisterFailureMessage,
  pendingClinicLoginHref,
  readClinicVerificationStatus,
  type ClinicRegisterLanguage,
} from "@/lib/clinic-registration";

const FONT_HEADING = "Montserrat, sans-serif";

/** Tokens CTA primario DS (Login / Landing). */
const CTA_PRIMARY =
  "rounded-lg border-0 bg-primary shadow-none !shadow-[0_4px_12px_rgba(7,138,146,0.22)] hover:bg-primaryMid hover:scale-100 focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2 disabled:hover:bg-primary disabled:hover:scale-100";

export default function RegisterPage() {
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verification, setVerification] = useState<"pending" | "failed" | null>(
    null,
  );
  const [language, setLanguage] = useState<ClinicRegisterLanguage>("es");
  const copy = CLINIC_REGISTER_COPY[language];
  const other = language === "es" ? "en" : "es";

  useEffect(() => {
    const browserLanguage = window.navigator.language.toLowerCase();
    setLanguage(browserLanguage.startsWith("en") ? "en" : "es");
    const notice = new URLSearchParams(window.location.search).get("notice");
    if (notice === "pending" || notice === "failed") {
      setVerification(notice);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!clinicName.trim() || !email.trim() || !password.trim()) {
      setError(copy.missing);
      return;
    }
    if (password.length < 6) {
      setError(copy.shortPassword);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.mismatch);
      return;
    }

    setLoading(true);
    try {
      const body = await heydoctorApi.post(
        OWN_CLINIC_REGISTER_PATH,
        buildOwnClinicRegisterBody({ clinicName, email, password }),
        { requireAuth: false },
      );
      setVerification(readClinicVerificationStatus(body));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(clinicRegisterFailureMessage(err.status, language));
      } else if (
        err instanceof Error &&
        (err.message.includes("Failed to fetch") ||
          err.message.includes("NetworkError"))
      ) {
        setError(copy.network);
      } else {
        setError(copy.network);
      }
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setError("");
    setLoading(true);
    try {
      const body = await heydoctorApi.post(
        OWN_CLINIC_RESEND_PATH,
        buildOwnClinicResendBody(email),
        { requireAuth: false },
      );
      setVerification(readClinicVerificationStatus(body));
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        setError(copy.limited);
      } else {
        setVerification("failed");
      }
    } finally {
      setLoading(false);
    }
  }

  if (verification) {
    const issued = verification === "pending";
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
        <Card className="w-full max-w-md text-center shadow-premium">
          <BrandLogo markOnly markSize={128} priority className="mx-auto mb-6" />
          <h1
            className="mb-3 text-[22px] font-bold text-primary"
            style={{ fontFamily: FONT_HEADING }}
          >
            {issued ? copy.pendingTitle : copy.failedTitle}
          </h1>
          <p className="m-0 text-sm leading-6 text-primaryDark/70">
            {issued ? copy.pendingBody : copy.failedBody}
          </p>
          {email.trim() ? (
            <Button
              type="button"
              variant="secondary"
              className="mt-6 w-full"
              disabled={loading}
              onClick={() => void resendVerification()}
            >
              {copy.resend}
            </Button>
          ) : null}
          <Button href={pendingClinicLoginHref()} className={`mt-3 w-full ${CTA_PRIMARY}`}>
            {copy.login}
          </Button>
          {error ? (
            <HdErrorState className="mt-3 text-left" message={error} />
          ) : null}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primaryDark via-primaryMid to-primary px-4 py-12">
      <HdSkipLink href="#register-form" label={copy.skip} />
      <Card className="w-full max-w-md text-center shadow-premium">
        <div className="mb-2 flex justify-end">
          <Button
            variant="secondary"
            className="min-h-9 px-3 py-1 text-sm"
            aria-label={copy.language}
            onClick={() => setLanguage(other)}
          >
            {other.toUpperCase()}
          </Button>
        </div>
        <BrandLogo markOnly markSize={96} priority className="mx-auto mb-4" />
        <h1
          className="mb-2 text-2xl font-bold text-primary sm:text-[28px]"
          style={{ fontFamily: FONT_HEADING }}
        >
          {copy.title}
        </h1>
        <p className="mb-5 text-sm leading-6 text-primaryDark/70">{copy.intro}</p>
        <form id="register-form" onSubmit={handleSubmit} className="text-left">
          <div className="mb-3">
            <label
              htmlFor="register-clinic"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              {copy.clinicName}
            </label>
            <Input
              id="register-clinic"
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              disabled={loading}
              autoComplete="organization"
              maxLength={200}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="register-email"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              {copy.email}
            </label>
            <Input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              disabled={loading}
              autoComplete="email"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
          <div className="mb-3">
            <label
              htmlFor="register-password"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              {copy.password}
            </label>
            <Input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="register-confirm-password"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              {copy.confirm}
            </label>
            <Input
              id="register-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
              aria-invalid={Boolean(error)}
              aria-describedby={error ? "register-error" : undefined}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className={`w-full ${CTA_PRIMARY}`}
          >
            {loading ? copy.submitting : copy.submit}
          </Button>
        </form>
        {error ? (
          <HdErrorState
            id="register-error"
            className="mt-3 text-left"
            message={error}
          />
        ) : null}
        <p className="mt-4 text-sm text-primaryDark/70">
          {copy.hasAccount}{" "}
          <Link
            href={pendingClinicLoginHref()}
            className="rounded font-semibold text-primary no-underline hover:underline focus:outline-none focus:ring-2 focus:ring-primaryLight focus:ring-offset-2"
          >
            {copy.signIn}
          </Link>
        </p>
      </Card>
    </div>
  );
}
