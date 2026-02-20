import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BikeContactModal } from '@/components/BikeContactModal';
import { bikeAPI, API_URL } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Save, X } from 'lucide-react';

interface BikeDetails {
  id: number;
  name: string;
  brand_id: number;
  brands: { id: number; name: string; logo_url: string };
  price: string;
  category: string;
  specs: string;
  features: string[];
  image_url: string;
  availability: boolean;
  stock_quantity: number;
  year_model: number;
  engine_cc?: number;
  horsepower?: string;
}

interface BikeDetailProps {
  isSecondHand?: boolean;
  isAdminView?: boolean;
}

export function BikeDetail({ isSecondHand = false, isAdminView = false }: BikeDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bike, setBike] = useState<BikeDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<BikeDetails>>({});
  const [newFeature, setNewFeature] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);

  const fetchBike = useCallback(async () => {
    try {
      setLoading(true);
      if (!id) {
        console.error('No ID provided');
        return;
      }
      
      const bikeId = parseInt(id);
      if (isNaN(bikeId)) {
        console.error('Invalid ID provided:', id);
        toast({
          title: 'Error',
          description: 'Invalid bike ID',
          variant: 'destructive'
        });
        return;
      }
      
      // Check if admin view is enabled
      if (isAdminView) {
        console.log('Admin view enabled from props');
        setIsAdmin(true);
      } else {
        // Check if admin token exists in localStorage
        const adminToken = localStorage.getItem('adminToken');
        console.log('Checking admin token:', !!adminToken);
        if (adminToken) {
          console.log('Admin token found, enabling edit mode');
          setIsAdmin(true);
        }
      }
      
      const data = isSecondHand 
        ? await bikeAPI.getSecondHandBikeById(bikeId)
        : await bikeAPI.getBikeById(bikeId);
      setBike(data);
      setFormData(data);
    } catch (error) {
      console.error('Failed to fetch bike:', error);
      toast({
        title: 'Error',
        description: 'Failed to load bike details',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchBike();
    
    // Also check admin status immediately
    if (isAdminView) {
      setIsAdmin(true);
    } else {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        setIsAdmin(true);
      }
    }
  }, [fetchBike, isAdminView]);

  const handleInputChange = (field: string, value: string | number | boolean | string[]) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const current = Array.isArray(formData.features) ? formData.features : [];
      setFormData({
        ...formData,
        features: [...current, newFeature]
      });
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    const current = Array.isArray(formData.features) ? formData.features : [];
    setFormData({
      ...formData,
      features: current.filter((_, i) => i !== index)
    });
  };

  const handleSave = async () => {
    try {
      if (!id || !bike) return;

      const updatedData = {
        ...bike,
        ...formData
      };

      const result = await bikeAPI.updateBike(parseInt(id), updatedData);
      if (result) {
        setBike(result);
        setIsEditing(false);
        toast({
          title: 'Success',
          description: 'Bike details updated successfully'
        });

        // Store submission to backend for Google Sheets
        await fetch(`${API_URL}/bikes/store-submission`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bikeId: id,
            bikeName: updatedData.name,
            brand: updatedData.brands?.name,
            price: updatedData.price,
            timestamp: new Date().toISOString(),
            action: 'updated'
          })
        });
      }
    } catch (error) {
      console.error('Failed to update bike:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Loading bike details...</div>
      </div>
    );
  }

  if (!bike) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Bike not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData(bike);
                  }}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => setIsContactOpen(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Contact Now
                </Button>
                {isAdmin && <Button variant="outline" onClick={() => setIsEditing(true)}>Edit Details</Button>}
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Image */}
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-4">
                <img
                  src={formData.image_url || bike.image_url}
                  alt={formData.name || bike.name}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = '/default-bike.jpg';
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Bike Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Bike Name
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Bike name"
                    />
                  ) : (
                    <p className="text-gray-700">{bike.name}</p>
                  )}
                </div>

                {/* Brand */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Brand
                  </label>
                  <p className="text-gray-700">{bike.brands?.name}</p>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Price
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.price || ''}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      placeholder="Price"
                    />
                  ) : (
                    <p className="text-gray-700 text-lg font-semibold">
                      {bike.price}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Category
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.category || ''}
                      onChange={(e) =>
                        handleInputChange('category', e.target.value)
                      }
                      placeholder="Category"
                    />
                  ) : (
                    <p className="text-gray-700">{bike.category}</p>
                  )}
                </div>

                {/* Engine CC */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Engine CC
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.engine_cc || 0}
                      onChange={(e) =>
                        handleInputChange('engine_cc', parseInt(e.target.value))
                      }
                      placeholder="Engine CC"
                    />
                  ) : (
                    <p className="text-gray-700">{bike.engine_cc || 'N/A'} cc</p>
                  )}
                </div>

                {/* Horsepower */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Horsepower
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.horsepower || ''}
                      onChange={(e) =>
                        handleInputChange('horsepower', e.target.value)
                      }
                      placeholder="Horsepower"
                    />
                  ) : (
                    <p className="text-gray-700">{bike.horsepower || 'N/A'}</p>
                  )}
                </div>

                {/* Year Model */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Year Model
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.year_model || new Date().getFullYear()}
                      onChange={(e) =>
                        handleInputChange('year_model', parseInt(e.target.value))
                      }
                      placeholder="Year"
                    />
                  ) : (
                    <p className="text-gray-700">{bike.year_model}</p>
                  )}
                </div>

                {/* Stock Quantity */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Stock Quantity
                  </label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={formData.stock_quantity || 0}
                      onChange={(e) =>
                        handleInputChange('stock_quantity', parseInt(e.target.value))
                      }
                      placeholder="Stock"
                    />
                  ) : (
                    <p className="text-gray-700">{bike.stock_quantity}</p>
                  )}
                </div>

                {/* Availability */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Availability
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.availability ? 'true' : 'false'}
                      onChange={(e) =>
                        handleInputChange('availability', e.target.value === 'true')
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="true">Available</option>
                      <option value="false">Not Available</option>
                    </select>
                  ) : (
                    <p className="text-gray-700">
                      {bike.availability ? '✅ Available' : '❌ Not Available'}
                    </p>
                  )}
                </div>

                {/* Specs */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Specifications
                  </label>
                  {isEditing ? (
                    <Textarea
                      value={formData.specs || ''}
                      onChange={(e) => handleInputChange('specs', e.target.value)}
                      placeholder="Specifications"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-700">{bike.specs}</p>
                  )}
                </div>

                {/* Features */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Features
                  </label>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={newFeature}
                          onChange={(e) => setNewFeature(e.target.value)}
                          placeholder="Add a feature"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleAddFeature();
                            }
                          }}
                        />
                        <Button
                          onClick={handleAddFeature}
                          variant="outline"
                          size="sm"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(formData.features) &&
                          formData.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between bg-gray-100 p-2 rounded"
                            >
                              <span>{feature}</span>
                              <button
                                onClick={() => handleRemoveFeature(index)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {Array.isArray(bike.features) &&
                        bike.features.map((feature, index) => (
                          <p key={index} className="text-gray-700">
                            • {feature}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bike Contact Modal */}
        {bike && (
          <BikeContactModal 
            isOpen={isContactOpen}
            onClose={() => setIsContactOpen(false)}
            bikeName={bike.name}
            bikePrice={bike.price}
          />
        )}
      </div>
    </div>
  );
}
