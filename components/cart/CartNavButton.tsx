"use client";

import * as React from "react";
import NavBadge from "@/components/ui/NavBadge";

type CartChangedDetail = { count?: number };

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

export default function CartNavButton() {
  const [count, setCount] = React.useState(0);
  const inflight = React.useRef<AbortController | null>(null);
  const lastFetchAt = React.useRef(0);

  const loadCount = React.useCallback(async (opts?: { force?: boolean }) => {
    const token = getToken();
    if (!token) {
      setCount(0);
      return;
    }

    const now = Date.now();
    // ✅ cooldown فقط لو مش forced
    if (!opts?.force && now - lastFetchAt.current < 800) return;
    lastFetchAt.current = now;

    inflight.current?.abort();
    const ac = new AbortController();
    inflight.current = ac;

    try {
      const res = await fetch("https://ecommerce.routemisr.com/api/v1/cart", {
        method: "GET",
        headers: { token },
        cache: "no-store",
        signal: ac.signal,
      });

      if (res.status === 401 || res.status === 403) {
        try {
          localStorage.removeItem("token");
        } catch {}
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth-changed"));
          window.dispatchEvent(
            new CustomEvent("cart-changed", { detail: { count: 0 } })
          );
        }
        setCount(0);
        return;
      }

      // ✅ لو 500/أي خطأ: ما تصفّرش العداد (خليه آخر قيمة)
      if (!res.ok) return;

      const json = await res.json().catch(() => null);

      const products = json?.data?.products;
      const totalQty = Array.isArray(products)
        ? products.reduce(
            (sum: number, item: any) => sum + Number(item?.count ?? 0),
            0
          )
        : 0;

      const fallback =
        Number(json?.numOfCartItems) ||
        (Array.isArray(products) ? products.length : 0) ||
        0;

      setCount(Number(totalQty || fallback) || 0);
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        // ✅ نفس الفكرة: ما تصفّرش بسبب network glitch
      }
    }
  }, []);

  React.useEffect(() => {
    loadCount();

    const onCartChanged = (ev: Event) => {
      const detail = (ev as CustomEvent<CartChangedDetail>)?.detail;

      // ✅ لو حد بعت count جاهز
      if (typeof detail?.count === "number") {
        setCount(detail.count);
        return;
      }

      // ✅ لو event عادي من غير detail => اعمل fetch forced
      loadCount({ force: true });
    };

    const onAuthChanged = () => loadCount({ force: true });

    window.addEventListener("cart-changed", onCartChanged as any);
    window.addEventListener("auth-changed", onAuthChanged as any);

    // optional (مفيد لو رجعت للتاب)
    window.addEventListener("focus", onAuthChanged);
    document.addEventListener("visibilitychange", onAuthChanged);

    return () => {
      window.removeEventListener("cart-changed", onCartChanged as any);
      window.removeEventListener("auth-changed", onAuthChanged as any);
      window.removeEventListener("focus", onAuthChanged);
      document.removeEventListener("visibilitychange", onAuthChanged);
      inflight.current?.abort();
    };
  }, [loadCount]);

  if (!count) return null;

 return <NavBadge count={count} />;

}
