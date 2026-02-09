import BrandDetailsCard from "@/components/brand/BrandDetailsCard";
import ProductCardLite from "@/components/product/ProductCardLite";
import { ApiListResponse, Brand, Product } from "@/interfaces";

async function fetchBrandProducts(brandId: string) {
  const urls = [
    (() => {
      const u = new URL("https://ecommerce.routemisr.com/api/v1/products");
      u.searchParams.set("limit", "24");
      u.searchParams.set("brand", brandId);
      return u.toString();
    })(),
    (() => {
      const u = new URL("https://ecommerce.routemisr.com/api/v1/products");
      u.searchParams.set("limit", "24");
      u.searchParams.set("brand[in]", brandId);
      return u.toString();
    })(),
  ];

  for (const url of urls) {
    const res = await fetch(url, { cache: "no-store" });
    const json: any = await res.json().catch(() => ({}));
    const products: Product[] = json?.data ?? [];
    if (products.length) return products;
  }

  return [];
}

export default async function BrandDetails({ params }: { params: { brandId: string } }) {
  const { brandId } = params;

  const brandRes = await fetch(
    `https://ecommerce.routemisr.com/api/v1/brands/${brandId}`,
    { cache: "no-store" }
  );

  if (!brandRes.ok) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-muted/20 p-10 text-center">
          Brand not found
        </div>
      </section>
    );
  }

  const { data: brand }: { data: Brand } = await brandRes.json();
  const products = await fetchBrandProducts(brandId);

  return (
    <section className="container mx-auto px-4 py-10">
      <BrandDetailsCard brand={brand} productsCount={products.length} />

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-muted/20 p-10 text-center text-muted-foreground">
          No products for this brand.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => {
            const id = String((p as any)._id ?? (p as any).id);
            return <ProductCardLite key={id} product={p} />;
          })}
        </div>
      )}
    </section>
  );
}
