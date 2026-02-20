import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { bikeAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface InsuranceQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InsuranceQuoteModal({ isOpen, onClose }: InsuranceQuoteModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    vehicle_number: '',
    quote_date: '',
    enquiry_type: 'Insurance',
    message: 'Insurance quote request'
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
    if (!formData.customer_name.trim() || !formData.phone.trim() || !formData.vehicle_number.trim() || !formData.quote_date.trim()) {
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
      const placeholderEmail = `insurance+${formData.phone.replace(/\D/g, '')}@bikeshowroom.local`;

      const enquiryData = {
        customer_name: formData.customer_name,
        email: placeholderEmail,
        phone: formData.phone,
        message: `Insurance Quote Request | Vehicle: ${formData.vehicle_number} | Quote Date: ${formData.quote_date}`,
        enquiry_type: 'Insurance',
        status: 'New',
        bike_type: 'new'
      };

      console.log('Submitting insurance quote:', enquiryData);

      const result = await bikeAPI.createEnquiry(enquiryData);

      console.log('Insurance quote response:', result);

      if (result && (result.id || Object.keys(result).length > 0)) {
        toast({
          title: 'Success',
          description: 'Insurance quote request submitted! Our team will contact you soon with the best plans.',
        });
        
        // Reset form
        setFormData({
          customer_name: '',
          phone: '',
          vehicle_number: '',
          quote_date: '',
          enquiry_type: 'Insurance',
          message: 'Insurance quote request'
        });
        
        onClose();
      } else {
        throw new Error('Quote request was not created properly');
      }
    } catch (error) {
      console.error('Insurance quote submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit quote request. Please try again.';
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
          <DialogTitle>Get Insurance Quote</DialogTitle>
          <DialogDescription>
            Please provide your details and we'll send you the best insurance plans.
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

          {/* Vehicle Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Vehicle Number *</label>
            <Input
              placeholder="e.g., MH02AB1234"
              name="vehicle_number"
              value={formData.vehicle_number}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* Quote Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">When do you need coverage? *</label>
            <Input
              type="date"
              name="quote_date"
              value={formData.quote_date}
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
              {isSubmitting ? 'Submitting...' : 'Get Quote'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
