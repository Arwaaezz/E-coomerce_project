"use client";

import * as React from "react";
import { Product } from "@/interfaces";
import { Button } from "@/components/ui/button";
import { Loader2, ShoppingCart, LogIn } from "lucide-react";
import { Toast } from "@/components/ui/toast";
import { usePathname, useRouter } from "next/navigation";

type Props = {
  product: Product;
  className?: string;
  size?: "sm" | "md";
};

function getToken() {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("token");
  } catch {
    return null;
  }
}

function computeCartCount(payload: any) {
  const products = payload?.data?.products;
  if (Array.isArray(products)) {
    const totalQty = products.reduce((s: number, it: any) => s + Number(it?.count ?? 0), 0);
    return Number(totalQty) || products.length || 0;
  }
  return Number(payload?.numOfCartItems ?? 0) || 0;
}

export default function AddToCard({ product, className = "", size = "md" }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const [variant, setVariant] = React.useState<"default" | "success" | "error">("default");
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState<string | undefined>();

  const inStock = (product.quantity ?? 0) > 0;

  const showToast = React.useCallback((v: "default" | "success" | "error", t: string, d?: string) => {
    setVariant(v);
    setTitle(t);
    setDescription(d);
    setOpen(false);
    requestAnimationFrame(() => setOpen(true));
  }, []);

  async function addProductToCart() {
    if (!inStock || loading) return;

    const token = getToken();

    // ✅ لو مش عامل login: روح للـ login
    if (!token) {
      showToast("error", "Login required", "Please login first to add items.");
      const next = encodeURIComponent(pathname || "/");
      setTimeout(() => router.push(`/login?next=${next}`), 350);
      return;
    }

    const productId = (product as any)?._id ?? (product as any)?.id;
    if (!productId) {
      showToast("error", "Invalid product", "Product id is missing.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://ecommerce.routemisr.com/api/v1/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          token,
        },
        body: JSON.stringify({ productId }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        showToast("error", "Failed", data?.message ?? `Error ${res.status}`);
        return;
      }

      // ✅ حدّث badge فوراً
      const count = computeCartCount(data);
      window.dispatchEvent(new CustomEvent("cart-changed", { detail: { count } }));

      showToast("success", "Added to cart ✅", "Product added successfully.");
    } catch {
      showToast("error", "Something went wrong", "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const sizeClass = size === "sm" ? "h-10 text-sm" : "h-11 text-sm";

  return (
    <>
      <Button
        onClick={addProductToCart}
        disabled={!inStock || loading}
        className={[
      "h-11 w-full rounded-full font-semibold shadow-sm",
    "bg-primary text-primary-foreground hover:bg-primary/90",
    "disabled:opacity-60",

          className,
        ].join(" ")}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding...
          </>
        ) : !inStock ? (
          "Out of stock"
        ) : (
          <>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>

      <Toast open={open} onOpenChange={setOpen} title={title} description={description} variant={variant} />
    </>
  );
}
