export type RecordingApiInput = {
  backendOrigin: string;
  consultationId: string;
  userConsent: boolean;
  /** Si false, la política indica que no se exige consentimiento explícito (por defecto true). */
  consentRequired?: boolean;
};

export async function requestRecordingStart(
  input: RecordingApiInput,
): Promise<void> {
  const url = new URL(
    '/api/webrtc/recording/start',
    input.backendOrigin.replace(/\/$/, ''),
  );
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      consultationId: input.consultationId,
      userConsent: input.userConsent,
      consentRequired: input.consentRequired !== false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`recording/start ${res.status}: ${text.slice(0, 160)}`);
  }
}

export async function requestRecordingStop(
  input: RecordingApiInput,
): Promise<void> {
  const url = new URL(
    '/api/webrtc/recording/stop',
    input.backendOrigin.replace(/\/$/, ''),
  );
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      consultationId: input.consultationId,
      userConsent: input.userConsent,
      consentRequired: input.consentRequired !== false,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`recording/stop ${res.status}: ${text.slice(0, 160)}`);
  }
}
