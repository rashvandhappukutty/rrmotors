import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { bikeAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

interface FinanceQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinanceQuoteModal({ isOpen, onClose }: FinanceQuoteModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    vehicle_number: '',
    finance_amount: '',
    enquiry_type: 'Finance',
    message: 'Finance enquiry from customer'
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
    if (!formData.customer_name.trim() || !formData.phone.trim() || !formData.vehicle_number.trim() || !formData.finance_amount.trim()) {
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
      const placeholderEmail = `finance+${formData.phone.replace(/\D/g, '')}@bikeshowroom.local`;

      const enquiryData = {
        customer_name: formData.customer_name,
        email: placeholderEmail,
        phone: formData.phone,
        message: `Finance Enquiry | Vehicle: ${formData.vehicle_number} | Finance Amount Needed: ₹${formData.finance_amount}`,
        enquiry_type: 'Finance',
        status: 'New',
        bike_type: 'new'
      };

      console.log('Submitting finance enquiry:', enquiryData);

      const result = await bikeAPI.createEnquiry(enquiryData);

      console.log('Finance enquiry response:', result);

      if (result && (result.id || Object.keys(result).length > 0)) {
        toast({
          title: 'Success',
          description: 'Finance enquiry submitted! Our team will contact you soon with the best financing options.',
        });
        
        // Reset form
        setFormData({
          customer_name: '',
          phone: '',
          vehicle_number: '',
          finance_amount: '',
          enquiry_type: 'Finance',
          message: 'Finance enquiry from customer'
        });
        
        onClose();
      } else {
        throw new Error('Finance enquiry was not created properly');
      }
    } catch (error) {
      console.error('Finance enquiry submission failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit finance enquiry. Please try again.';
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
          <DialogTitle>Get Finance Options</DialogTitle>
          <DialogDescription>
            Please provide your details and we'll send you the best financing options.
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

          {/* Finance Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Finance Amount Needed (₹) *</label>
            <Input
              type="number"
              placeholder="e.g., 500000"
              name="finance_amount"
              value={formData.finance_amount}
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
              {isSubmitting ? 'Submitting...' : 'Get Finance Options'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
