"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  bgSrc?: string; // مثال: "/hero.jpg" في public
};

export default function Hero({ bgSrc }: Props) {
  return (
    <section className="relative overflow-hidden rounded-3xl border bg-background">
      {/* Background */}
      <div className="absolute inset-0">
        {bgSrc ? (
          <Image
            src={bgSrc}
            alt="Hero background"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        ) : null}

        {/* overlay + subtle gradients */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/90 to-background" />
        <div className="absolute -top-28 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
        <div className="absolute -bottom-32 left-1/2 h-80 w-[900px] -translate-x-1/2 rounded-full bg-black/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-4xl px-6 py-14 text-center md:px-10 md:py-20">
        <span className="mx-auto mb-4 inline-flex w-fit items-center rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-foreground/80 backdrop-blur">
          ✨ New deals • Fast delivery • Secure checkout
        </span>

        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          Welcome to <span className="underline underline-offset-8">ShopMart</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
          Discover the latest technology, fashion, and lifestyle products.
          Quality guaranteed with fast shipping and excellent customer service.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="h-11 rounded-full px-6">
            <Link href="/products" className="flex items-center gap-2">
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" className="h-11 rounded-full px-6">
            <Link href="/categories">Browse Categories</Link>
          </Button>
        </div>

        {/* Trust chips */}
        <div className="mx-auto mt-10 grid max-w-3xl gap-3 text-sm text-muted-foreground sm:grid-cols-3">
          <div className="flex items-center justify-center gap-2 rounded-2xl border bg-background/60 px-4 py-3 backdrop-blur">
            <Truck className="h-4 w-4 text-foreground" />
            <span>Fast delivery</span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl border bg-background/60 px-4 py-3 backdrop-blur">
            <ShieldCheck className="h-4 w-4 text-foreground" />
            <span>Secure checkout</span>
          </div>

          <div className="flex items-center justify-center gap-2 rounded-2xl border bg-background/60 px-4 py-3 backdrop-blur">
            <RotateCcw className="h-4 w-4 text-foreground" />
            <span>Easy returns</span>
          </div>
        </div>
      </div>
    </section>
  );
}
