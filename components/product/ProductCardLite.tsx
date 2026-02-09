import { Product } from "@/interfaces";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import WishlistButton from "@/components/wishlist/WishlistButton";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import AddToCard from "@/components/addToCart/AddToCard";

function Stars({ value = 0, count = 0 }: { value?: number; count?: number }) {
  const v = Number.isFinite(value) ? value : 0;
  const full = Math.round(v);

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={[
              "h-4 w-4",
              i < full
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30",
            ].join(" ")}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">({count})</span>
    </div>
  );
}

function formatEGP(n?: number) {
  const num = Number(n ?? 0);
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(num);
}

export default function ProductCardLite({ product }: { product: Product }) {
  const pid = String((product as any)._id ?? (product as any).id);

  // safe brand/category (أحيانًا بييجوا string)
  const brandObj = (product as any).brand && typeof (product as any).brand === "object" ? (product as any).brand : null;
  const categoryObj = (product as any).category && typeof (product as any).category === "object" ? (product as any).category : null;

  const brandId = brandObj?._id ? String(brandObj._id) : "";
  const categoryId = categoryObj?._id ? String(categoryObj._id) : "";

  const inStock = (product.quantity ?? 0) > 0;

  const hasDiscount =
    !!product.priceAfterDiscount &&
    Number(product.priceAfterDiscount) < Number(product.price);

  const finalPrice = hasDiscount ? product.priceAfterDiscount : product.price;

  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-background shadow-sm transition hover:shadow-lg">
      {/* Image */}
      <CardHeader className="relative p-0">
        <Link href={`/products/${pid}`} className="block no-underline">
          <div className="relative aspect-square w-full overflow-hidden bg-white">
            <Image
              src={product.imageCover}
              alt={product.title}
              fill
              className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>
        </Link>

        {/* ✅ Wishlist (واحد بس) */}
    <WishlistButton
  productId={String((product as any)._id ?? (product as any).id)}
  className="absolute right-3 top-3 h-10 w-10"
/>

      </CardHeader>

      {/* Content */}
      <CardContent className="flex-1 space-y-3 p-4">
        {/* Brand + Category */}
        <div className="flex items-center justify-between gap-2">
          {brandObj?.name ? (
            brandId ? (
              <Link
                href={`/brands/${brandId}`}
                className="truncate text-xs text-muted-foreground no-underline hover:underline underline-offset-4"
              >
                {brandObj.name}
              </Link>
            ) : (
              <span className="truncate text-xs text-muted-foreground">{brandObj.name}</span>
            )
          ) : (
            <span className="truncate text-xs text-muted-foreground" />
          )}

          {categoryObj?.name ? (
            categoryId ? (
              <Link
                href={`/categories/${categoryId}`}
                className="truncate text-xs text-muted-foreground no-underline hover:underline underline-offset-4"
              >
                {categoryObj.name}
              </Link>
            ) : (
              <span className="truncate text-xs text-muted-foreground">{categoryObj.name}</span>
            )
          ) : (
            <span className="truncate text-xs text-muted-foreground" />
          )}
        </div>

        {/* Title */}
        <Link href={`/products/${pid}`} className="block text-foreground no-underline">
          <p className="line-clamp-2 min-h-[2.6rem] text-sm font-semibold leading-snug hover:underline underline-offset-4">
            {product.title}
          </p>
        </Link>

        {/* Rating + Stock */}
        <div className="flex items-center justify-between gap-3">
          <Stars value={product.ratingsAverage ?? 0} count={product.ratingsQuantity ?? 0} />

          <span className={["text-xs", inStock ? "text-emerald-700" : "text-red-700"].join(" ")}>
            {inStock ? `In stock • ${product.quantity}` : "Out of stock"}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between">
          <p className="text-lg font-bold tracking-tight">{formatEGP(finalPrice as any)}</p>

          {hasDiscount ? (
            <p className="text-sm text-muted-foreground line-through">
              {formatEGP(product.price)}
            </p>
          ) : null}
        </div>
      </CardContent>

      {/* Footer */}
      <CardFooter className="mt-auto p-4 pt-0">
        <AddToCard
          product={product} size="sm"
 className={[
    "h-11 w-full rounded-full",
    "bg-muted text-foreground hover:bg-muted/80",
    "border border-border shadow-none",
  ].join(" ")}
/>
      </CardFooter>
    </Card>
  );
}
