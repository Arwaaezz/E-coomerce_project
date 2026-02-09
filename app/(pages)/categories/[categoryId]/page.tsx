import { ApiListResponse, Category, Product } from "@/interfaces";
import ProductCardLite from "@/components/product/ProductCardLite";

async function fetchCategoryProducts(categoryId: string) {
  // جرّب أكتر من شكل للفلترة (حسب الـ API)
  const tryUrls = [
    (() => {
      const u = new URL("https://ecommerce.routemisr.com/api/v1/products");
      u.searchParams.set("limit", "24");
      u.searchParams.set("category[in]", categoryId);
      return u.toString();
    })(),
    (() => {
      const u = new URL("https://ecommerce.routemisr.com/api/v1/products");
      u.searchParams.set("limit", "24");
      u.searchParams.set("category", categoryId);
      return u.toString();
    })(),
  ];

  for (const url of tryUrls) {
    const res = await fetch(url, { cache: "no-store" });
    const json: any = await res.json().catch(() => ({}));
    const products: Product[] = json?.data ?? [];
    if (products.length) return products;
  }

  return [];
}

export default async function CategoryDetails({ params }: { params: { categoryId: string } }) {
  const { categoryId } = params;

  const catRes = await fetch(
    `https://ecommerce.routemisr.com/api/v1/categories/${categoryId}`,
    { cache: "no-store" }
  );

  if (!catRes.ok) {
    return (
      <section className="container mx-auto px-4 py-10">
        <div className="rounded-2xl border bg-muted/20 p-10 text-center">
          Category not found
        </div>
      </section>
    );
  }

  const { data: category }: { data: Category } = await catRes.json();
  const products = await fetchCategoryProducts(categoryId);

  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="text-4xl font-semibold">{category.name}</h1>
      <p className="mt-1 text-muted-foreground">Products from this category</p>

      {products.length === 0 ? (
        <div className="mt-10 rounded-2xl border bg-muted/20 p-10 text-center text-muted-foreground">
          No products for this category.
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
