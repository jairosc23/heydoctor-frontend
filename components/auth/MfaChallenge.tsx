"use client";

import { useEffect, useState, type FormEvent } from "react";
import QRCode from "qrcode";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  confirmMfaEnrollment,
  startMfaEnrollment,
  verifyMfaChallenge,
} from "@/lib/auth-mfa-client";
import {
  extractTotpSecretFromOtpauth,
  formatTotpSecretForDisplay,
} from "@/lib/auth-mfa";
import { clearMfaPendingState } from "@/lib/auth-mfa-pending-memory";

type Step = "enroll" | "backup" | "verify";

type Props = {
  enrolled: boolean;
  onAuthenticated: () => Promise<void>;
  onCancel: () => void;
};

export function MfaChallenge({ enrolled, onAuthenticated, onCancel }: Props) {
  const [step, setStep] = useState<Step>(enrolled ? "verify" : "enroll");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [savedAck, setSavedAck] = useState(false);
  const [lastTotp, setLastTotp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const secret = otpauthUri ? extractTotpSecretFromOtpauth(otpauthUri) : null;

  useEffect(() => {
    if (enrolled) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void startMfaEnrollment()
      .then(async ({ otpauthUri: uri }) => {
        if (cancelled) return;
        setOtpauthUri(uri);
        const dataUrl = await QRCode.toDataURL(uri, {
          width: 192,
          margin: 2,
          color: { dark: "#022C2C", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "No se pudo iniciar el enrolamiento.",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [enrolled]);

  function handleCancel() {
    setOtpauthUri("");
    setQrDataUrl("");
    setBackupCodes([]);
    setLastTotp("");
    setCode("");
    clearMfaPendingState();
    onCancel();
  }

  async function handleConfirmEnroll(e: FormEvent) {
    e.preventDefault();
    setError("");
    const totp = code.trim();
    if (!/^\d{6}$/.test(totp)) {
      setError("Ingresa el código de 6 dígitos.");
      return;
    }
    setLoading(true);
    try {
      const { backupCodes: codes } = await confirmMfaEnrollment(totp);
      setLastTotp(totp);
      setBackupCodes(codes);
      setOtpauthUri("");
      setQrDataUrl("");
      setCode("");
      setStep("backup");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Código inválido.");
    } finally {
      setLoading(false);
    }
  }

  async function finishWithCode(raw: string) {
    setLoading(true);
    setError("");
    try {
      await verifyMfaChallenge(raw);
      setBackupCodes([]);
      setLastTotp("");
      setOtpauthUri("");
      await onAuthenticated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo verificar.");
      setStep("verify");
    } finally {
      setLoading(false);
    }
  }

  async function handleAckContinue() {
    if (!savedAck) {
      setError("Confirma que guardaste los códigos de respaldo.");
      return;
    }
    if (lastTotp) {
      await finishWithCode(lastTotp);
      return;
    }
    setStep("verify");
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    const raw = code.trim();
    if (!raw) {
      setError("Ingresa el código del autenticador o un código de respaldo.");
      return;
    }
    await finishWithCode(raw);
  }

  return (
    <div className="text-left">
      {step === "enroll" ? (
        <>
          <h2
            className="mb-2 text-lg font-bold text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Activa la verificación en dos pasos
          </h2>
          <p className="mb-4 text-sm text-primaryDark/70">
            Escanea el código QR con tu autenticador o ingresa la clave manual.
          </p>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Código QR para autenticador TOTP"
              className="mx-auto mb-4 h-48 w-48 rounded-xl border border-hd-border-default bg-white p-2"
            />
          ) : null}
          {secret ? (
            <p className="mb-4 break-all rounded-xl bg-hd-surface-base px-3 py-2 font-mono text-sm text-primaryDark">
              <span className="block text-xs font-sans font-medium text-primaryDark/60">
                Clave manual
              </span>
              {formatTotpSecretForDisplay(secret)}
            </p>
          ) : null}
          <form onSubmit={handleConfirmEnroll}>
            <label
              htmlFor="mfa-enroll-code"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              Código de 6 dígitos
            </label>
            <Input
              id="mfa-enroll-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
              maxLength={8}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-4 w-full rounded-lg border-0 bg-primary"
            >
              {loading ? "Confirmando…" : "Confirmar autenticador"}
            </Button>
          </form>
        </>
      ) : null}

      {step === "backup" ? (
        <>
          <h2
            className="mb-2 text-lg font-bold text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Guarda tus códigos de respaldo
          </h2>
          <p className="mb-3 text-sm text-primaryDark/70">
            Se muestran una sola vez. Sin ellos no podrás entrar si pierdes el
            autenticador.
          </p>
          <ol className="mb-4 list-decimal space-y-1 rounded-xl bg-hd-surface-base px-6 py-3 font-mono text-sm text-primaryDark">
            {backupCodes.map((item, index) => (
              <li key={`${index}`}>{item}</li>
            ))}
          </ol>
          <label className="mb-4 flex items-start gap-2 text-sm text-primaryDark">
            <input
              type="checkbox"
              className="mt-1"
              checked={savedAck}
              onChange={(e) => setSavedAck(e.target.checked)}
            />
            He guardado estos códigos en un lugar seguro.
          </label>
          <Button
            type="button"
            variant="primary"
            disabled={loading || !savedAck}
            onClick={() => void handleAckContinue()}
            className="w-full rounded-lg border-0 bg-primary"
          >
            {loading ? "Verificando…" : "Continuar"}
          </Button>
        </>
      ) : null}

      {step === "verify" ? (
        <>
          <h2
            className="mb-2 text-lg font-bold text-primary"
            style={{ fontFamily: "Montserrat, sans-serif" }}
          >
            Verificación en dos pasos
          </h2>
          <p className="mb-4 text-sm text-primaryDark/70">
            Ingresa el código de tu autenticador o un código de respaldo.
          </p>
          <form onSubmit={handleVerify}>
            <label
              htmlFor="mfa-verify-code"
              className="mb-1.5 block text-sm font-medium text-primaryDark"
            >
              Código
            </label>
            <Input
              id="mfa-verify-code"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={loading}
            />
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="mt-4 w-full rounded-lg border-0 bg-primary"
            >
              {loading ? "Verificando…" : "Verificar"}
            </Button>
          </form>
        </>
      ) : null}

      {error ? (
        <div id="mfa-error" className="mt-3 text-sm text-red-600" role="alert">{error}</div>
      ) : null}

      <button
        type="button"
        onClick={handleCancel}
        className="mt-4 w-full text-sm font-semibold text-primary hover:underline"
      >
        Cancelar y volver al inicio de sesión
      </button>
    </div>
  );
}
