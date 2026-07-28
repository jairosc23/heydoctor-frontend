import { w3Fetch } from "@/lib/w3/w3-http";

export async function w3CollabOpen(
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/collab/workspace/open", {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_COLLAB",
  });
  return res.json();
}

export async function w3CollabGetWorkspace(
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const q = new URLSearchParams({ consultationId });
  const res = await w3Fetch(`/api/w3/collab/workspace?${q}`, {
    method: "GET",
    fetcher,
    baseUrl,
    domainPrefix: "W3_COLLAB",
  });
  return res.json();
}

export async function w3CollabCreateTask(
  input: {
    consultationId: string;
    title: string;
    detail?: string;
    assigneeUserId?: string;
  },
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch("/api/w3/collab/tasks", {
    method: "POST",
    body: JSON.stringify(input),
    fetcher,
    baseUrl,
    domainPrefix: "W3_COLLAB",
  });
  return res.json();
}

export async function w3CollabCompleteTask(
  taskId: string,
  consultationId: string,
  fetcher: typeof fetch = fetch,
  baseUrl = "",
) {
  const res = await w3Fetch(`/api/w3/collab/tasks/${taskId}/complete`, {
    method: "POST",
    body: JSON.stringify({ consultationId }),
    fetcher,
    baseUrl,
    domainPrefix: "W3_COLLAB",
  });
  return res.json();
}
