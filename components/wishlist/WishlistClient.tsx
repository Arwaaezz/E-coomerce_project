"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWishlist, removeFromWishlist, type WishlistItem } from "./wishlist-api";
import { useWishlist } from "@/components/wishlist/WishlistProvider";

export default function WishlistClient() {
  const { reload } = useWishlist();
  const [items, setItems] = React.useState<WishlistItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      setLoading(true);
      const res = await getWishlist();
      setItems(res?.data ?? []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message ?? "Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function onRemove(productId: string) {
    try {
      setBusyId(productId);
      await removeFromWishlist(productId);

      // ✅ update local list
      setItems((prev) => prev.filter((x) => String(x._id ?? x.id) !== String(productId)));

      // ✅ update provider + navbar badge
      await reload();
      window.dispatchEvent(new Event("wishlist-changed"));
    } catch (e: any) {
      alert(e?.message ?? "Remove failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Wishlist</h1>
          <p className="text-sm text-muted-foreground">
            Your saved items ({items.length})
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
            <p className="font-medium">Wishlist</p>
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
            <p className="text-lg font-semibold">Your wishlist is empty</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tap the heart icon to save products.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link href="/products">Browse products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((p) => {
            const id = String(p._id ?? p.id);
            const busy = busyId === id;

            return (
              <Card key={id} className="rounded-2xl">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <Link href={`/products/${id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border bg-white">
                      <Image
                        src={p.imageCover}
                        alt={p.title}
                        fill
                        className="object-contain p-2"
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link href={`/products/${id}`} className="truncate font-semibold hover:underline underline-offset-4 block">
                        {p.title}
                      </Link>

                      <p className="mt-1 text-xs text-muted-foreground truncate">
                        {p.brand?.name ? `${p.brand.name} • ` : ""}
                        {p.category?.name ?? ""}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">{p.price} EGP</p>

                        <button
                          className="inline-flex items-center gap-2 text-sm text-red-600 hover:underline disabled:opacity-50"
                          disabled={busy}
                          onClick={() => onRemove(id)}
                        >
                          {busy ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
