const BASE = "https://ecommerce.routemisr.com/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function computeCartCount(payload: any) {
  const products = payload?.data?.products;
  if (Array.isArray(products)) {
    const totalQty = products.reduce(
      (s: number, it: any) => s + Number(it?.count ?? 0),
      0
    );
    return Number(totalQty) || products.length || 0;
  }
  return Number(payload?.numOfCartItems ?? 0) || 0;
}

function emitCartChanged(payload: any) {
  if (typeof window === "undefined") return;
  const count = computeCartCount(payload);
  window.dispatchEvent(new CustomEvent("cart-changed", { detail: { count } }));
}

async function api<T>(
  path: string,
  init?: RequestInit,
  opts?: { emitCart?: boolean }
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Login required");

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      token,
      // خلي Content-Type بس لو فيه body
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    // توكن بايظ/منتهي
    try {
      localStorage.removeItem("token");
    } catch {}
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth-changed"));
      window.dispatchEvent(new CustomEvent("cart-changed", { detail: { count: 0 } }));
    }
  }

  if (!res.ok) {
    throw new Error(data?.message ?? `Request failed (${res.status})`);
  }

  // ✅ ابعت event لو المطلوب
  if (opts?.emitCart) emitCartChanged(data);

  return data as T;
}

export type CartProductLine = {
  count: number;
  price: number;
  product: {
    _id?: string;
    id?: string;
    title: string;
    imageCover: string;
    price: number;
    category?: { name?: string };
    brand?: { name?: string };
  };
};

export type CartResponse = {
  numOfCartItems?: number;
  data?: {
    totalCartPrice?: number;
    products?: CartProductLine[];
  };
};

export function getCart() {
  return api<CartResponse>("/cart", { method: "GET" });
}

export function updateCartItem(productId: string, count: number) {
  return api<CartResponse>(
    `/cart/${productId}`,
    { method: "PUT", body: JSON.stringify({ count }) },
    { emitCart: true }
  );
}

export function removeCartItem(productId: string) {
  return api<CartResponse>(
    `/cart/${productId}`,
    { method: "DELETE" },
    { emitCart: true }
  );
}

export function clearCart() {
  return api<CartResponse>(
    "/cart",
    { method: "DELETE" },
    { emitCart: true }
  );
}
