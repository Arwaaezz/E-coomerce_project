import Link from "next/link";
import { ApiListResponse, Product } from "@/interfaces";
import ProductCardLite from "@/components/product/ProductCardLite";
import { Button } from "@/components/ui/button";

async function getTopProducts() {
  // ✅ نجيب منتجات كتير ونرتب بالـ rating + sold محلياً (مضمونة)
  const res = await fetch("https://ecommerce.routemisr.com/api/v1/products?limit=40", {
    next: { revalidate: 120 },
  });

  if (!res.ok) return [];

  const json: ApiListResponse<Product> = await res.json();
  const products = json.data ?? [];

  const sorted = [...products].sort((a: any, b: any) => {
    const ar = Number(a?.ratingsAverage ?? 0);
    const br = Number(b?.ratingsAverage ?? 0);
    if (br !== ar) return br - ar;

    const as = Number(a?.sold ?? 0);
    const bs = Number(b?.sold ?? 0);
    return bs - as;
  });

  return sorted.slice(0, 8);
}

export default async function TopProducts() {
  const products = await getTopProducts();

  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Top Products</h2>
          <p className="text-sm text-muted-foreground">
            Best rated picks for you
          </p>
        </div>

        <Button asChild variant="outline" className="rounded-full">
          <Link href="/products">View all</Link>
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border bg-muted/20 p-10 text-center text-muted-foreground">
          No products to show right now.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p: any) => (
            <ProductCardLite key={String(p?._id ?? p?.id)} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
