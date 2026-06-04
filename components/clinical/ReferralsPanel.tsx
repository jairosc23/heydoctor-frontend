"use client";

import React, { useEffect, useState } from "react";
import {
  fetchReferralsByPatient,
  createReferral,
  updateReferralStatus,
  downloadReferralPdf,
  type ReferralRecord,
  type ReferralStatus,
} from "@/lib/services";
import { getApiErrorMessage } from "@/lib/heydoctor-api";

interface ReferralsPanelProps {
  patientId: string;
  consultationId?: string | null;
  className?: string;
}

const STATUS_LABEL: Record<ReferralStatus, string> = {
  PENDING: "Pendiente",
  ACCEPTED: "Aceptada",
  COMPLETED: "Completada",
};

export function ReferralsPanel({
  patientId,
  consultationId,
  className = "",
}: ReferralsPanelProps) {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [receivingDoctorName, setReceivingDoctorName] = useState("");
  const [receivingDoctorEmail, setReceivingDoctorEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [reason, setReason] = useState("");
  const [attachmentName, setAttachmentName] = useState("");

  const reload = async () => {
    const list = await fetchReferralsByPatient(patientId);
    setReferrals(list);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchReferralsByPatient(patientId)
      .then((list) => {
        if (!cancelled) setReferrals(list);
      })
      .catch((e) => {
        if (!cancelled) {
          setReferrals([]);
          setError(getApiErrorMessage(e, "No se pudieron cargar interconsultas."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patientId]);

  const handleCreate = async () => {
    if (!receivingDoctorName.trim() || !specialty.trim() || !reason.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createReferral({
        patientId,
        consultationId: consultationId ?? undefined,
        receivingDoctorName: receivingDoctorName.trim(),
        receivingDoctorEmail: receivingDoctorEmail.trim() || undefined,
        specialty: specialty.trim(),
        reason: reason.trim(),
        attachments: attachmentName.trim()
          ? [{ name: attachmentName.trim() }]
          : undefined,
      });
      setReceivingDoctorName("");
      setReceivingDoctorEmail("");
      setSpecialty("");
      setReason("");
      setAttachmentName("");
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "Error al crear interconsulta"));
    } finally {
      setSaving(false);
    }
  };

  const handleStatus = async (id: string, status: ReferralStatus) => {
    setError(null);
    try {
      await updateReferralStatus(id, status);
      await reload();
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo actualizar estado"));
    }
  };

  const handlePdf = async (id: string) => {
    setPdfLoadingId(id);
    setError(null);
    try {
      await downloadReferralPdf(id);
    } catch (e) {
      setError(getApiErrorMessage(e, "No se pudo generar PDF"));
    } finally {
      setPdfLoadingId(null);
    }
  };

  return (
    <section
      className={`rounded-lg border border-gray-200 p-4 ${className}`}
      style={{ background: "white" }}
    >
      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
        <span>🔄</span> Interconsultas
      </h3>
      {loading ? (
        <p className="text-sm text-gray-500">Cargando interconsultas…</p>
      ) : (
        <>
          {referrals.length > 0 && (
            <div className="mb-4 space-y-2 max-h-48 overflow-y-auto">
              {referrals.map((r) => (
                <div key={r.id} className="border border-gray-100 rounded p-2 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span>
                      <strong>{r.specialty}</strong> → {r.receivingDoctorName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100">
                      {STATUS_LABEL[r.status] ?? r.status}
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{r.reason}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(["PENDING", "ACCEPTED", "COMPLETED"] as ReferralStatus[]).map(
                      (st) => (
                        <button
                          key={st}
                          type="button"
                          disabled={r.status === st}
                          onClick={() => void handleStatus(r.id, st)}
                          className="text-xs text-indigo-600 hover:underline disabled:opacity-40"
                        >
                          {STATUS_LABEL[st]}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      onClick={() => void handlePdf(r.id)}
                      disabled={pdfLoadingId === r.id}
                      className="text-xs text-teal-700 hover:underline disabled:opacity-50"
                    >
                      {pdfLoadingId === r.id ? "PDF…" : "PDF"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <input
              type="text"
              value={receivingDoctorName}
              onChange={(e) => setReceivingDoctorName(e.target.value)}
              placeholder="Médico receptor"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="email"
              value={receivingDoctorEmail}
              onChange={(e) => setReceivingDoctorEmail(e.target.value)}
              placeholder="Email receptor (opcional)"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Especialidad"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Motivo clínico de derivación"
              rows={3}
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Referencia adjunto (nombre)"
              className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={saving}
              className="px-3 py-1.5 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50"
            >
              {saving ? "Enviando…" : "Crear interconsulta"}
            </button>
          </div>
        </>
      )}
    </section>
  );
}
