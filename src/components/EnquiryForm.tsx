import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { submitEnquiry } from '@/lib/googleSheetsAPI';

interface EnquiryFormProps {
  bikeId?: string;
  bikeType?: string;
  bikeName?: string;
}

export function EnquiryForm({ bikeId, bikeType, bikeName }: EnquiryFormProps) {
  const [formData, setFormData] = useState({
    customer_name: '',
    email: '',
    phone: '',
    bike_id: bikeId || '',
    bike_type: bikeType || '',
    enquiry_type: '',
    message: '',
    budget_range: '',
    preferred_contact: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await submitEnquiry({
        ...formData,
        message: `Enquiry for ${bikeName || 'bike'}: ${formData.message}`
      });

      if (result.success) {
        setIsSubmitted(true);
        // Reset form
        setFormData({
          customer_name: '',
          email: '',
          phone: '',
          bike_id: bikeId || '',
          bike_type: bikeType || '',
          enquiry_type: '',
          message: '',
          budget_range: '',
          preferred_contact: ''
        });
      }
    } catch (error) {
      console.error('Enquiry submission failed:', error);
      alert('Failed to submit enquiry. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-2">
          Enquiry Submitted Successfully!
        </h3>
        <p className="text-green-700 mb-4">
          Thank you for your interest. Our team will contact you soon.
        </p>
        <Button 
          onClick={() => setIsSubmitted(false)}
          variant="outline"
        >
          Submit Another Enquiry
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-xl font-semibold mb-4">Enquire Now</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Your Name *"
            value={formData.customer_name}
            onChange={(e) => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
            required
          />
          <Input
            type="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="tel"
            placeholder="Phone Number *"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            required
          />
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, enquiry_type: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Enquiry Type *" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Purchase">Purchase</SelectItem>
              <SelectItem value="Test Drive">Test Drive</SelectItem>
              <SelectItem value="Price Inquiry">Price Inquiry</SelectItem>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Exchange">Exchange</SelectItem>
              <SelectItem value="General">General</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget_range: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Budget Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="₹50K-1 Lakh">₹50K-1 Lakh</SelectItem>
              <SelectItem value="₹1-2 Lakhs">₹1-2 Lakhs</SelectItem>
              <SelectItem value="₹2-3 Lakhs">₹2-3 Lakhs</SelectItem>
              <SelectItem value="₹3+ Lakhs">₹3+ Lakhs</SelectItem>
            </SelectContent>
          </Select>
          
          <Select onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_contact: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Preferred Contact" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phone">Phone</SelectItem>
              <SelectItem value="WhatsApp">WhatsApp</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Textarea
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
          rows={3}
        />

        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Enquiry'}
        </Button>
      </form>
    </div>
  );
}