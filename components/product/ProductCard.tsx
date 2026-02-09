import { Product } from "@/interfaces";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star } from "lucide-react";
import WishlistButton from "@/components/wishlist/WishlistButton";

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AddToCard from "@/components/addToCart/AddToCard";

function Stars({ value = 0 }: { value?: number }) {
  const v = Number.isFinite(value) ? value : 0;
  const full = Math.floor(v);
  const hasHalf = v - full >= 0.5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = i < full ? 1 : i === full && hasHalf ? 0.5 : 0;
          return (
            <span key={i} className="relative inline-block h-4 w-4">
              <Star className="h-4 w-4 text-muted-foreground/40" />
              {fill > 0 && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fill * 100}%` }}
                >
                  <Star className="h-4 w-4 fill-current text-foreground" />
                </span>
              )}
            </span>
          );
        })}
      </div>
      <span className="text-sm text-muted-foreground">{v.toFixed(1)}</span>
    </div>
  );
}

export default function ProductCard({ product }: { product: Product }) {
  const pid = (product as any)._id ?? (product as any).id;
  const inStock = (product.quantity ?? 0) > 0;

  const hasDiscount =
    !!product.priceAfterDiscount &&
    Number(product.priceAfterDiscount) < Number(product.price);

  const discountPct =
    hasDiscount && product.price
      ? Math.round(
          ((Number(product.price) - Number(product.priceAfterDiscount)) /
            Number(product.price)) *
            100
        )
      : null;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-3xl border bg-background transition hover:shadow-lg">
      {/* ✅ Smaller image height بدل aspect-square */}
      <CardHeader className="relative p-0">
        <Link href={`/products/${pid}`} className="block">
          <div className="relative h-48 w-full overflow-hidden bg-muted/20 sm:h-52">
            <Image
              src={product.imageCover}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 opacity-0 transition group-hover:opacity-100" />

            {/* badges */}
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {product.category?.name ? (
                <span className="rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                  {product.category.name}
                </span>
              ) : null}

              {product.brand?.name ? (
                <span className="rounded-full bg-background/85 px-2.5 py-1 text-[11px] font-medium backdrop-blur">
                  {product.brand.name}
                </span>
              ) : null}

              {!inStock ? (
                <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  Out of stock
                </span>
              ) : null}

              {discountPct ? (
                <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white">
                  -{discountPct}%
                </span>
              ) : null}
            </div>
          </div>
        </Link>

        {/* wishlist */}
       {/* wishlist */}
<div className="absolute right-3 top-3">
  <WishlistButton
    productId={pid}
    className="h-9 w-9 rounded-full bg-background/80 backdrop-blur hover:bg-background"
  />
</div>

      </CardHeader>

      {/* ✅ أقل padding + عنوان ثابت سطرين */}
      <CardContent className="flex-1 space-y-3 p-4">
        <div className="min-w-0">
          <p className="line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-snug">
            {product.title}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {product.category?.name ?? ""}
            {product.brand?.name ? ` • ${product.brand.name}` : ""}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Stars value={product.ratingsAverage ?? 0} />
          <span className="text-xs text-muted-foreground">
            ({product.ratingsQuantity ?? 0})
          </span>
        </div>

        {/* ✅ Price block أصغر ومتساوي في الارتفاع حتى لو مفيش خصم */}
        <div className="rounded-2xl border bg-muted/20 p-3">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Price</p>

              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-lg font-semibold tracking-tight">
                  {hasDiscount ? product.priceAfterDiscount : product.price}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    EGP
                  </span>
                </p>

                <p
                  className={[
                    "text-sm text-muted-foreground line-through",
                    hasDiscount ? "" : "opacity-0",
                  ].join(" ")}
                >
                  {product.price} EGP
                </p>
              </div>
            </div>

            <span
              className={[
                "text-xs",
                inStock ? "text-emerald-700" : "text-red-700",
              ].join(" ")}
            >
              {inStock ? `In stock • ${product.quantity}` : "Out of stock"}
            </span>
          </div>
        </div>
      </CardContent>

      {/* ✅ Footer أصغر + الزرار مثبت تحت */}
      <CardFooter className="mt-auto p-4 pt-0">
        <div className="w-full">
          <AddToCard product={product} />
        </div>
      </CardFooter>
    </Card>
  );
}
