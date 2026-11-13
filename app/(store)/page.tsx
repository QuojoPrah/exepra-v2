import Hero, { type HeroSlideData } from "@/components/home/hero";
import FeaturedCategories from "@/components/home/featured-categories";
import BestSellers from "@/components/home/best-sellers";
import ExepraDifference from "@/components/home/exepra-difference";
import FeaturedCollections from "@/components/home/featured-collections";
import CustomerReviews from "@/components/home/customer-reviews";
import { getBestSellers, getFeaturedCategories, getFeaturedCollections, getFeaturedReviews, getHeroSlides } from "@/lib/catalog";

export const revalidate = 300;

const DEFAULT_SLIDES: HeroSlideData[] = [
  {
    id: "default",
    eyebrow: "The EXEPRA Edit",
    title: "Discover Everyday Elegance.",
    subtitle: "Thoughtfully selected essentials for women and little ones.",
    image: "/images/hero/hero1.jpg",
    imageAlt: "A bright, calm living space",
    primaryLabel: "Shop Women",
    primaryHref: "/women",
    secondaryLabel: "Shop Kids",
    secondaryHref: "/kids",
  },
];

export default async function HomePage() {
  const [slides, categories, bestSellers, collections, reviews] = await Promise.all([
    getHeroSlides(),
    getFeaturedCategories(),
    getBestSellers(8),
    getFeaturedCollections(),
    getFeaturedReviews(6),
  ]);

  return (
    <>
      <Hero slides={slides.length ? slides : DEFAULT_SLIDES} />
      <FeaturedCategories
        categories={[
          ...categories.slice(0, 3),
          { id: "new-arrivals", slug: "new-arrivals", name: "New Arrivals", description: "The latest additions to the EXEPRA edit.", image: "/images/instagram/insta6.jpg" },
        ]}
      />
      <BestSellers products={bestSellers} />
      <ExepraDifference />
      <FeaturedCollections collections={collections} />
      <CustomerReviews reviews={reviews} />
    </>
  );
}
