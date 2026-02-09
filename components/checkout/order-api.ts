const BASE = "https://ecommerce.routemisr.com/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Login required");

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      token,
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.message ?? `Request failed (${res.status})`);
  return data as T;
}

export type ShippingAddress = {
  details: string;
  phone: string;
  city: string;
};

export function getUserOrders(userId: string) {
  return api<any>(`/orders/user/${userId}`, { method: "GET" });
}

// Cash order (مش ظاهر في صفحة routemisr المختصرة، لكنه موجود في Postman عندك)
export function createCashOrder(cartId: string, shippingAddress: ShippingAddress) {
  return api<any>(`/orders/${cartId}`, {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
}

export function checkoutSession(cartId: string, shippingAddress: ShippingAddress) {
  const url = encodeURIComponent(window.location.origin);
  return api<any>(`/orders/checkout-session/${cartId}?url=${url}`, {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
}
