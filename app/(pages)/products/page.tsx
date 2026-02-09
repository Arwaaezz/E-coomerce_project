import { ApiListResponse, Product } from "@/interfaces";
import Link from "next/link";

import ProductCard from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";

export default async function ProductsPage() {
  const res = await fetch("https://ecommerce.routemisr.com/api/v1/products", {
    next: { revalidate: 60 },
  });

  const json: ApiListResponse<Product> = await res.json();
  const products = json.data ?? [];

  return (
    <section className="container mx-auto px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">
            Browse all products ({products.length})
          </p>
        </div>

        
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((p) => {
          const pid = (p as any)._id ?? (p as any).id;
          return <ProductCard key={pid} product={p} />;
        })}
      </div>
    </section>
  );
}
