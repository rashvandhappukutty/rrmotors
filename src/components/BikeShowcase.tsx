import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { bikeAPI } from '@/lib/api';
import { Link, useNavigate } from 'react-router-dom';
import bikeSport from '@/assets/bike-sport.jpg';

interface BikeSlide {
  image: string;
  id: number;
  name: string;
  brands: { name: string };
  price: string;
  specs: string;
  image_url?: string;
  category: string;
  features?: string[];
}

export function BikeShowcase() {
  const [bikeSlides, setBikeSlides] = useState<BikeSlide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const bikes = await bikeAPI.getAllBikes();
      // Use fetched bikes, fallback to empty array if none available
      if (bikes && bikes.length > 0) {
        setBikeSlides(bikes.slice(0, 6)); // Show max 6 bikes
      }
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!autoPlay || bikeSlides.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bikeSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [autoPlay, bikeSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const nextSlide = () => {
    if (bikeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % bikeSlides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  const prevSlide = () => {
    if (bikeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + bikeSlides.length) % bikeSlides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 10000);
  };

  if (loading) {
    return (
      <section className="relative w-full py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background via-background to-section-dark">
        <div className="container-custom text-center">
          <p className="text-foreground">Loading bikes...</p>
        </div>
      </section>
    );
  }

  if (bikeSlides.length === 0) {
    return (
      <section className="relative w-full py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background via-background to-section-dark">
        <div className="container-custom text-center">
          <p className="text-foreground">No bikes available at the moment</p>
        </div>
      </section>
    );
  }

  const currentBike = bikeSlides[currentSlide];

  return (
    <section className="relative w-full py-12 md:py-16 lg:py-20 bg-gradient-to-b from-background via-background to-section-dark">
      <div className="container-custom">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up" className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Featured Bikes</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-2 mb-4">
            Explore Our <span className="text-gradient">Premium Collection</span>
          </h2>
        </ScrollAnimation>

        {/* Slideshow Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Main Slide */}
          <ScrollAnimation animation="scale-in" className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
              {/* Bike Image */}
              <div className="relative aspect-[16/9] md:aspect-[4/3]">
                <img
                  src={currentBike.image_url || bikeSport}
                  alt={currentBike.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              </div>

              {/* Bike Info Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 text-white">
                <div className="animate-fade-up">
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/80 text-primary-foreground text-sm font-semibold mb-2">
                      {currentBike.category}
                    </span>
                  </div>
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-2">
                    {currentBike.brands.name} {currentBike.name}
                  </h3>
                  <p className="text-lg md:text-xl text-white/90 mb-4">{currentBike.specs}</p>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <span className="text-3xl md:text-4xl font-display font-bold text-primary">
                      {currentBike.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimation>

          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-primary/80 hover:bg-primary text-white transition-all duration-300 shadow-lg hover:shadow-xl -ml-6 md:-ml-8 group"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover:-translate-x-1 transition-transform" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 rounded-full bg-primary/80 hover:bg-primary text-white transition-all duration-300 shadow-lg hover:shadow-xl -mr-6 md:-mr-8 group"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-3 mt-8">
            {bikeSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide
                    ? 'bg-primary w-8 h-3'
                    : 'bg-primary/40 hover:bg-primary/60 w-3 h-3'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-6 text-muted-foreground text-sm">
            Slide {currentSlide + 1} of {bikeSlides.length}
          </div>
        </div>
      </div>
    </section>
  );
}
