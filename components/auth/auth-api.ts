const BASE = "https://ecommerce.routemisr.com/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function changePasswordApi(body: {
  currentPassword: string;
  password: string;
  rePassword: string;
}) {
  const token = getToken();
  if (!token) throw new Error("Login required");

  const res = await fetch(`${BASE}/users/changeMyPassword`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      token,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data?.message ?? `Request failed (${res.status})`);
  return data;
}
