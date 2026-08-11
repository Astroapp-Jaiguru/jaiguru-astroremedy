import { Hero } from "@/components/layout/hero";
import { ConsultationCards } from "@/components/sections/consultation-cards";
import { FeaturedProducts } from "@/components/sections/featured-products";
import { FeaturedServices } from "@/components/sections/featured-services";
import { GalleryHome } from "@/components/sections/gallery-home";
import { TestimonialsHome } from "@/components/sections/testimonials-home";
import { FaqHome } from "@/components/sections/faq-home";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ConsultationCards />
      <FeaturedProducts />
      <FeaturedServices />
      <GalleryHome />
      <TestimonialsHome />
      <FaqHome />
    </>
  );
}