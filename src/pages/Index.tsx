import { useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { BikeShowcase } from '@/components/BikeShowcase';
import { AboutSection } from '@/components/AboutSection';
import { NewBikesSection } from '@/components/NewBikesSection';
import { SecondHandSection } from '@/components/SecondHandSection';
import { InsuranceSection } from '@/components/InsuranceSection';
import { ServiceSection } from '@/components/ServiceSection';
import { CareerSection } from '@/components/CareerSection';
import { Footer } from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    // Handle hash navigation
    const hash = window.location.hash;
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  }, []);

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <BikeShowcase />
      <NewBikesSection />
      <SecondHandSection />
      <ServiceSection />
      <InsuranceSection />
      <CareerSection />
      <AboutSection />
      <Footer />
    </main>
  );
};

export default Index;
