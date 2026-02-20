import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ChevronRight } from 'lucide-react';
import { bikeAPI } from '@/lib/api';
import bikeSport from '@/assets/bike-sport.jpg';
import bikeScooter from '@/assets/bike-scooter.jpg';
import bikeCommuter from '@/assets/bike-commuter.jpg';
import bikeCruiser from '@/assets/bike-cruiser.jpg';
import bikeAdventure from '@/assets/bike-adventure.jpg';
// Naked category removed

interface Brand {
  id: number;
  name: string;
  logo_url?: string;
}

interface Bike {
  id: number;
  name: string;
  brands: Brand;
  price: string;
  specs: string;
  image_url?: string;
  category?: string;
}

const defaultImages: { [key: string]: string } = {
  'Sports': bikeSport,
  'Scooter': bikeScooter,
  'Commuter': bikeCommuter,
  'Cruiser': bikeCruiser,
  'Adventure': bikeAdventure,

};

export interface SelectedModelInfo {
  brand: string;
  model: {
    features: boolean;
    id: string;
    name: string;
    price: string;
    specs: string;
  };
}

interface BrandModelSelectorProps {
  onModelSelect?: (info: SelectedModelInfo) => void;
}

export function BrandModelSelector({ onModelSelect }: BrandModelSelectorProps) {
  const navigate = useNavigate();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bikesByBrand, setBikesByBrand] = useState<{ [key: number]: Bike[] }>({});
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const brandList = await bikeAPI.getAllBrands();
        if (brandList && Array.isArray(brandList)) {
          setBrands(brandList);

          // Fetch bikes for each brand
          const bikesByBrandData: { [key: number]: Bike[] } = {};
          for (const brand of brandList) {
            try {
              const bikes = await bikeAPI.getBikesByBrand(brand.id);
              bikesByBrandData[brand.id] = bikes || [];
            } catch (error) {
              console.error(`Failed to load bikes for brand ${brand.name}:`, error);
              bikesByBrandData[brand.id] = [];
            }
          }
          setBikesByBrand(bikesByBrandData);
          
          // Don't auto-select - wait for user to choose
        }
      } catch (error) {
        console.error('Failed to load brands:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const currentBikesList = selectedBrandId ? bikesByBrand[selectedBrandId] || [] : [];
  const currentBike = currentBikesList.find((bike) => bike.id === parseInt(selectedBikeId));
  const selectedBrand = brands.find(b => b.id === selectedBrandId);

  const handleBrandChange = (brandId: string) => {
    const brandIdNum = parseInt(brandId);
    setSelectedBrandId(brandIdNum);
    setSelectedBikeId('');
  };

  const handleBikeChange = (bikeId: string) => {
    setSelectedBikeId(bikeId);
    const bike = currentBikesList.find((b) => b.id === parseInt(bikeId));
    if (bike && onModelSelect && selectedBrand) {
      onModelSelect({
        brand: selectedBrand.name,
        model: {
          id: bike.id.toString(),
          name: bike.name,
          price: bike.price,
          specs: bike.specs,
          features: false
        }
      });
    }
  };

  const getImageForBike = (bike: Bike): string => {
    return bike.image_url || defaultImages[bike.category || 'Sports'] || bikeSport;
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-2xl p-6 md:p-8 border border-primary/20 shadow-lg">
      <h3 className="text-2xl md:text-3xl font-display font-bold text-card-foreground mb-6">
        Find Your Perfect Ride
      </h3>

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-muted-foreground">No brands available</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Brand Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Select Brand
              </label>
              <Select value={selectedBrandId?.toString() || ''} onValueChange={handleBrandChange}>
                <SelectTrigger className="w-full bg-background border-primary/30 text-foreground hover:border-primary/50 focus:border-primary">
                  <SelectValue placeholder="Choose a brand..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id.toString()}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bike/Model Select */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Select Model
              </label>
              <Select
                value={selectedBikeId}
                onValueChange={handleBikeChange}
                disabled={!selectedBrandId || currentBikesList.length === 0}
              >
                <SelectTrigger className="w-full bg-background border-primary/30 text-foreground hover:border-primary/50 focus:border-primary disabled:opacity-50">
                  <SelectValue placeholder={selectedBrandId && currentBikesList.length > 0 ? 'Choose a model...' : 'Select a brand first...'} />
                </SelectTrigger>
                <SelectContent>
                  {currentBikesList.map((bike) => (
                    <SelectItem key={bike.id} value={bike.id.toString()}>
                      {bike.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {currentBike && selectedBrand && (
            <div className="space-y-6">
              {/* Bike Image */}
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                <div className="aspect-[16/9] relative">
                  <img
                    src={getImageForBike(currentBike)}
                    alt={currentBike.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />
                </div>
              </div>

              {/* Model Details Card */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Model</p>
                    <p className="text-lg font-bold text-card-foreground">{currentBike.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Price</p>
                    <p className="text-lg font-bold text-primary">{currentBike.price}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">Specifications</p>
                    <p className="text-lg font-bold text-card-foreground">{currentBike.specs}</p>
                  </div>
                </div>
                <Button 
                  className="w-full md:w-auto btn-glow bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold group"
                  onClick={() => {
                    if (currentBike) {
                      navigate(`/bike/${currentBike.id}`);
                    }
                  }}
                >
                  View Full Details
                  <ChevronRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}