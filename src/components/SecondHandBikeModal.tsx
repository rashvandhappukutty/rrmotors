import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { bikeAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

interface SecondHandBike {
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

interface SecondHandBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  bike: SecondHandBike | null;
}

export function SecondHandBikeModal({ isOpen, onClose, bike }: SecondHandBikeModalProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    asking_price: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.customer_name.trim() || !formData.phone.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields (Name and Phone)',
        variant: 'destructive'
      });
      return;
    }

    // Validate phone format
    const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number (minimum 10 digits)',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.asking_price.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your asking price',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a placeholder email from phone number
      const placeholderEmail = `inquiry+${formData.phone.replace(/\D/g, '')}@bikeshowroom.local`;

      const enquiryData = {
        customer_name: formData.customer_name,
        email: placeholderEmail,
        phone: formData.phone,
        message: `Second Hand Bike Inquiry | Bike: ${bike?.brands.name} ${bike?.name} | Listed Price: ₹${bike?.price} | Asking Price: ₹${formData.asking_price}`,
        enquiry_type: 'Second Hand Bike Inquiry',
        status: 'New',
        bike_type: 'second_hand',
        bike_id: bike?.id
      };

      console.log('Submitting second-hand bike inquiry:', enquiryData);

      const result = await bikeAPI.createEnquiry(enquiryData);

      console.log('Inquiry response:', result);

      if (result && (result.id || Object.keys(result).length > 0)) {
        toast({
          title: 'Success',
          description: `Your inquiry for ${bike?.brands.name} ${bike?.name} has been submitted! Our team will contact you soon.`,
        });

        // Reset form
        setFormData({
          customer_name: '',
          phone: '',
          asking_price: ''
        });
        
        setActiveTab('details');
        onClose();
      } else {
        throw new Error('Inquiry was not created properly');
      }
    } catch (error) {
      console.error('Inquiry submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit inquiry. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bike) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{bike.brands.name} {bike.name}</DialogTitle>
          <DialogDescription>
            {bike.year_manufacture && <span>{bike.year_manufacture} • </span>}
            {bike.condition && <span className="capitalize">{bike.condition} • </span>}
            {bike.mileage && <span>{bike.mileage}</span>}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Vehicle Details</TabsTrigger>
            <TabsTrigger value="contact">Contact Form</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {/* Bike Image */}
            {bike.image_url && (
              <div className="w-full h-64 rounded-lg overflow-hidden">
                <img
                  src={bike.image_url}
                  alt={`${bike.brands.name} ${bike.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Price Information */}
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-3xl font-bold text-primary">{bike.price}</p>
                </div>
                {bike.original_price && (
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Original Price</p>
                    <p className="text-xl line-through text-muted-foreground">{bike.original_price}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-4">
              {bike.year_manufacture && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Year of Manufacture</p>
                  <p className="font-semibold">{bike.year_manufacture}</p>
                </div>
              )}
              {bike.mileage && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Mileage</p>
                  <p className="font-semibold">{bike.mileage}</p>
                </div>
              )}
              {bike.condition && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="font-semibold capitalize">{bike.condition}</p>
                </div>
              )}
              {bike.registration_number && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Registration Number</p>
                  <p className="font-semibold">{bike.registration_number}</p>
                </div>
              )}
              {bike.engine_cc && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Engine CC</p>
                  <p className="font-semibold">{bike.engine_cc}</p>
                </div>
              )}
              {bike.horsepower && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Horsepower</p>
                  <p className="font-semibold">{bike.horsepower}</p>
                </div>
              )}
              {bike.color && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Color</p>
                  <p className="font-semibold">{bike.color}</p>
                </div>
              )}
            </div>

            {bike.specs && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Specifications</p>
                <p className="text-sm leading-relaxed">{bike.specs}</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Your Name *</label>
                <Input
                  placeholder="Enter your full name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Mobile Number *</label>
                <Input
                  placeholder="Enter your mobile number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">Your Asking Price *</label>
                <Input
                  placeholder="e.g., ₹3,25,000"
                  name="asking_price"
                  value={formData.asking_price}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg text-sm text-blue-800 dark:text-blue-200">
                <p>We will review your inquiry and contact you shortly with the bike information and next steps.</p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Inquiry'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
