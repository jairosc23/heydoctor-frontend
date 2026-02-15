export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export interface LoginResponse {
  token: string;
  user: { id: number; email: string; name: string };
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const text = await res.text();
  let data: LoginResponse & { error?: string };
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    throw new Error(
      "El servidor no respondió correctamente. Verifica que la URL del backend esté configurada (NEXT_PUBLIC_API_URL)."
    );
  }

  if (!res.ok) {
    throw new Error(data.error || "Error al iniciar sesión");
  }

  return data as LoginResponse;
}
