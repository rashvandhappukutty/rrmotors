import { useState, useEffect } from 'react';
import { ScrollAnimation } from '@/components/ScrollAnimation';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Flame } from 'lucide-react';
import { bikeAPI } from '@/lib/api';
import { SecondHandBikeModal } from '@/components/SecondHandBikeModal';
import bikeCruiser from '@/assets/bike-cruiser.jpg';

interface UsedBike {
  id: number;
  name: string;
  price: string;
  original_price?: string;
  year_manufacture?: number;
  mileage?: string;
  image_url?: string;
  condition?: string;
  specs?: string;
  registration_number?: string;
  engine_cc?: string;
  horsepower?: string;
  color?: string;
  brands: { name: string };
}

export function SecondHandSection() {
  const [usedBikes, setUsedBikes] = useState<UsedBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBike, setSelectedBike] = useState<UsedBike | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchSecondHandBikes();
  }, []);

  const fetchSecondHandBikes = async () => {
    try {
      setLoading(true);
      const bikes = await bikeAPI.getAllSecondHandBikes();
      if (bikes && bikes.length > 0) {
        setUsedBikes(bikes);
      }
    } catch (error) {
      console.error('Failed to fetch second-hand bikes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBadge = (condition?: string): 'verified' | 'deal' | null => {
    if (condition === 'Excellent') return 'verified';
    if (condition === 'Fair' || condition === 'Good') return 'deal';
    return null;
  };

  const handleViewDetails = (bike: UsedBike) => {
    setSelectedBike(bike);
    setIsModalOpen(true);
  };

  const handleContactNow = (bike: UsedBike) => {
    setSelectedBike(bike);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <section id="second-hand" className="section-padding bg-background relative">
        <div className="container-custom text-center">
          <p className="text-foreground">Loading second-hand bikes...</p>
        </div>
      </section>
    );
  }

  if (usedBikes.length === 0) {
    return (
      <section id="second-hand" className="section-padding bg-background relative">
        <div className="container-custom text-center">
          <p className="text-foreground">No second-hand bikes available at the moment</p>
        </div>
      </section>
    );
  }

  return (
    <section id="second-hand" className="section-padding bg-background relative">
      <div className="container-custom">
        {/* Section Header */}
        <ScrollAnimation animation="fade-up" className="text-center mb-12">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Pre-Owned</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mt-2 mb-4">
            Second Hand <span className="text-gradient">Bikes</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Quality pre-owned motorcycles, thoroughly inspected and ready to ride. 
            All bikes come with warranty and service history.
          </p>
        </ScrollAnimation>

        {/* Bikes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {usedBikes.map((bike, index) => (
            <ScrollAnimation key={bike.id} animation="fade-up" delay={index * 150}>
              <div className="group bg-card rounded-2xl overflow-hidden shadow-card card-lift border border-border">
                {/* Image */}
                <div className="image-zoom aspect-[4/3] relative">
                  <img
                    src={bike.image_url || bikeCruiser}
                    alt={bike.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60" />
                  
                  {/* Badge */}
                  {getBadge(bike.condition) && (
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                      getBadge(bike.condition) === 'verified' 
                        ? 'bg-emerald-500/90 text-white' 
                        : 'bg-orange-500/90 text-white'
                    }`}>
                      {getBadge(bike.condition) === 'verified' ? (
                        <>
                          <BadgeCheck className="w-3.5 h-3.5" /> Verified
                        </>
                      ) : (
                        <>
                          <Flame className="w-3.5 h-3.5" /> Best Deal
                        </>
                      )}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-display font-bold text-card-foreground mb-2 group-hover:text-primary transition-colors">
                    {bike.brands.name} {bike.name}
                  </h3>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    {bike.year_manufacture && <span>{bike.year_manufacture}</span>}
                    {bike.year_manufacture && bike.mileage && (
                      <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                    )}
                    {bike.mileage && <span>{bike.mileage}</span>}
                    {bike.condition && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        <span className="capitalize">{bike.condition}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-end gap-3 mb-4">
                    {bike.original_price && (
                      <span className="text-lg font-semibold text-muted-foreground line-through">
                        {bike.original_price}
                      </span>
                    )}
                    <span className="text-2xl font-display font-bold text-primary">
                      {bike.price}
                    </span>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="default" 
                      className="flex-1"
                      onClick={() => handleViewDetails(bike)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleContactNow(bike)}
                    >
                      Contact Now
                    </Button>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>

      {/* Second Hand Bike Modal */}
      <SecondHandBikeModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        bike={selectedBike}
      />
    </section>
  );
}
