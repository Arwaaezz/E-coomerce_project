import Hero from "@/components/home/Hero";
import TopProducts from "@/components/home/TopProducts";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-10 space-y-10">
      <Hero bgSrc="/hero.jpg" />
      <TopProducts />
    </div>
  );
}
