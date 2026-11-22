"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/context/AuthContext";
import { getDoctorProfileErrorMessage } from "@/lib/services/my-doctor-profile";
import {
  listClinicProfessionalLicenses,
  verifyProfessionalLicense,
  type ProfessionalLicense,
} from "@/lib/services/professional-licenses";

const STATUS_LABEL: Record<ProfessionalLicense["status"], string> = {
  unverified: "Pendiente de verificación",
  active: "Verificada y activa",
  revoked: "Revocada",
};

/**
 * RC19 — Existing RBAC ADMIN-only clinic license API, displayed read-first.
 * Doctors submit their own credentials from their professional profile.
 * Verification is an explicit, confirmed action; never auto-creates licenses.
 */
export function AdminProfessionalLicensesReview() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [licenses, setLicenses] = useState<ProfessionalLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isAdmin) {
      setLicenses([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listClinicProfessionalLicenses();
      setLicenses(rows);
    } catch (err) {
      setLicenses([]);
      setError(
        getDoctorProfileErrorMessage(
          err,
          "No fue posible consultar las licencias de esta clínica.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    void load();
  }, [load]);

  async function verify(row: ProfessionalLicense) {
    if (!isAdmin || row.status !== "unverified" || verifyingId) return;
    const description = [
      row.authority,
      row.licenseNumber,
      row.jurisdictionCode,
      row.doctorProfileId,
    ].join(" · ");
    if (
      !window.confirm(
        `Confirmar la verificación profesional únicamente tras comprobar la credencial y jurisdicción:\n\n${description}\n\nEsta acción habilita elegibilidad de reserva donde corresponda.`,
      )
    ) {
      return;
    }
    setVerifyingId(row.id);
    setNotice(null);
    setError(null);
    try {
      const verified = await verifyProfessionalLicense(row.id);
      if (
        verified.id !== row.id ||
        verified.doctorProfileId !== row.doctorProfileId ||
        verified.status !== "active" ||
        !verified.verifiedAt ||
        !verified.verifiedBy
      ) {
        throw new Error("La respuesta no confirmó una verificación válida.");
      }
      setNotice(
        "Licencia verificada. Se confirmó el estado y el administrador responsable.",
      );
      await load();
    } catch (err) {
      setError(
        getDoctorProfileErrorMessage(
          err,
          "La verificación no pudo confirmarse. Consulta el estado antes de reintentar.",
        ),
      );
    } finally {
      setVerifyingId(null);
    }
  }

  if (!isAdmin) {
    return (
      <section aria-label="Licencias profesionales">
        <p role="alert" className="text-sm text-red-700">
          Solo un administrador autenticado puede revisar licencias.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="admin-professional-license-heading"
      className="rounded-2xl bg-hd-surface-chrome p-6 shadow-premium"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="admin-professional-license-heading"
            className="m-0 text-base font-bold text-primaryDark"
          >
            Verificación de licencias profesionales
          </h2>
          <p className="mt-2 text-sm text-primaryDark/70">
            Solo se muestran credenciales de la clínica autenticada. El médico
            registra su licencia desde Perfil profesional; el administrador la
            verifica tras contrastarla con la autoridad competente.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading || verifyingId !== null}
          className="rounded-lg border border-hd-border-default px-3 py-2 text-sm font-semibold text-primaryDark disabled:opacity-50"
        >
          Actualizar
        </button>
      </div>
      {error && (
        <p role="alert" className="mb-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mb-3 text-sm text-primary">
          {notice}
        </p>
      )}
      {loading ? (
        <p className="text-sm text-primaryDark/70">Cargando licencias…</p>
      ) : licenses.length === 0 ? (
        <p className="text-sm text-primaryDark/70">
          No hay licencias registradas en esta clínica. Ninguna se activará
          automáticamente.
        </p>
      ) : (
        <ul className="m-0 grid list-none gap-3 p-0">
          {licenses.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hd-border-subtle p-4"
            >
              <div className="min-w-0 text-sm text-primaryDark">
                <p className="m-0 font-semibold">
                  {row.jurisdictionCode} · {row.authority}
                </p>
                <p className="mt-1 mb-0 break-words">
                  Registro: {row.licenseNumber}
                </p>
                <p className="mt-1 mb-0 text-xs text-primaryDark/70">
                  Perfil: {row.doctorProfileId} · {STATUS_LABEL[row.status]}
                  {row.expiresAt
                    ? ` · Vence ${row.expiresAt.slice(0, 10)}`
                    : ""}
                </p>
              </div>
              {row.status === "unverified" && (
                <button
                  type="button"
                  onClick={() => void verify(row)}
                  disabled={verifyingId !== null}
                  className="rounded-lg border-0 bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {verifyingId === row.id
                    ? "Verificando…"
                    : "Verificar credencial"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
