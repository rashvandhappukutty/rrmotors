import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { X } from 'lucide-react';

interface CareerEnquiryFormProps {
  onClose: () => void;
}

export function CareerEnquiryForm({ onClose }: CareerEnquiryFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    job_role: '',
    experience_years: '',
    expected_salary: '',
    message: ''
  });

  const jobRoles = [
    'Sales Executive',
    'Mechanic',
    'Service Advisor',
    'Technician',
    'Manager',
    'Administrative Staff',
    'Other'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (value: string, field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.customer_name.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your name',
        variant: 'destructive'
      });
      return false;
    }

    // Email is required
    if (!formData.email.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your email address',
        variant: 'destructive'
      });
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid phone number (at least 10 digits)',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.job_role) {
      toast({
        title: 'Validation Error',
        description: 'Please select a job role',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.experience_years) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your experience',
        variant: 'destructive'
      });
      return false;
    }

    if (!formData.expected_salary) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your expected salary',
        variant: 'destructive'
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/bikes/enquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_name: formData.customer_name,
          email: formData.email,
          phone: formData.phone,
          enquiry_type: 'Career',
          message: `Job Role: ${formData.job_role}\nExperience: ${formData.experience_years} years\nExpected Salary: ${formData.expected_salary}\n\nAdditional Info:\n${formData.message}`
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      if (data.success || data.id) {
        toast({
          title: 'Success!',
          description: 'Your job application has been submitted. We will review it and contact you soon.',
        });
        onClose();
      } else {
        throw new Error(data.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit your application. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl border-primary/30 shadow-lg max-h-[90vh] overflow-y-auto">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-primary/20 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Job Application Form</CardTitle>
              <CardDescription>Apply for a position at our showroom</CardDescription>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-2">Full Name *</label>
              <Input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Address *</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2">Phone Number *</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </div>

            {/* Job Role */}
            <div>
              <label className="block text-sm font-medium mb-2">Job Role *</label>
              <Select
                value={formData.job_role}
                onValueChange={(value) => handleSelectChange(value, 'job_role')}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a job role" />
                </SelectTrigger>
                <SelectContent>
                  {jobRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-2">Experience (in years) *</label>
              <Input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                placeholder="e.g., 3"
                min="0"
                disabled={isLoading}
              />
            </div>

            {/* Expected Salary */}
            <div>
              <label className="block text-sm font-medium mb-2">Expected Salary (Monthly) *</label>
              <Input
                type="text"
                name="expected_salary"
                value={formData.expected_salary}
                onChange={handleChange}
                placeholder="e.g., 25,000 - 30,000"
                disabled={isLoading}
              />
            </div>

            {/* Additional Message */}
            <div>
              <label className="block text-sm font-medium mb-2">Additional Information</label>
              <Textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Tell us more about yourself, your skills, and why you're interested in joining our team..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isLoading ? 'Submitting...' : 'Submit Application'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
