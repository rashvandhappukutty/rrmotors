import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { bikeAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType?: string;
}

export function BookingModal({ isOpen, onClose, serviceType = 'Service' }: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    vehicle_number: '',
    service_date: '',
    enquiry_type: 'Service',
    message: `Service booking for ${serviceType}`
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
    if (!formData.customer_name.trim() || !formData.phone.trim() || !formData.vehicle_number.trim() || !formData.service_date.trim()) {
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
      // Generate a placeholder email from phone number if not provided
      const placeholderEmail = `booking+${formData.phone.replace(/\D/g, '')}@bikeshowroom.local`;

      const enquiryData = {
        customer_name: formData.customer_name,
        email: placeholderEmail,
        phone: formData.phone,
        message: `Service: ${serviceType} | Vehicle: ${formData.vehicle_number} | Service Date: ${formData.service_date}`,
        enquiry_type: 'Service',
        status: 'New',
        bike_type: 'new'
      };

      console.log('Submitting enquiry:', enquiryData);

      const result = await bikeAPI.createEnquiry(enquiryData);

      console.log('Enquiry response:', result);

      if (result && (result.id || Object.keys(result).length > 0 || result.success || result.data)) {
        toast({
          title: 'Success',
          description: 'Service booking confirmed! Our team will contact you soon.',
        });
        
        // Reset form
        setFormData({
          customer_name: '',
          phone: '',
          vehicle_number: '',
          service_date: '',
          enquiry_type: 'Service',
          message: `Service booking for ${serviceType}`
        });
        
        onClose();
      } else {
        throw new Error('Booking was not created properly');
      }
    } catch (error) {
      console.error('Booking submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit booking. Please try again.';
      
      // Check if it's a cold start error
      const isColdStart = errorMessage.includes('waking up') || 
                         errorMessage.includes('attempts') || 
                         errorMessage.includes('Failed to fetch') ||
                         errorMessage.includes('timeout') ||
                         errorMessage.includes('Timeout');
      
      toast({
        title: 'Booking Failed',
        description: isColdStart
          ? 'Server is waking up. The system tried multiple times automatically. Please wait 30 seconds and try again, or refresh the page.'
          : errorMessage,
        variant: 'destructive',
        duration: 8000 // Show for 8 seconds to give user time to read
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {serviceType}</DialogTitle>
          <DialogDescription>
            Please provide your details and preferred service date.
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

          {/* Service Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Preferred Service Date *</label>
            <Input
              type="date"
              name="service_date"
              value={formData.service_date}
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
              {isSubmitting ? 'Submitting...' : 'Submit Booking'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
