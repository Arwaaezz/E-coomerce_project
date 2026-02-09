"use client";

import * as React from "react";

const BASE = "https://ecommerce.routemisr.com/api/v1";

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

async function api(path: string, init?: RequestInit) {
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
  return data;
}

type Ctx = {
  ids: Set<string>;
  loading: boolean;
  isInWishlist: (id: string) => boolean;
  toggle: (id: string) => Promise<void>;
  busyId: string | null;
  reload: () => Promise<void>;
};

const WishlistContext = React.createContext<Ctx | null>(null);

export function useWishlist() {
  const ctx = React.useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = React.useState<Set<string>>(new Set());
  const [loading, setLoading] = React.useState(false);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    const token = getToken();
    if (!token) {
      setIds(new Set());
      return;
    }

    try {
      setLoading(true);
      const res = await api("/wishlist", { method: "GET" });
      const next = new Set<string>((res?.data ?? []).map((p: any) => String(p?._id ?? p?.id)));
      setIds(next);
    } catch {
      setIds(new Set());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();

    const onAuth = () => reload();
    const onWishlistChanged = () => reload();

    window.addEventListener("auth-changed", onAuth as any);
    window.addEventListener("wishlist-changed", onWishlistChanged as any);

    return () => {
      window.removeEventListener("auth-changed", onAuth as any);
      window.removeEventListener("wishlist-changed", onWishlistChanged as any);
    };
  }, [reload]);

  const isInWishlist = React.useCallback((id: string) => ids.has(String(id)), [ids]);

  const toggle = React.useCallback(
    async (id: string) => {
      const pid = String(id);
      const token = getToken();
      if (!token) throw new Error("Login required");

      const currentlyIn = ids.has(pid);

      try {
        setBusyId(pid);

        // optimistic
        setIds((prev) => {
          const copy = new Set(prev);
          if (copy.has(pid)) copy.delete(pid);
          else copy.add(pid);
          return copy;
        });

        if (currentlyIn) {
          await api(`/wishlist/${pid}`, { method: "DELETE" });
        } else {
          await api("/wishlist", {
            method: "POST",
            body: JSON.stringify({ productId: pid }),
          });
        }

        window.dispatchEvent(new Event("wishlist-changed"));
      } catch (e) {
        await reload(); // rollback
        throw e;
      } finally {
        setBusyId(null);
      }
    },
    [ids, reload]
  );

  const value: Ctx = { ids, loading, isInWishlist, toggle, busyId, reload };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
