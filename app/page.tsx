import Navbar from "@/components/layout/navbar";
import Hero from "@/components/home/hero";
import FeaturedIn from "@/components/home/featured-in";
import Categories from "@/components/home/categories";
import BestSellers from "@/components/home/best-sellers";
import WhyExepra from "@/components/home/why-exepra";
import SalePromotions from "@/components/home/sale-promotions";
import ExepraDifference from "@/components/home/exepra-difference";
import FeaturedCollection from "@/components/home/featured-collection";
import Testimonials from "@/components/home/testimonials";
import Instagram from "@/components/home/instagram";
import Footer from "@/components/layout/footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <FeaturedIn />
      <Categories />
      <BestSellers />
      <FeaturedCollection />
      <WhyExepra />
      <SalePromotions />
      <ExepraDifference />
      <Testimonials />
      <Instagram />
      <Footer />
    </>
  );
}