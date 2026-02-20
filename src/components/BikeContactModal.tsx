import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { bikeAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface BikeContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  bikeName: string;
  bikePrice: string;
}

export function BikeContactModal({ isOpen, onClose, bikeName, bikePrice }: BikeContactModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    enquiry_type: 'Bike Inquiry',
    message: `Inquiry for ${bikeName}`
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
        description: 'Please fill in all required fields',
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

    setIsSubmitting(true);

    try {
      // Generate a placeholder email from phone number
      const placeholderEmail = `inquiry+${formData.phone.replace(/\D/g, '')}@bikeshowroom.local`;

      const enquiryData = {
        customer_name: formData.customer_name,
        email: placeholderEmail,
        phone: formData.phone,
        message: `Bike Inquiry | Bike: ${bikeName} | Price: ₹${bikePrice}`,
        enquiry_type: 'Bike Inquiry',
        status: 'New',
        bike_type: 'new'
      };

      console.log('Submitting bike inquiry:', enquiryData);

      const result = await bikeAPI.createEnquiry(enquiryData);

      console.log('Bike inquiry response:', result);

      if (result && (result.id || Object.keys(result).length > 0)) {
        toast({
          title: 'Success',
          description: `We received your inquiry for ${bikeName}! Our team will contact you soon.`,
        });
        
        // Reset form
        setFormData({
          customer_name: '',
          phone: '',
          enquiry_type: 'Bike Inquiry',
          message: `Inquiry for ${bikeName}`
        });
        
        onClose();
      } else {
        throw new Error('Inquiry was not created properly');
      }
    } catch (error) {
      console.error('Bike inquiry submission failed:', error);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Contact About {bikeName}</DialogTitle>
          <DialogDescription>
            Price: ₹{bikePrice} | Please provide your details and we'll contact you with more information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name *</label>
            <Input
              placeholder="Enter your full name"
              name="customer_name"
              value={formData.customer_name}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mobile Number *</label>
            <Input
              type="tel"
              placeholder="Enter your mobile number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary hover:bg-primary/90"
            >
              {isSubmitting ? 'Submitting...' : 'Contact Now'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
