import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { bikeAPI } from '@/lib/api';

interface CareersApplicationFormProps {
  jobId: number;
  jobTitle: string;
  onSubmitSuccess: () => void;
}

export function CareersApplicationForm({
  jobId,
  jobTitle,
  onSubmitSuccess,
}: CareersApplicationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    email: '',
    experience_years: '',
    expected_salary: '',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.customer_name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your name',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.phone.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your mobile number',
        variant: 'destructive',
      });
      return;
    }

    // Basic phone number validation (at least 10 digits)
    const phoneDigitsOnly = formData.phone.replace(/\D/g, '');
    if (phoneDigitsOnly.length < 10) {
      toast({
        title: 'Error',
        description: 'Please enter a valid mobile number (at least 10 digits)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.experience_years) {
      toast({
        title: 'Error',
        description: 'Please enter your experience (in years)',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.expected_salary.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your expected salary',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await bikeAPI.createEnquiry({
        customer_name: formData.customer_name,
        email: formData.email,
        phone: formData.phone,
        enquiry_type: 'Career',
        message: `Job Position: ${jobTitle}\nExperience: ${formData.experience_years} years\nExpected Salary: ${formData.expected_salary}\nAdditional Info: ${formData.message}`,
        budget_range: formData.expected_salary,
        status: 'New',
        preferred_contact: 'Phone',
      });

      toast({
        title: 'Success',
        description: 'Your application has been submitted successfully! We will contact you soon.',
      });

      // Reset form
      setFormData({
        customer_name: '',
        phone: '',
        email: '',
        experience_years: '',
        expected_salary: '',
        message: '',
      });

      onSubmitSuccess();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error
            ? error.message
            : 'Failed to submit application. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Full Name *
        </label>
        <Input
          name="customer_name"
          value={formData.customer_name}
          onChange={handleChange}
          placeholder="John Doe"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Email Address *
        </label>
        <Input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Mobile Number *
        </label>
        <Input
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="9876543210"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Experience (Years) *
        </label>
        <Input
          type="number"
          name="experience_years"
          value={formData.experience_years}
          onChange={handleChange}
          placeholder="e.g., 2"
          min="0"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Expected Salary *
        </label>
        <Input
          name="expected_salary"
          value={formData.expected_salary}
          onChange={handleChange}
          placeholder="e.g., 50,000 - 75,000 per month"
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Additional Information
        </label>
        <Textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          placeholder="Tell us why you're interested in this position..."
          className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 resize-none"
          rows={3}
          disabled={loading}
        />
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-primary hover:opacity-90"
      >
        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  );
}
