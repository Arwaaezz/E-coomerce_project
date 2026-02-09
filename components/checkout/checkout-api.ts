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

export type ShippingAddress = { details: string; phone: string; city: string };

export function createCashOrder(cartId: string, shippingAddress: ShippingAddress) {
  return api(`/orders/${cartId}`, {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
}

export function checkoutOnline(cartId: string, shippingAddress: ShippingAddress, returnUrl: string) {
  const q = encodeURIComponent(returnUrl);
  return api(`/orders/checkout-session/${cartId}?url=${q}`, {
    method: "POST",
    body: JSON.stringify({ shippingAddress }),
  });
}
