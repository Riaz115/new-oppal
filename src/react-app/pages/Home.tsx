import Hero from '@/react-app/components/Hero';
import Features from '@/react-app/components/Features';
import Pricing from '@/react-app/components/Pricing';
import Testimonials from '@/react-app/components/Testimonials';
import Footer from '@/react-app/components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      <Features />
      <Pricing />
      <Testimonials />
      <Footer />
    </div>
  );
}
