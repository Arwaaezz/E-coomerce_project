"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, Trash2 } from "lucide-react";
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
  type CartProductLine,
  type CartResponse,
} from "./cart-api";

function sumCounts(items: CartProductLine[]) {
  return items.reduce((s, it) => s + (Number(it.count) || 0), 0);
}

function cartCountFromResponse(cart: CartResponse | null | undefined) {
  const products = cart?.data?.products;
  if (Array.isArray(products)) return sumCounts(products);

  // fallback (لو الـ API رجّع numOfCartItems)
  const n = Number(cart?.numOfCartItems);
  return Number.isFinite(n) ? n : 0;
}

function notifyCartChanged(cart: CartResponse | null | undefined) {
  const count = cartCountFromResponse(cart);
  window.dispatchEvent(
    new CustomEvent("cart-changed", { detail: { count } })
  );
}

export default function CartClient() {
  const [cart, setCart] = React.useState<CartResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const items = cart?.data?.products ?? [];
  const itemsCount = sumCounts(items);
  const subtotal = Number(cart?.data?.totalCartPrice ?? 0) || 0;

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const c = await getCart();
      setCart(c);

      // ✅ أول ما تحمل الكارت: حدّث badge فورًا
      notifyCartChanged(c);
    } catch (e: any) {
      setCart(null);
      setError(e?.message ?? "Failed to load cart");
      // لو فشل التحميل ما تصفّرش هنا، سيب الـ navbar زي ما هو
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function changeQty(line: CartProductLine, next: number) {
    const productId = (line.product as any)._id ?? (line.product as any).id;
    if (!productId) return;

    if (next < 1) {
      await onRemove(productId);
      return;
    }

    try {
      setBusyId(productId);
      const updated = await updateCartItem(productId, next);
      setCart(updated);

      // ✅ ابعت count جاهز
      notifyCartChanged(updated);
    } catch (e: any) {
      alert(e?.message ?? "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onRemove(productId: string) {
    try {
      setBusyId(productId);
      const updated = await removeCartItem(productId);
      setCart(updated);

      // ✅ ابعت count جاهز
      notifyCartChanged(updated);
    } catch (e: any) {
      alert(e?.message ?? "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  async function onClear() {
    try {
      setBusyId("CLEAR");
      const updated = await clearCart();
      setCart(updated);

      // ✅ غالبًا الكارت فاضي
      notifyCartChanged(updated);
    } catch (e: any) {
      alert(e?.message ?? "Clear failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Your Cart</h1>
          <p className="text-sm text-muted-foreground">
            {itemsCount} item{itemsCount === 1 ? "" : "s"} in your cart
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-full">
          <Link href="/products">← Continue shopping</Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : error ? (
        <Card className="rounded-2xl">
          <CardContent className="p-6">
            <p className="font-medium">Cart</p>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>

            <div className="mt-4 flex gap-2">
              <Button asChild className="rounded-full">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/products">Browse products</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="rounded-2xl">
          <CardContent className="p-10 text-center">
            <p className="text-lg font-semibold">Your cart is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add products to see them here.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {items.map((line) => {
              const productId =
                (line.product as any)._id ?? (line.product as any).id;
              const busy = busyId === productId;

              const price = Number(line.price ?? line.product.price ?? 0) || 0;
              const qty = Number(line.count ?? 0) || 0;
              const lineTotal = price * qty;

              return (
                <Card key={productId} className="rounded-2xl">
                  <CardContent className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white">
                        <Image
                          src={line.product.imageCover}
                          alt={line.product.title}
                          fill
                          sizes="64px"
                          className="object-contain p-2"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {line.product.title}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {line.product.brand?.name
                            ? `${line.product.brand.name} • `
                            : ""}
                          {line.product.category?.name ?? ""}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                          <p className="text-sm text-muted-foreground">
                            {price.toFixed(2)} EGP
                          </p>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-full border bg-background px-2 py-1">
                              <button
                                className="h-8 w-8 rounded-full hover:bg-muted disabled:opacity-50"
                                disabled={busy}
                                onClick={() => changeQty(line, qty - 1)}
                              >
                                –
                              </button>
                              <span className="w-10 text-center text-sm font-medium">
                                {qty}
                              </span>
                              <button
                                className="h-8 w-8 rounded-full hover:bg-muted disabled:opacity-50"
                                disabled={busy}
                                onClick={() => changeQty(line, qty + 1)}
                              >
                                +
                              </button>
                            </div>

                            <button
                              className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline disabled:opacity-50"
                              disabled={busy}
                              onClick={() => onRemove(productId)}
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-2 text-right text-sm text-muted-foreground">
                          Item total:{" "}
                          <span className="font-semibold text-foreground">
                            {lineTotal.toFixed(2)} EGP
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="h-fit rounded-2xl">
            <CardHeader className="pb-0">
              <p className="text-xl font-semibold">Summary</p>
              <p className="text-sm text-muted-foreground">Review your order</p>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span className="font-medium">{itemsCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-lg font-semibold">
                  {subtotal.toFixed(2)} EGP
                </span>
              </div>

              <p className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                Shipping & taxes are calculated at checkout.
              </p>

           <Button asChild className="h-11 w-full rounded-full font-semibold">
  <Link href="/checkout">Checkout</Link>
</Button>


              <Button
                variant="outline"
                className="h-11 w-full rounded-full"
                disabled={busyId === "CLEAR"}
                onClick={onClear}
              >
                {busyId === "CLEAR" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  "Clear cart"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
