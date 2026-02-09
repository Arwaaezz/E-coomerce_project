import { ApiListResponse, Category } from "@/interfaces";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CategoriesPage() {
  const res = await fetch("https://ecommerce.routemisr.com/api/v1/categories", {
    next: { revalidate: 300 },
  });

  const json: ApiListResponse<Category> = await res.json();
  const categories = json.data ?? [];

  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold">Categories</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => {
          const cid = (c as any)._id ?? (c as any).id;

          return (
            <Card key={cid} className="group overflow-hidden rounded-2xl">
              <CardHeader className="p-0">
                <Link href={`/categories/${cid}`} className="block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/20">
                <Image
  src={c.image ?? "/placeholder.png"}
  alt={c.name ?? "Category"}
  fill
  className="object-cover transition-transform duration-300 group-hover:scale-105"
/>

                  </div>
                </Link>
              </CardHeader>

              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.slug}</p>
                </div>

                <Button asChild size="sm" className="rounded-full">
                  <Link href={`/categories/${cid}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
