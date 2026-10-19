"use client";

import { useCallback, useMemo } from "react";
import {
  createConsultation,
  startCall,
  type CreateConsultationDto,
  type NestConsultation,
} from "@/lib/services/consultations";
import {
  postConsultationMessage,
  inferAttachmentKind,
  type ConsultationMessage,
  type ConsultationMessageAttachment,
  type CreateConsultationMessageDto,
} from "@/lib/services/consultation-messages";
import {
  createGuestConsultation,
  type CreateGuestConsultationDto,
  type CreateGuestConsultationResult,
} from "@/lib/services/public-consultations";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error ?? new Error("read error"));
    reader.readAsDataURL(file);
  });
}

export type SendConsultationMessagePayload = CreateConsultationMessageDto;

/**
 * API unificada para crear consulta, iniciar llamada, chatear y adjuntar
 * archivos (autenticado o invitado), sin acoplar la UI al contexto del panel.
 */
export function useConsultationEngine() {
  const create = useCallback(
    async (dto: CreateConsultationDto): Promise<NestConsultation> => {
      return createConsultation(dto);
    },
    [],
  );

  const start = useCallback(async (consultationId: string) => {
    return startCall(consultationId);
  }, []);

  const sendMessage = useCallback(
    async (
      consultationId: string,
      payload: SendConsultationMessagePayload,
    ): Promise<ConsultationMessage | null> => {
      return postConsultationMessage(consultationId, payload);
    },
    [],
  );

  const attachFile = useCallback(
    async (
      file: File,
      maxBytes = 4 * 1024 * 1024,
    ): Promise<ConsultationMessageAttachment> => {
      if (file.size > maxBytes) {
        throw new Error(
          `El archivo supera el máximo (${Math.round(maxBytes / 1024 / 1024)} MB).`,
        );
      }
      const mime = file.type || "application/octet-stream";
      const dataUrl = await readFileAsDataUrl(file);
      const kind = inferAttachmentKind(mime, file.name);
      return {
        name: file.name,
        mimeType: mime,
        size: file.size,
        kind,
        dataUrl,
      };
    },
    [],
  );

  const sendWithAttachment = useCallback(
    async (
      consultationId: string,
      body: string,
      file: File | null,
      sender: NonNullable<CreateConsultationMessageDto["sender"]> = "doctor",
      maxBytes = 4 * 1024 * 1024,
    ): Promise<ConsultationMessage | null> => {
      const attachment = file ? await attachFile(file, maxBytes) : undefined;
      return postConsultationMessage(consultationId, {
        body,
        attachment: attachment ?? null,
        sender,
      });
    },
    [attachFile],
  );

  const createGuest = useCallback(
    async (
      dto: CreateGuestConsultationDto,
    ): Promise<CreateGuestConsultationResult> => {
      return createGuestConsultation(dto);
    },
    [],
  );

  return useMemo(
    () => ({
      createConsultation: create,
      startCall: start,
      sendMessage,
      attachFile,
      sendMessageWithAttachment: sendWithAttachment,
      createGuestConsultation: createGuest,
    }),
    [create, start, sendMessage, attachFile, sendWithAttachment, createGuest],
  );
}
