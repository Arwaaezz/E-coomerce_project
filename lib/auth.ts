const BASE = "https://ecommerce.routemisr.com/api/v1";

async function safeJson(res: Response) {
  try { return await res.json(); } catch { return null; }
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
  rePassword: string;
  phone: string;
}) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Signup failed");
  return data; // غالبًا بيرجع token
}

export async function signin(payload: { email: string; password: string }) {
  const res = await fetch(`${BASE}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Signin failed");
  return data; // token
}

export async function forgotPassword(email: string) {
  const res = await fetch(`${BASE}/auth/forgotPasswords`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Forgot password failed");
  return data;
}

export async function verifyResetCode(resetCode: string) {
  const res = await fetch(`${BASE}/auth/verifyResetCode`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resetCode }),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Verify code failed");
  return data;
}

export async function resetPassword(payload: { email: string; newPassword: string }) {
  const res = await fetch(`${BASE}/auth/resetPassword`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Reset password failed");
  return data; // sometimes returns token
}

export async function changePassword(payload: { currentPassword: string; password: string; rePassword: string }, token: string) {
  const res = await fetch(`${BASE}/users/changeMyPassword`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify(payload),
  });
  const data = await safeJson(res);
  if (!res.ok) throw new Error(data?.message || "Change password failed");
  return data; // may return new token
}
