import Hero from '@/components/ui/Hero';
import FeaturedCourses from '@/components/ui/FeaturedCourses';
import Stats from '@/components/ui/Stats';
import Categories from '@/components/ui/Categories';
import Testimonials from '@/components/ui/Testimonials';
import CTABanner from '@/components/ui/CTABanner';

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Categories />
      <FeaturedCourses />
      <Testimonials />
      <CTABanner />
    </>
  );
}
