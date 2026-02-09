import React from "react";
import { Product } from "@/interfaces";
import { Params } from "next/dist/server/request/params";
import WishlistButton from "@/components/wishlist/WishlistButton";

import ProductGallery from "@/components/product/ProductGallery";

import { Button } from "@/components/ui/button";
import { Heart, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default async function Details({ params }: { params: Params }) {
  // ✅ زي ما انتي عاملة (بدون تعديل)
  let { productId } = await params;

  const response = await fetch(
    "https://ecommerce.routemisr.com/api/v1/products/" + productId,
    { cache: "no-store" }
  );

  const { data: product }: { data: Product } = await response.json();

  const gallery = [product.imageCover, ...(product.images ?? [])];

  return (
    <section className="container mx-auto px-4 py-10">
      <Card className="mx-auto w-full max-w-6xl overflow-hidden rounded-3xl border bg-background shadow-sm">
        <div className="grid gap-0 md:grid-cols-2">
          {/* Left: Gallery */}
          <div className="border-b p-4 md:border-b-0 md:border-r md:p-6">
            <ProductGallery images={gallery} title={product.title} />
          </div>

          {/* Right: Info */}
          <div className="p-6 md:p-8">
            <CardHeader className="p-0">
              <div className="flex flex-wrap items-center gap-2">
                {product.brand?.name && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {product.brand.name}
                  </span>
                )}
                {product.category?.name && (
                  <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                    {product.category.name}
                  </span>
                )}
                <span
                  className={[
                    "rounded-full px-3 py-1 text-xs",
                    product.quantity > 0
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-red-500/10 text-red-700",
                  ].join(" ")}
                >
                  {product.quantity > 0 ? `In stock • ${product.quantity}` : "Out of stock"}
                </span>
              </div>

              <CardTitle className="mt-4 text-2xl leading-snug md:text-3xl">
                {product.title}
              </CardTitle>

              <CardDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-6 space-y-5 p-0">
              {/* Rating + wishlist */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Stars value={product.ratingsAverage ?? 0} />
                  <span className="text-sm text-muted-foreground">
                    ({product.ratingsQuantity ?? 0})
                  </span>
                </div>

          <WishlistButton
  productId={String((product as any)._id ?? (product as any).id)}
  className="h-10 w-10 rounded-full border bg-background hover:bg-muted"
/>

              </div>

              {/* Price block */}
              <div className="rounded-2xl border bg-muted/20 p-4">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="mt-1 text-3xl font-semibold tracking-tight">
                      {product.price}
                      <span className="ml-2 text-sm font-normal text-muted-foreground">EGP</span>
                    </p>
                    {product.priceAfterDiscount ? (
                      <p className="mt-1 text-sm text-muted-foreground">
                        After discount:{" "}
                        <span className="font-medium text-foreground">
                          {product.priceAfterDiscount} EGP
                        </span>
                      </p>
                    ) : null}
                  </div>

                  {/* <div className="text-right">
                    <p className="text-sm text-muted-foreground">Sold</p>
                    <p className="mt-1 text-lg font-semibold">{product.sold ?? 0}</p>
                  </div> */}
                </div>
              </div>
            </CardContent>

<AddToCard product={product} />
          </div>
        </div>
      </Card>
    </section>
  );
}
