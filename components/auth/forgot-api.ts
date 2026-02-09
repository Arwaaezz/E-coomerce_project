const BASE = "https://ecommerce.routemisr.com/api/v1";

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.message ?? `Request failed (${res.status})`);
  return data as T;
}

export function forgotPassword(email: string) {
  return jsonFetch(`${BASE}/auth/forgotPassword`, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyResetCode(resetCode: string) {
  return jsonFetch(`${BASE}/auth/verifyResetCode`, {
    method: "POST",
    body: JSON.stringify({ resetCode }),
  });
}

export function resetPassword(email: string, newPassword: string) {
  return jsonFetch(`${BASE}/auth/resetPassword`, {
    method: "PUT",
    body: JSON.stringify({ email, newPassword }),
  });
}
