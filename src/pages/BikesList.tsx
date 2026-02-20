import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { bikeAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Search, Eye, Trash2, Plus } from 'lucide-react';

interface Bike {
  id: number;
  name: string;
  brand_id: number;
  brands: { id: number; name: string };
  price: string;
  category: string;
  availability: boolean;
  stock_quantity: number;
  image_url: string;
}

export function BikesList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [filteredBikes, setFilteredBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);

  const fetchBikes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bikeAPI.getAllBikes();
      setBikes(data);

      // Extract unique categories
      const categorySet = new Set<string>(data.map((b: Bike) => b.category));
      const uniqueCategories: string[] = ['All', ...Array.from(categorySet)];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to fetch bikes:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bikes',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const filterBikes = useCallback(() => {
    let filtered = bikes;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (bike) =>
          bike.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          bike.brands.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (filterCategory !== 'All') {
      filtered = filtered.filter((bike) => bike.category === filterCategory);
    }

    setFilteredBikes(filtered);
  }, [bikes, searchTerm, filterCategory]);

  useEffect(() => {
    fetchBikes();
  }, [fetchBikes]);

  useEffect(() => {
    filterBikes();
  }, [filterBikes]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) return;

    try {
      await bikeAPI.deleteBike(id);
      setBikes(bikes.filter((b) => b.id !== id));
      toast({
        title: 'Success',
        description: 'Bike deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete bike:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bike',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading bikes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bikes Inventory</h1>
            <p className="text-gray-600 mt-1">
              Manage and view all bikes in the showroom
            </p>
          </div>
          <Button
            onClick={() => navigate('/admin')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add New Bike
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search bikes by name or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={filterCategory === cat ? 'default' : 'outline'}
                onClick={() => setFilterCategory(cat)}
                className="whitespace-nowrap"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredBikes.length} of {bikes.length} bikes
        </div>

        {/* Bikes Grid */}
        {filteredBikes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => (
              <Card key={bike.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video overflow-hidden bg-gray-200">
                  <img
                    src={bike.image_url}
                    alt={bike.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.currentTarget.src = '/default-bike.jpg';
                    }}
                  />
                </div>

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{bike.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {bike.brands.name}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        bike.availability
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {bike.availability ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Price */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold text-lg text-blue-600">
                      {bike.price}
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Category:</span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {bike.category}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/bike/${bike.id}`)}
                      className="flex-1 flex items-center gap-2 justify-center"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(bike.id)}
                      className="flex items-center gap-2 justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-600">No bikes found matching your search.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
