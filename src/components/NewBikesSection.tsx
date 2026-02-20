import { useState, useEffect } from 'react';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { BrandModelSelector, type SelectedModelInfo } from '@/components/BrandModelSelector';
import { Button } from '@/components/ui/button';
import { bikeAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import bikeSport from '@/assets/bike-sport.jpg';

interface Bike {
  id: number;
  name: string;
  price: string;
  category: string;
  image_url?: string;
  specs: string;
  brands: { name: string };
  features?: string[];
}

type BikeCategory = 'All' | 'Sports' | 'Scooter' | 'Commuter' | 'Cruiser' | 'Adventure';

const categories: BikeCategory[] = ['All', 'Sports', 'Scooter', 'Commuter', 'Cruiser', 'Adventure'];

export function NewBikesSection() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [activeCategory, setActiveCategory] = useState<BikeCategory>('All');
  const [selectedModelInfo, setSelectedModelInfo] = useState<SelectedModelInfo | null>(null);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    try {
      setLoading(true);
      const bikesList = await bikeAPI.getAllBikes();
      if (bikesList && bikesList.length > 0) {
        setBikes(bikesList);
        // Don't auto-select - wait for user to choose
      }
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = (info: SelectedModelInfo) => {
    setSelectedModelInfo(info);
    setActiveCategory('All');
  };

  const filteredBikes = selectedModelInfo
    ? bikes.filter(bike => bike.name === selectedModelInfo.model.name)
    : activeCategory === 'All'
    ? bikes
    : bikes.filter(bike => bike.category === activeCategory);

  if (loading) {
    return (
      <section id="new-bikes" className="section-padding bg-section-dark relative overflow-hidden">
        <div className="container-custom text-center">
          <p className="text-section-dark-foreground">Loading bikes...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="new-bikes" className="section-padding bg-section-dark relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="container-custom relative">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up" className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">RR Motors Showroom</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-section-dark-foreground mt-2 mb-4">
            {selectedModelInfo ? (
              <>
                {selectedModelInfo.brand} <span className="text-gradient">{selectedModelInfo.model.name}</span>
              </>
            ) : (
              <>New <span className="text-gradient">Bikes</span></>
            )}
          </h2>
          <p className="text-section-dark-foreground/70 max-w-2xl mx-auto">
            {selectedModelInfo ? (
              <>Showing {selectedModelInfo.model.name} specifications: {selectedModelInfo.model.specs} | Starting at {selectedModelInfo.model.price}</>
            ) : (
              <>Discover our latest collection of brand new motorcycles from RR Motors. From adrenaline-pumping sports bikes to practical commuters, find your perfect ride.</>
            )}
          </p>
        </ScrollAnimation>

        {/* Brand Model Selector */}
        <ScrollAnimation animation="fade-up" className="mb-12">
          <div className="flex flex-col gap-4">
            <BrandModelSelector onModelSelect={handleModelSelect} />
            {selectedModelInfo && (
              <div className="text-center">
              </div>
            )}
          </div>
        </ScrollAnimation>

      </div>
    </section>
  );
}
