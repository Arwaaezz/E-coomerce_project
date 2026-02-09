import { ApiListResponse, Brand } from "@/interfaces";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function BrandsPage() {
  const res = await fetch("https://ecommerce.routemisr.com/api/v1/brands", {
    next: { revalidate: 300 },
  });

  const json: ApiListResponse<Brand> = await res.json();
  const brands = json.data ?? [];

  return (
    <section className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold">Brands</h1>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {brands.map((b) => {
          const bid = (b as any)._id ?? (b as any).id;

          return (
            <Card key={bid} className="group overflow-hidden rounded-2xl">
              <CardHeader className="p-0">
                <Link href={`/brands/${bid}`} className="block">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                    <Image
                      src={b.image}
                      alt={b.name}
                      fill
                      className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                </Link>
              </CardHeader>

              <CardContent className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold">{b.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{b.slug}</p>
                </div>

                <Button asChild size="sm" className="rounded-full">
                  <Link href={`/brands/${bid}`}>View</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
