import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bikeAPI, API_URL } from '@/lib/api';
import { imageAPI } from '@/lib/imageApi';
import { logoutAdmin } from '@/lib/auth';
import { Upload, Plus, X, LogOut, ChevronDown, Pencil, Trash2, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useEffect } from 'react';

const categories = ['Sports', 'Scooter', 'Commuter', 'Cruiser', 'Adventure'];

export function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadedImageUrl, setUploadedImageUrl] = useState('');
  const [brands, setBrands] = useState([]);
  const [allBikes, setAllBikes] = useState([]);
  const [allSecondHandBikes, setAllSecondHandBikes] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [showNewBrandModal, setShowNewBrandModal] = useState(false);
  const [showEditBikeModal, setShowEditBikeModal] = useState(false);
  const [editingBike, setEditingBike] = useState<any>(null);
  const [editBikeForm, setEditBikeForm] = useState<any>({});
  const [newBrandForm, setNewBrandForm] = useState({
    name: '',
    country: '',
    founded_year: new Date().getFullYear().toString()
  });
  const [brandDropdownOpen, setBrandDropdownOpen] = useState(false);
  const [showInlineNewBrand, setShowInlineNewBrand] = useState(false);
  const [inlineNewBrandName, setInlineNewBrandName] = useState('');
  const [showInlineNewBrandSecondHand, setShowInlineNewBrandSecondHand] = useState(false);
  const [inlineNewBrandNameSecondHand, setInlineNewBrandNameSecondHand] = useState('');
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [editingBrandName, setEditingBrandName] = useState('');

  // Fetch brands, bikes, and enquiries on mount
  useEffect(() => {
    const fetchData = async () => {
      const allBrands = await bikeAPI.getAllBrands();
      setBrands(allBrands);
      
      const bikes = await bikeAPI.getAllBikes();
      setAllBikes(bikes || []);
      
      const secondHand = await bikeAPI.getAllSecondHandBikes();
      setAllSecondHandBikes(secondHand || []);

      const enquiriesData = await bikeAPI.getAllEnquiries();
      setEnquiries(enquiriesData || []);
    };
    fetchData();

    // Refresh enquiries every 10 seconds for faster updates
    const interval = setInterval(async () => {
      const enquiriesData = await bikeAPI.getAllEnquiries();
      setEnquiries(enquiriesData || []);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      const result = await logoutAdmin();
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Logged out successfully'
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to logout',
        variant: 'destructive'
      });
    }
  };

  // Delete new bike
  const handleDeleteBike = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) return;
    
    try {
      await bikeAPI.deleteBike(id);
      setAllBikes(allBikes.filter(b => b.id !== id));
      toast({
        title: 'Success',
        description: 'Bike deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bike',
        variant: 'destructive'
      });
    }
  };

  // Handle bike edit save
  const handleSaveEditBike = async () => {
    if (!editingBike) return;
    
    try {
      setIsLoading(true);
      
      // Check if it's a second-hand bike
      const isSecondHand = allSecondHandBikes.some(b => b.id === editingBike.id);
      
      if (isSecondHand) {
        // Update second-hand bike
        await bikeAPI.updateSecondHandBike(editingBike.id, {
          name: editBikeForm.name,
          brand_id: editBikeForm.brand_id,
          price: editBikeForm.price,
          category: editBikeForm.category,
          specs: editBikeForm.specs,
          condition: editBikeForm.condition,
          mileage: editBikeForm.mileage,
          year_manufacture: editBikeForm.year_manufacture,
          owner_count: editBikeForm.owner_count,
          registration_number: editBikeForm.registration_number,
          availability: editBikeForm.availability,
          image_url: editBikeForm.image_url,
          description: editBikeForm.description,
          features: editBikeForm.features
        });
        
        // Update second-hand bikes list
        setAllSecondHandBikes(allSecondHandBikes.map(b => b.id === editingBike.id ? { ...b, ...editBikeForm } : b));
      } else {
        // Update new bike
        await bikeAPI.updateBike(editingBike.id, {
          name: editBikeForm.name,
          brand_id: editBikeForm.brand_id,
          price: editBikeForm.price,
          category: editBikeForm.category,
          specs: editBikeForm.specs,
          engine_cc: editBikeForm.engine_cc,
          horsepower: editBikeForm.horsepower,
          availability: editBikeForm.availability,
          stock_quantity: editBikeForm.stock_quantity,
          year_model: editBikeForm.year_model,
          image_url: editBikeForm.image_url,
          description: editBikeForm.description,
          features: editBikeForm.features
        });
        
        // Update bikes list
        setAllBikes(allBikes.map(b => b.id === editingBike.id ? { ...b, ...editBikeForm } : b));
      }
      
      toast({
        title: 'Success',
        description: 'Bike updated successfully'
      });
      
      setShowEditBikeModal(false);
      setEditingBike(null);
    } catch (error) {
      console.error('Error updating bike:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update bike',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete second-hand bike
  const handleDeleteSecondHand = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bike?')) return;
    
    try {
      await bikeAPI.deleteSecondHandBike(id);
      setAllSecondHandBikes(allSecondHandBikes.filter(b => b.id !== id));
      toast({
        title: 'Success',
        description: 'Bike deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete bike',
        variant: 'destructive'
      });
    }
  };

  // Edit brand name
  const handleEditBrand = async (brandId: number, newName: string) => {
    if (!newName.trim()) {
      toast({ title: 'Error', description: 'Brand name cannot be empty', variant: 'destructive' });
      return;
    }
    try {
      setIsLoading(true);
      const updated = await bikeAPI.updateBrand(brandId, { name: newName.trim() });
      setBrands(brands.map(b => b.id === brandId ? { ...b, name: updated.name } : b));
      setEditingBrandId(null);
      setEditingBrandName('');
      toast({ title: 'Success', description: `Brand renamed to "${updated.name}"` });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to update brand', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Delete brand
  const handleDeleteBrand = async (brandId: number, brandName: string) => {
    if (!window.confirm(`Are you sure you want to delete the brand "${brandName}"? This cannot be undone.`)) return;
    try {
      setIsLoading(true);
      await bikeAPI.deleteBrand(brandId);
      setBrands(brands.filter(b => b.id !== brandId));
      toast({ title: 'Success', description: `Brand "${brandName}" deleted successfully` });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete brand', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new brand (case-insensitive duplicate check)
  const handleAddBrand = async (e) => {
    e.preventDefault();
    try {
      if (!newBrandForm.name.trim()) {
        toast({
          title: 'Error',
          description: 'Brand name is required',
          variant: 'destructive'
        });
        return;
      }

      // Check if brand already exists (case-insensitive)
      const brandExists = brands.some(
        b => b.name.toLowerCase() === newBrandForm.name.toLowerCase()
      );

      if (brandExists) {
        toast({
          title: 'Brand Already Exists',
          description: `${newBrandForm.name} is already in your brand list`,
          variant: 'destructive'
        });
        return;
      }

      setIsLoading(true);

      // Create brand via API
      let response: Response;
      try {
        response = await fetch(`${API_URL}/bikes/brands/list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: newBrandForm.name.trim(),
            country: newBrandForm.country.trim(),
            founded_year: parseInt(newBrandForm.founded_year),
            active: true
          })
        });
      } catch (networkError) {
        console.error('Network error adding brand:', networkError);
        throw new Error('Network error: Unable to reach the server. Please check your connection and try again.');
      }

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Server error (${response.status}): Failed to create brand`);
      }

      const createdBrand = await response.json();

      // Update local brands list
      setBrands([...brands, createdBrand]);

      toast({
        title: 'Success',
        description: `Brand "${newBrandForm.name}" added successfully`
      });

      // Reset form
      setNewBrandForm({
        name: '',
        country: '',
        founded_year: new Date().getFullYear().toString()
      });
      setShowNewBrandModal(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add brand',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // New Bike Form State
  const [newBikeForm, setNewBikeForm] = useState({
    name: '',
    brand_id: '',
    price: '',
    category: '',
    specs: '',
    description: '',
    features: [],
    engine_cc: '',
    horsepower: '',
    availability: true,
    stock_quantity: '',
    year_model: new Date().getFullYear().toString()
  });

  // Second Hand Bike Form State
  const [secondHandForm, setSecondHandForm] = useState({
    name: '',
    brand_id: '',
    price: '',
    original_price: '',
    category: '',
    specs: '',
    description: '',
    year_model: (new Date().getFullYear() - 1).toString(),
    km: '',
    condition: 'Good',
    registration_number: '',
    availability: true
  });

  const [featureInput, setFeatureInput] = useState('');

  // Handle image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);

      const result = await imageAPI.uploadBikeImage(file);
      if (result.success) {
        setUploadedImageUrl(result.data.secure_url);
        toast({
          title: 'Success',
          description: 'Image uploaded successfully'
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add feature to list
  const addFeature = () => {
    if (featureInput.trim()) {
      setNewBikeForm({
        ...newBikeForm,
        features: [...newBikeForm.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  // Remove feature from list
  const removeFeature = (index) => {
    setNewBikeForm({
      ...newBikeForm,
      features: newBikeForm.features.filter((_, i) => i !== index)
    });
  };

  // Submit new bike
  const handleAddBike = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!uploadedImageUrl) {
        toast({
          title: 'Error',
          description: 'Please upload an image',
          variant: 'destructive'
        });
        return;
      }

      const bikeData = {
        ...newBikeForm,
        brand_id: parseInt(newBikeForm.brand_id),
        image_url: uploadedImageUrl,
        price: newBikeForm.price.toString(), // Ensure it's a string for formatting
        engine_cc: parseInt(newBikeForm.engine_cc) || 0,
        horsepower: parseInt(newBikeForm.horsepower) || 0,
        stock_quantity: parseInt(newBikeForm.stock_quantity) || 1,
        year_model: parseInt(newBikeForm.year_model) || new Date().getFullYear()
      };

      const result = await bikeAPI.createBike(bikeData);
      if (result) {
        toast({
          title: 'Success',
          description: 'New bike added successfully'
        });

        // Refresh bikes list
        const updatedBikes = await bikeAPI.getAllBikes();
        setAllBikes(updatedBikes || []);

        // Reset form
        setNewBikeForm({
          name: '',
          brand_id: '',
          price: '',
          category: '',
          specs: '',
          description: '',
          features: [],
          engine_cc: '',
          horsepower: '',
          availability: true,
          stock_quantity: '',
          year_model: new Date().getFullYear().toString()
        });
        setImagePreview('');
        setUploadedImageUrl('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Submit second hand bike
  const handleAddSecondHand = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      if (!uploadedImageUrl) {
        toast({
          title: 'Error',
          description: 'Please upload an image',
          variant: 'destructive'
        });
        return;
      }

      const bikeData = {
        name: `${secondHandForm.name} (${secondHandForm.year_model})`,
        brand_id: parseInt(secondHandForm.brand_id),
        price: secondHandForm.price.toString(),
        category: secondHandForm.category,
        specs: secondHandForm.specs,
        description: `${secondHandForm.condition} condition | ${secondHandForm.km} KM | ${secondHandForm.description}`,
        image_url: uploadedImageUrl,
        year_manufacture: parseInt(secondHandForm.year_model) || new Date().getFullYear() - 1,
        condition: secondHandForm.condition,
        mileage: secondHandForm.km,
        registration_number: secondHandForm.registration_number,
        availability: true,
        features: [] as string[]
      };

      console.log('Second-hand bike data being sent:', bikeData);

      const result = await bikeAPI.createSecondHandBike(bikeData);
      if (result) {
        toast({
          title: 'Success',
          description: 'Second-hand bike added successfully'
        });

        // Refresh second-hand bikes list
        const updatedSecondHand = await bikeAPI.getAllSecondHandBikes();
        setAllSecondHandBikes(updatedSecondHand || []);

        // Reset form
        setSecondHandForm({
          name: '',
          brand_id: '',
          price: '',
          original_price: '',
          category: '',
          specs: '',
          description: '',
          year_model: (new Date().getFullYear() - 1).toString(),
          km: '',
          condition: 'Good',
          registration_number: '',
          availability: true
        });
        setImagePreview('');
        setUploadedImageUrl('');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-custom py-8">
        {/* Header with Logout */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-2">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">Manage bike inventory and second-hand listings</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-primary/30 hover:bg-destructive/10 text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="new-bikes" className="space-y-4">
          <TabsList className="grid w-full max-w-4xl grid-cols-5">
            <TabsTrigger value="new-bikes">Add New Bikes</TabsTrigger>
            <TabsTrigger value="manage-bikes">Manage Bikes</TabsTrigger>
            <TabsTrigger value="second-hand">Add Second Hand</TabsTrigger>
            <TabsTrigger value="manage-brands">Manage Brands</TabsTrigger>
            <TabsTrigger value="enquiries">Enquiries ({enquiries.length})</TabsTrigger>
          </TabsList>

          {/* New Bikes Tab */}
          <TabsContent value="new-bikes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Bike</CardTitle>
                <CardDescription>Add a new bike to the inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddBike} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Bike Image</label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/60 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded"
                            />
                            <p className="text-sm text-muted-foreground">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="font-medium text-foreground">Click to upload image</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Bike Name *</label>
                      <Input
                        placeholder="e.g., R1000"
                        value={newBikeForm.name}
                        onChange={(e) => setNewBikeForm({ ...newBikeForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Brand *</label>
                      {showInlineNewBrand ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter new brand name"
                            value={inlineNewBrandName}
                            onChange={(e) => setInlineNewBrandName(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="bg-gradient-primary"
                            disabled={isLoading || !inlineNewBrandName.trim()}
                            onClick={async () => {
                              const brandName = inlineNewBrandName.trim();
                              if (!brandName) return;
                              
                              // Check if brand already exists (case-insensitive)
                              const existingBrand = brands.find(
                                b => b.name.toLowerCase() === brandName.toLowerCase()
                              );
                              
                              if (existingBrand) {
                                // Use existing brand
                                setNewBikeForm({ ...newBikeForm, brand_id: existingBrand.id.toString() });
                                toast({
                                  title: 'Brand Selected',
                                  description: `"${existingBrand.name}" already exists - selected it for you`
                                });
                              } else {
                                // Create new brand
                                try {
                                  setIsLoading(true);
                                  let response: Response;
                                  try {
                                    response = await fetch(`${API_URL}/bikes/brands/list`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        name: brandName,
                                        country: '',
                                        founded_year: new Date().getFullYear(),
                                        active: true
                                      })
                                    });
                                  } catch (networkError) {
                                    throw new Error('Network error: Unable to reach the server.');
                                  }
                                  if (!response.ok) {
                                    const errData = await response.json().catch(() => ({}));
                                    throw new Error(errData.message || `Failed to create brand (${response.status})`);
                                  }
                                  const createdBrand = await response.json();
                                  setBrands([...brands, createdBrand]);
                                  setNewBikeForm({ ...newBikeForm, brand_id: createdBrand.id.toString() });
                                  toast({
                                    title: 'Success',
                                    description: `Brand "${brandName}" created and selected`
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: error instanceof Error ? error.message : 'Failed to create brand',
                                    variant: 'destructive'
                                  });
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                              setInlineNewBrandName('');
                              setShowInlineNewBrand(false);
                            }}
                          >
                            {isLoading ? 'Adding...' : 'Add'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowInlineNewBrand(false);
                              setInlineNewBrandName('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Select 
                          value={newBikeForm.brand_id} 
                          onValueChange={(value) => {
                            if (value === 'other') {
                              setShowInlineNewBrand(true);
                            } else {
                              setNewBikeForm({ ...newBikeForm, brand_id: value });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="other" className="text-primary font-semibold border-t border-border mt-1 pt-2">
                              <span className="flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add New Brand
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Price and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Price *</label>
                      <Input
                        placeholder="e.g., ₹12,50,000"
                        value={newBikeForm.price}
                        onChange={(e) => setNewBikeForm({ ...newBikeForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Category *</label>
                      <Select value={newBikeForm.category} onValueChange={(value) => setNewBikeForm({ ...newBikeForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Engine Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Engine CC *</label>
                      <Input
                        type="number"
                        placeholder="e.g., 1000"
                        value={newBikeForm.engine_cc}
                        onChange={(e) => setNewBikeForm({ ...newBikeForm, engine_cc: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Horsepower *</label>
                      <Input
                        placeholder="e.g., 180"
                        value={newBikeForm.horsepower}
                        onChange={(e) => setNewBikeForm({ ...newBikeForm, horsepower: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Year Model *</label>
                      <Input
                        type="number"
                        value={newBikeForm.year_model}
                        onChange={(e) => setNewBikeForm({ ...newBikeForm, year_model: e.target.value.toString() })}
                        required
                      />
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Specifications *</label>
                    <Input
                      placeholder="e.g., 1000cc | 180 HP | Sports"
                      value={newBikeForm.specs}
                      onChange={(e) => setNewBikeForm({ ...newBikeForm, specs: e.target.value })}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Description</label>
                    <Textarea
                      placeholder="Detailed description of the bike..."
                      value={newBikeForm.description}
                      onChange={(e) => setNewBikeForm({ ...newBikeForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold">Features</label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a feature..."
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addFeature();
                          }
                        }}
                      />
                      <Button
                        type="button"
                        onClick={addFeature}
                        variant="outline"
                        size="icon"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newBikeForm.features.map((feature, index) => (
                        <div
                          key={index}
                          className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="hover:text-primary/80"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stock */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Stock Quantity</label>
                    <Input
                      type="number"
                      value={newBikeForm.stock_quantity}
                      onChange={(e) => setNewBikeForm({ ...newBikeForm, stock_quantity: e.target.value })}
                      min="0"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-glow bg-gradient-primary hover:opacity-90 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Bike'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Manage Bikes Tab */}
          <TabsContent value="manage-bikes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Manage All Bikes</CardTitle>
                <CardDescription>View, edit, and delete bikes from inventory</CardDescription>
              </CardHeader>
              <CardContent>
                {allBikes.length === 0 && allSecondHandBikes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No bikes in inventory</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* New Bikes */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3">New Bikes ({allBikes.length})</h3>
                      {allBikes.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3">No new bikes in inventory</p>
                      ) : (
                        <div className="space-y-2">
                          {allBikes.map((bike) => (
                            <div key={bike.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="font-semibold">{bike.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {bike.brands?.name} • {bike.category} • {bike.price}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Stock: {bike.stock_quantity} | {bike.availability ? '✅ Available' : '❌ Not Available'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingBike(bike);
                                    setEditBikeForm(bike);
                                    setShowEditBikeModal(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteBike(bike.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Second Hand Bikes */}
                    <div className="mt-6 pt-6 border-t">
                      <h3 className="text-lg font-semibold mb-3">Second Hand Bikes ({allSecondHandBikes.length})</h3>
                      {allSecondHandBikes.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-3">No second hand bikes in inventory</p>
                      ) : (
                        <div className="space-y-2">
                          {allSecondHandBikes.map((bike) => (
                            <div key={bike.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                              <div className="flex-1">
                                <p className="font-semibold">{bike.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {bike.brands?.name} • {bike.condition} • {bike.price}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Mileage: {bike.mileage} | Owners: {bike.owner_count} | {bike.availability ? '✅ Available' : '❌ Not Available'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingBike(bike);
                                    setEditBikeForm(bike);
                                    setShowEditBikeModal(true);
                                  }}
                                >
                                  <Pencil className="w-4 h-4 mr-1" /> Edit
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteSecondHand(bike.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Second Hand Tab */}
          <TabsContent value="second-hand" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Add Second Hand Bike</CardTitle>
                <CardDescription>Add a pre-owned bike to inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSecondHand} className="space-y-6">
                  {/* Image Upload */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground">Bike Image</label>
                    <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center hover:border-primary/60 transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isLoading}
                        className="hidden"
                        id="image-upload-2"
                      />
                      <label htmlFor="image-upload-2" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="space-y-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="max-h-48 mx-auto rounded"
                            />
                            <p className="text-sm text-muted-foreground">Click to change image</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                            <p className="font-medium text-foreground">Click to upload image</p>
                            <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Bike Model *</label>
                      <Input
                        placeholder="e.g., Cruiser 500"
                        value={secondHandForm.name}
                        onChange={(e) => setSecondHandForm({ ...secondHandForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Brand *</label>
                      {showInlineNewBrandSecondHand ? (
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter new brand name"
                            value={inlineNewBrandNameSecondHand}
                            onChange={(e) => setInlineNewBrandNameSecondHand(e.target.value)}
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            className="bg-gradient-primary"
                            disabled={isLoading || !inlineNewBrandNameSecondHand.trim()}
                            onClick={async () => {
                              const brandName = inlineNewBrandNameSecondHand.trim();
                              if (!brandName) return;
                              
                              // Check if brand already exists (case-insensitive)
                              const existingBrand = brands.find(
                                b => b.name.toLowerCase() === brandName.toLowerCase()
                              );
                              
                              if (existingBrand) {
                                // Use existing brand
                                setSecondHandForm({ ...secondHandForm, brand_id: existingBrand.id.toString() });
                                toast({
                                  title: 'Brand Selected',
                                  description: `"${existingBrand.name}" already exists - selected it for you`
                                });
                              } else {
                                // Create new brand
                                try {
                                  setIsLoading(true);
                                  let response: Response;
                                  try {
                                    response = await fetch(`${API_URL}/bikes/brands/list`, {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                        name: brandName,
                                        country: '',
                                        founded_year: new Date().getFullYear(),
                                        active: true
                                      })
                                    });
                                  } catch (networkError) {
                                    throw new Error('Network error: Unable to reach the server.');
                                  }
                                  if (!response.ok) {
                                    const errData = await response.json().catch(() => ({}));
                                    throw new Error(errData.message || `Failed to create brand (${response.status})`);
                                  }
                                  const createdBrand = await response.json();
                                  setBrands([...brands, createdBrand]);
                                  setSecondHandForm({ ...secondHandForm, brand_id: createdBrand.id.toString() });
                                  toast({
                                    title: 'Success',
                                    description: `Brand "${brandName}" created and selected`
                                  });
                                } catch (error) {
                                  toast({
                                    title: 'Error',
                                    description: error instanceof Error ? error.message : 'Failed to create brand',
                                    variant: 'destructive'
                                  });
                                } finally {
                                  setIsLoading(false);
                                }
                              }
                              setInlineNewBrandNameSecondHand('');
                              setShowInlineNewBrandSecondHand(false);
                            }}
                          >
                            {isLoading ? 'Adding...' : 'Add'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setShowInlineNewBrandSecondHand(false);
                              setInlineNewBrandNameSecondHand('');
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Select 
                          value={secondHandForm.brand_id} 
                          onValueChange={(value) => {
                            if (value === 'other') {
                              setShowInlineNewBrandSecondHand(true);
                            } else {
                              setSecondHandForm({ ...secondHandForm, brand_id: value });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a brand" />
                          </SelectTrigger>
                          <SelectContent>
                            {brands.map((brand) => (
                              <SelectItem key={brand.id} value={brand.id.toString()}>
                                {brand.name}
                              </SelectItem>
                            ))}
                            <SelectItem value="other" className="text-primary font-semibold border-t border-border mt-1 pt-2">
                              <span className="flex items-center gap-2">
                                <Plus className="w-4 h-4" /> Add New Brand
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Price *</label>
                      <Input
                        placeholder="e.g., ₹3,25,000"
                        value={secondHandForm.price}
                        onChange={(e) => setSecondHandForm({ ...secondHandForm, price: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Condition Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Year Model *</label>
                      <Input
                        type="number"
                        value={secondHandForm.year_model}
                        onChange={(e) => setSecondHandForm({ ...secondHandForm, year_model: e.target.value.toString() })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Kilometers *</label>
                      <Input
                        placeholder="e.g., 12,000 km"
                        value={secondHandForm.km}
                        onChange={(e) => setSecondHandForm({ ...secondHandForm, km: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Registration Number *</label>
                      <Input
                        placeholder="e.g., MH12AB1234"
                        value={secondHandForm.registration_number}
                        onChange={(e) => setSecondHandForm({ ...secondHandForm, registration_number: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Condition *</label>
                      <Select value={secondHandForm.condition} onValueChange={(value) => setSecondHandForm({ ...secondHandForm, condition: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excellent">Excellent</SelectItem>
                          <SelectItem value="Good">Good</SelectItem>
                          <SelectItem value="Fair">Fair</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Category and Specs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Category *</label>
                      <Select value={secondHandForm.category} onValueChange={(value) => setSecondHandForm({ ...secondHandForm, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold">Specifications *</label>
                      <Input
                        placeholder="e.g., 650cc | 75 HP"
                        value={secondHandForm.specs}
                        onChange={(e) => setSecondHandForm({ ...secondHandForm, specs: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold">Additional Details</label>
                    <Textarea
                      placeholder="Condition notes, maintenance history, etc..."
                      value={secondHandForm.description}
                      onChange={(e) => setSecondHandForm({ ...secondHandForm, description: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="btn-glow bg-gradient-primary hover:opacity-90 w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Adding...' : 'Add Second Hand Bike'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enquiries Tab */}
          {/* Manage Brands Tab */}
          <TabsContent value="manage-brands" className="space-y-4">
            <Card>
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                <CardTitle className="text-2xl">Manage Brands</CardTitle>
                <CardDescription>Edit or delete existing brands</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex justify-end mb-4">
                  <Button
                    onClick={() => setShowNewBrandModal(true)}
                    className="bg-gradient-primary hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add New Brand
                  </Button>
                </div>
                {brands.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No brands found. Add a new brand to get started.</p>
                ) : (
                  <div className="space-y-2">
                    {brands.map((brand) => (
                      <div key={brand.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:border-primary/40 transition-colors">
                        {editingBrandId === brand.id ? (
                          <div className="flex items-center gap-2 flex-1 mr-2">
                            <Input
                              value={editingBrandName}
                              onChange={(e) => setEditingBrandName(e.target.value)}
                              className="flex-1"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditBrand(brand.id, editingBrandName);
                                if (e.key === 'Escape') { setEditingBrandId(null); setEditingBrandName(''); }
                              }}
                            />
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              disabled={isLoading}
                              onClick={() => handleEditBrand(brand.id, editingBrandName)}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => { setEditingBrandId(null); setEditingBrandName(''); }}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-medium text-foreground">{brand.name}</span>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-primary/30 hover:bg-primary/10"
                                onClick={() => { setEditingBrandId(brand.id); setEditingBrandName(brand.name); }}
                              >
                                <Pencil className="w-4 h-4 mr-1" /> Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-destructive/30 hover:bg-destructive/10 text-destructive"
                                disabled={isLoading}
                                onClick={() => handleDeleteBrand(brand.id, brand.name)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> Delete
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enquiries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Customer Enquiries</CardTitle>
                    <CardDescription>Manage bike enquiries and customer leads</CardDescription>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      const enquiriesData = await bikeAPI.getAllEnquiries();
                      setEnquiries(enquiriesData || []);
                      toast({
                        title: 'Refreshed',
                        description: 'Enquiries list updated'
                      });
                    }}
                  >
                    Refresh
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {enquiries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No enquiries yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-2 font-semibold">Customer</th>
                          <th className="text-left py-3 px-2 font-semibold">Email</th>
                          <th className="text-left py-3 px-2 font-semibold">Phone</th>
                          <th className="text-left py-3 px-2 font-semibold">Type</th>
                          <th className="text-left py-3 px-2 font-semibold">Status</th>
                          <th className="text-left py-3 px-2 font-semibold">Date</th>
                          <th className="text-left py-3 px-2 font-semibold">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {enquiries.map((enquiry: any) => (
                          <tr key={enquiry.id} className="border-b hover:bg-secondary/50">
                            <td className="py-3 px-2">{enquiry.customer_name}</td>
                            <td className="py-3 px-2 text-xs break-all">{enquiry.email}</td>
                            <td className="py-3 px-2">{enquiry.phone}</td>
                            <td className="py-3 px-2">
                              <span className="inline-block px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                                {enquiry.enquiry_type}
                              </span>
                            </td>
                            <td className="py-3 px-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                                enquiry.status === 'New' ? 'bg-blue-100 text-blue-800' :
                                enquiry.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                                enquiry.status === 'Converted' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {enquiry.status}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-xs">
                              {new Date(enquiry.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedEnquiry(enquiry)}
                                className="text-xs"
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Enquiry Details Modal */}
            {selectedEnquiry && (
              <Card className="border-primary/30">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Enquiry Details</CardTitle>
                      <CardDescription>ID: {selectedEnquiry.id}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedEnquiry(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Name</p>
                      <p className="text-base">{selectedEnquiry.customer_name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Email</p>
                      <p className="text-base break-all">{selectedEnquiry.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Phone</p>
                      <p className="text-base">{selectedEnquiry.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Type</p>
                      <p className="text-base">{selectedEnquiry.enquiry_type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Status</p>
                      <Select 
                        defaultValue={selectedEnquiry.status}
                        onValueChange={async (newStatus) => {
                          try {
                            await bikeAPI.updateEnquiry(selectedEnquiry.id, { status: newStatus });
                            setSelectedEnquiry({ ...selectedEnquiry, status: newStatus });
                            const updatedEnquiries = enquiries.map(e => 
                              e.id === selectedEnquiry.id ? { ...e, status: newStatus } : e
                            );
                            setEnquiries(updatedEnquiries);
                            toast({
                              title: 'Success',
                              description: 'Enquiry status updated successfully'
                            });
                          } catch (error) {
                            toast({
                              title: 'Error',
                              description: 'Failed to update status',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="New">New</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Contacted">Contacted</SelectItem>
                          <SelectItem value="Converted">Converted</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Date</p>
                      <p className="text-base">{new Date(selectedEnquiry.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {selectedEnquiry.message && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Message</p>
                      <p className="text-base bg-secondary/50 p-3 rounded">{selectedEnquiry.message}</p>
                    </div>
                  )}
                  {selectedEnquiry.budget_range && (
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground">Budget Range</p>
                      <p className="text-base">{selectedEnquiry.budget_range}</p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-4">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this enquiry?')) {
                          await bikeAPI.deleteEnquiry(selectedEnquiry.id);
                          setEnquiries(enquiries.filter(e => e.id !== selectedEnquiry.id));
                          setSelectedEnquiry(null);
                          toast({
                            title: 'Success',
                            description: 'Enquiry deleted successfully'
                          });
                        }
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* New Brand Modal */}
        {showNewBrandModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4 border-primary/30 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20">
                <CardTitle className="text-xl">Add New Brand</CardTitle>
                <CardDescription>Create a new brand for your bike inventory</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleAddBrand} className="space-y-4">
                  {/* Brand Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Brand Name *</label>
                    <Input
                      placeholder="e.g., Velocity"
                      value={newBrandForm.name}
                      onChange={(e) => setNewBrandForm({ ...newBrandForm, name: e.target.value })}
                      className="border-primary/30 focus:border-primary/60"
                      required
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Country</label>
                    <Input
                      placeholder="e.g., Japan"
                      value={newBrandForm.country}
                      onChange={(e) => setNewBrandForm({ ...newBrandForm, country: e.target.value })}
                      className="border-primary/30 focus:border-primary/60"
                    />
                  </div>

                  {/* Founded Year */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Founded Year</label>
                    <Input
                      type="number"
                      value={newBrandForm.founded_year}
                      onChange={(e) => setNewBrandForm({ ...newBrandForm, founded_year: e.target.value })}
                      className="border-primary/30 focus:border-primary/60"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowNewBrandModal(false)}
                      className="flex-1 border-primary/30 hover:bg-muted"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 bg-gradient-primary hover:opacity-90"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Creating...' : 'Create Brand'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Bike Modal */}
        {showEditBikeModal && editingBike && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-2xl border-primary/30 shadow-lg max-h-[90vh] overflow-y-auto">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20 sticky top-0">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl">Edit Bike Details</CardTitle>
                  <button
                    onClick={() => setShowEditBikeModal(false)}
                    className="p-1 hover:bg-white/20 rounded-lg transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-4">
                {/* Bike Name */}
                <div>
                  <label className="text-sm font-semibold">Bike Name</label>
                  <Input
                    value={editBikeForm.name || ''}
                    onChange={(e) => setEditBikeForm({ ...editBikeForm, name: e.target.value })}
                    placeholder="Enter bike name"
                  />
                </div>

                {/* Brand */}
                <div>
                  <label className="text-sm font-semibold">Brand</label>
                  <Select value={editBikeForm.brand_id?.toString() || ''} onValueChange={(value) => setEditBikeForm({ ...editBikeForm, brand_id: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.id.toString()}>{brand.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price */}
                <div>
                  <label className="text-sm font-semibold">Price</label>
                  <Input
                    value={editBikeForm.price || ''}
                    onChange={(e) => setEditBikeForm({ ...editBikeForm, price: e.target.value })}
                    placeholder="Enter price"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-semibold">Category</label>
                  <Select value={editBikeForm.category || ''} onValueChange={(value) => setEditBikeForm({ ...editBikeForm, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {['Sports', 'Scooter', 'Commuter', 'Cruiser', 'Adventure', 'Naked'].map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Check if second-hand bike and show condition */}
                {allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Condition</label>
                    <Select value={editBikeForm.condition || ''} onValueChange={(value) => setEditBikeForm({ ...editBikeForm, condition: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {['Excellent', 'Very Good', 'Good', 'Fair'].map((cond) => (
                          <SelectItem key={cond} value={cond}>{cond}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Mileage - Second Hand only */}
                {allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Mileage</label>
                    <Input
                      value={editBikeForm.mileage || ''}
                      onChange={(e) => setEditBikeForm({ ...editBikeForm, mileage: e.target.value })}
                      placeholder="e.g., 5000 km"
                    />
                  </div>
                )}

                {/* Year Manufacture - Second Hand only */}
                {allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Year of Manufacture</label>
                    <Input
                      type="number"
                      value={editBikeForm.year_manufacture || ''}
                      onChange={(e) => setEditBikeForm({ ...editBikeForm, year_manufacture: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="e.g., 2020"
                    />
                  </div>
                )}

                {/* Owner Count - Second Hand only */}
                {allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Number of Owners</label>
                    <Input
                      type="number"
                      value={editBikeForm.owner_count || ''}
                      onChange={(e) => setEditBikeForm({ ...editBikeForm, owner_count: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="e.g., 1"
                    />
                  </div>
                )}

                {/* Registration Number - Second Hand only */}
                {allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Registration Number</label>
                    <Input
                      value={editBikeForm.registration_number || ''}
                      onChange={(e) => setEditBikeForm({ ...editBikeForm, registration_number: e.target.value })}
                      placeholder="e.g., MH02AB1234"
                    />
                  </div>
                )}                {/* Specifications */}
                <div>
                  <label className="text-sm font-semibold">Specifications</label>
                  <Input
                    value={editBikeForm.specs || ''}
                    onChange={(e) => setEditBikeForm({ ...editBikeForm, specs: e.target.value })}
                    placeholder="Enter specifications"
                  />
                </div>

                {/* Engine CC */}
                <div>
                  <label className="text-sm font-semibold">Engine CC</label>
                  <Input
                    type="number"
                    value={editBikeForm.engine_cc || ''}
                    onChange={(e) => setEditBikeForm({ ...editBikeForm, engine_cc: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="e.g., 150"
                  />
                </div>

                {/* Horsepower */}
                <div>
                  <label className="text-sm font-semibold">Horsepower</label>
                  <Input
                    value={editBikeForm.horsepower || ''}
                    onChange={(e) => setEditBikeForm({ ...editBikeForm, horsepower: e.target.value })}
                    placeholder="e.g., 12 bhp"
                  />
                </div>

                {/* Year Model - New bikes only */}
                {!allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Year Model</label>
                    <Input
                      type="number"
                      value={editBikeForm.year_model || ''}
                      onChange={(e) => setEditBikeForm({ ...editBikeForm, year_model: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder="e.g., 2024"
                    />
                  </div>
                )}

                {/* Stock Quantity - New bikes only */}
                {!allSecondHandBikes.some(b => b.id === editingBike.id) && (
                  <div>
                    <label className="text-sm font-semibold">Stock Quantity</label>
                    <Input
                      type="number"
                      value={editBikeForm.stock_quantity || ''}
                      onChange={(e) => setEditBikeForm({ ...editBikeForm, stock_quantity: e.target.value ? parseInt(e.target.value) : 0 })}
                      placeholder="e.g., 5"
                    />
                  </div>
                )}

                {/* Availability */}
                <div>
                  <label className="text-sm font-semibold">Availability</label>
                  <div className="flex items-center gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editBikeForm.availability === true}
                        onChange={() => setEditBikeForm({ ...editBikeForm, availability: true })}
                      />
                      Available
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={editBikeForm.availability === false}
                        onChange={() => setEditBikeForm({ ...editBikeForm, availability: false })}
                      />
                      Not Available
                    </label>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSaveEditBike}
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowEditBikeModal(false)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
