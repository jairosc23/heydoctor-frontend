"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { getDoctorProfileErrorMessage } from "@/lib/services/my-doctor-profile";
import {
  createProfessionalLicense,
  listClinicProfessionalLicenses,
  listMyProfessionalLicenses,
  revokeProfessionalLicense,
  verifyProfessionalLicense,
  type ProfessionalLicense,
} from "@/lib/services/professional-licenses";

export function ProfessionalLicensesPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [licenses, setLicenses] = useState<ProfessionalLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("");
  const [subdivisionCode, setSubdivisionCode] = useState("");
  const [authority, setAuthority] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (isAdmin) {
        setLicenses(await listClinicProfessionalLicenses());
      } else {
        setLicenses(await listMyProfessionalLicenses());
      }
    } catch (err) {
      setError(
        getDoctorProfileErrorMessage(
          err,
          "No se pudieron cargar las licencias profesionales.",
        ),
      );
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onCreate(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createProfessionalLicense({
        countryCode: countryCode.trim().toUpperCase(),
        subdivisionCode: subdivisionCode.trim().toUpperCase() || undefined,
        authority: authority.trim(),
        licenseNumber: licenseNumber.trim(),
        expiresAt: expiresAt.trim() || undefined,
      });
      setCountryCode("");
      setSubdivisionCode("");
      setAuthority("");
      setLicenseNumber("");
      setExpiresAt("");
      await load();
    } catch (err) {
      setError(
        getDoctorProfileErrorMessage(
          err,
          "No se pudo registrar la licencia. Queda sin verificar hasta un admin.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function onVerify(id: string) {
    setError(null);
    try {
      await verifyProfessionalLicense(id);
      await load();
    } catch (err) {
      setError(
        getDoctorProfileErrorMessage(
          err,
          "Solo un administrador puede verificar una licencia.",
        ),
      );
    }
  }

  async function onRevoke(id: string) {
    setError(null);
    try {
      await revokeProfessionalLicense(id);
      await load();
    } catch (err) {
      setError(
        getDoctorProfileErrorMessage(
          err,
          "Solo un administrador puede revocar una licencia.",
        ),
      );
    }
  }

  return (
    <section className="rounded-2xl border border-hd-border-subtle bg-white p-5 shadow-soft">
      <h2 className="mb-1 mt-0 text-base font-semibold text-primaryDark">
        Licencias profesionales (1:N)
      </h2>
      <p className="mb-4 mt-0 text-sm text-primaryDark/70">
        Discovery, horarios y reserva fallan cerrado si no hay una licencia
        verificada, activa y vigente para la jurisdicción declarada por el
        paciente. El médico no puede auto-verificar.
      </p>

      {error ? (
        <p
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-primaryDark/50">Cargando licencias…</p>
      ) : licenses.length === 0 ? (
        <p className="text-sm text-primaryDark/50">
          No hay licencias registradas. El perfil no es reservable.
        </p>
      ) : (
        <ul className="mb-5 grid gap-2 p-0">
          {licenses.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-hd-border-subtle px-3 py-2 text-sm"
            >
              <div>
                <strong>{row.jurisdictionCode}</strong> · {row.authority} ·{" "}
                {row.licenseNumber} · {row.status}
                {row.expiresAt
                  ? ` · vence ${row.expiresAt.slice(0, 10)}`
                  : ""}
              </div>
              {isAdmin ? (
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-800"
                    onClick={() => void onVerify(row.id)}
                  >
                    Verificar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-700"
                    onClick={() => void onRevoke(row.id)}
                  >
                    Revocar
                  </button>
                </div>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={(event) => void onCreate(event)} className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-primaryDark">País ISO-2</span>
          <input
            required
            maxLength={2}
            className="rounded-xl border border-hd-border-default px-3 py-2 uppercase"
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
            placeholder="CL"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-primaryDark">
            Subdivisión (opcional)
          </span>
          <input
            maxLength={8}
            className="rounded-xl border border-hd-border-default px-3 py-2 uppercase"
            value={subdivisionCode}
            onChange={(e) => setSubdivisionCode(e.target.value.toUpperCase())}
            placeholder="US-CA"
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-primaryDark">Autoridad</span>
          <input
            required
            minLength={2}
            className="rounded-xl border border-hd-border-default px-3 py-2"
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm">
          <span className="font-semibold text-primaryDark">Número</span>
          <input
            required
            className="rounded-xl border border-hd-border-default px-3 py-2"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
          />
        </label>
        <label className="grid gap-1 text-sm md:col-span-2">
          <span className="font-semibold text-primaryDark">
            Vencimiento (opcional)
          </span>
          <input
            type="date"
            className="rounded-xl border border-hd-border-default px-3 py-2"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl border-0 bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {saving ? "Guardando…" : "Agregar licencia (queda sin verificar)"}
          </button>
        </div>
      </form>
    </section>
  );
}
