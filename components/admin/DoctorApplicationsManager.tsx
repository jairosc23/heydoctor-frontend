"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  fetchDoctorApplications,
  reviewDoctorApplication,
  createDoctorApplicationInvite,
  type DoctorApplication,
} from "@/lib/services/doctor-applications";
import { buildDoctorApplyInvitePath } from "@/lib/doctor-apply-clinic";

const STATUS_CLASS: Record<string, string> = {
  pending: "bg-primaryMid text-white",
  approved: "bg-primary text-white",
  rejected: "bg-red-600 text-white",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  approved: "Aprobada",
  rejected: "Rechazada",
};

const FONT_HEADING = "Montserrat, sans-serif";

export default function DoctorApplicationsManager() {
  const [apps, setApps] = useState<DoctorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [inviteError, setInviteError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await fetchDoctorApplications(filter || undefined);
      setApps(data);
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCopyInvite() {
    setInviteBusy(true);
    setInviteError("");
    setInviteCopied(false);
    try {
      const { inviteToken } = await createDoctorApplicationInvite();
      const url = `${window.location.origin}${buildDoctorApplyInvitePath(inviteToken)}`;
      await navigator.clipboard.writeText(url);
      setInviteCopied(true);
    } catch {
      setInviteError("No se pudo copiar el enlace. Inténtalo de nuevo.");
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleReview(id: string, decision: "approved" | "rejected") {
    setReviewingId(id);
    try {
      const reason =
        decision === "rejected" ? prompt("Razón del rechazo:") || undefined : undefined;
      await reviewDoctorApplication(id, decision, reason);
      await load();
    } catch {
      /* silent */
    } finally {
      setReviewingId(null);
    }
  }

  return (
    <div className="rounded-2xl bg-hd-surface-chrome p-6 shadow-premium">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3
          className="m-0 text-base font-bold text-primaryDark"
          style={{ fontFamily: FONT_HEADING }}
        >
          Solicitudes de Médicos
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyInvite}
            disabled={inviteBusy}
            className="rounded-lg border-0 bg-primary px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            {inviteBusy
              ? "Generando..."
              : inviteCopied
                ? "Enlace copiado"
                : "Copiar enlace de invitación"}
          </button>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-hd-border-subtle px-3 py-1.5 text-[13px] text-primaryDark outline-none focus:border-primary focus:ring-2 focus:ring-primaryLight"
          >
            <option value="">Todas</option>
            <option value="pending">Pendientes</option>
            <option value="approved">Aprobadas</option>
            <option value="rejected">Rechazadas</option>
          </select>
        </div>
      </div>

      {inviteError ? (
        <p className="mb-3 text-sm text-red-600" role="alert">
          {inviteError}
        </p>
      ) : null}

      {loading ? (
        <p className="text-sm text-primaryDark/70">Cargando...</p>
      ) : apps.length === 0 ? (
        <p className="text-sm text-primaryDark/50">No hay solicitudes.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {apps.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hd-border-subtle p-4"
            >
              <div>
                <p className="m-0 text-sm font-semibold text-primaryDark">{a.name}</p>
                <p className="mt-1 mb-0 text-[13px] text-primaryDark/70">
                  {a.email} &middot; {a.specialty} &middot; {a.country}
                </p>
                <p className="mt-1 mb-0 text-xs text-primaryDark/50">
                  {new Date(a.createdAt).toLocaleDateString("es")}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                    STATUS_CLASS[a.status] ?? "bg-primaryDark/40 text-white"
                  }`}
                >
                  {STATUS_LABELS[a.status] ?? a.status}
                </span>
                {a.status === "pending" && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleReview(a.id, "approved")}
                      disabled={reviewingId === a.id}
                      className="rounded-lg border-0 bg-primary px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReview(a.id, "rejected")}
                      disabled={reviewingId === a.id}
                      className="rounded-lg border-0 bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
