"use client";

const BASE = "https://ecommerce.routemisr.com/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
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

  // لو token باظ/انتهى
  if (res.status === 401 || res.status === 403) {
    try {
      localStorage.removeItem("token");
    } catch {}
    window.dispatchEvent(new Event("auth-changed"));
    throw new Error("Session expired, please login again.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error((data as any)?.message ?? `Request failed (${res.status})`);
  }

  return data as T;
}

export type Address = {
  _id: string;
  name?: string;     // sometimes alias/name
  details: string;
  phone: string;
  city: string;
};

export type GetAddressesResponse = {
  status?: string;
  results?: number;
  data: Address[];
};

export type AddAddressBody = {
  name?: string;
  details: string;
  phone: string;
  city: string;
};

export type AddAddressResponse = {
  status?: string;
  message?: string;
  data: Address[];
};

export function getAddresses() {
  return api<GetAddressesResponse>("/addresses", { method: "GET" });
}

export function addAddress(body: AddAddressBody) {
  return api<AddAddressResponse>("/addresses", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function removeAddress(addressId: string) {
  return api<AddAddressResponse>(`/addresses/${addressId}`, {
    method: "DELETE",
  });
}
