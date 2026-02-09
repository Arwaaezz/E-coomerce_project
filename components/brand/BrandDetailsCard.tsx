import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/interfaces";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function BrandDetailsCard({
  brand,
  productsCount,
}: {
  brand: Brand;
  productsCount?: number;
}) {
  if (!brand) return null;

  return (
    <Card className="rounded-2xl border bg-background shadow-sm">
      <div className="flex items-center gap-4 p-6">
        {/* Logo */}
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border bg-white">
          <Image
            src={brand.image || "/placeholder.png"}
            alt={brand.name || "Brand"}
            fill
            className="object-contain p-3"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          {/* Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
              Brand
            </span>

            {typeof productsCount === "number" ? (
              <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                {productsCount} products
              </span>
            ) : null}
          </div>

          {/* Title + Back */}
          <div className="mt-2 flex items-center justify-between gap-3">
            <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">
              {brand.name}
            </h1>

            <Button asChild variant="outline" size="sm" className="rounded-full">
              <Link href="/brands" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
          </div>

          {/* Subtitle */}
          <p className="mt-1 text-sm text-muted-foreground">
            Products from this brand
          </p>
        </div>
      </div>
    </Card>
  );
}
