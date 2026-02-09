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

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message ?? `Request failed (${res.status})`);
  return data as T;
}

export type WishlistItem = {
  _id?: string;
  id?: string;
  title: string;
  imageCover: string;
  price: number;
  quantity?: number;
  brand?: { name?: string; _id?: string };
  category?: { name?: string; _id?: string };
};

export type WishlistResponse = {
  count?: number;
  data?: WishlistItem[];
};

export function getWishlist() {
  return api<WishlistResponse>("/wishlist", { method: "GET" });
}

export function removeFromWishlist(productId: string) {
  return api<any>(`/wishlist/${productId}`, { method: "DELETE" });
}
