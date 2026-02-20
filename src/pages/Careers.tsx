import { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CareersApplicationForm } from '../components/CareersApplicationForm';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface JobPosting {
  id: number;
  title: string;
  description: string;
  department: string;
  location: string;
  experience_required: string;
  created_at: string;
}

export default function Careers() {
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkInitialization();
  }, []);

  const checkInitialization = async () => {
    try {
      const response = await fetch('/api/init');
      if (!response.ok) {
        throw new Error('Failed to check initialization');
      }
      const contentType = response.headers.get('content-type');
      let data = { initialized: false };
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        console.warn('Response is not JSON');
        data = { initialized: false };
      }
      setIsInitialized(data.initialized);
      if (data.initialized) {
        fetchJobPostings();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking initialization:', error);
      setIsInitialized(false);
      setLoading(false);
    }
  };

  const fetchJobPostings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs');
      if (!response.ok) {
        console.error('HTTP Error:', response.status);
        throw new Error(`HTTP ${response.status}: Failed to fetch job postings`);
      }
      const contentType = response.headers.get('content-type');
      let data = [];
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        console.warn('Response is not JSON');
        data = [];
      }
      setJobPostings(data || []);
    } catch (error) {
      console.error('Error fetching job postings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load job postings',
        variant: 'destructive',
      });
      setJobPostings([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyClick = (job: JobPosting) => {
    setSelectedJob(job);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container-custom">
          {/* Header Section */}
          <div className="mb-16 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-4">
              Join Our <span className="text-gradient">Team</span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Be part of RR Motors and help us deliver excellence in every ride. 
              Explore exciting career opportunities with us.
            </p>
          </div>

          {/* Job Postings */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Loading job postings...</p>
            </div>
          ) : !isInitialized ? (
            <Card className="bg-red-950/20 border-red-800 p-8 max-w-2xl mx-auto">
              <div className="text-center">
                <h3 className="text-xl font-bold text-red-400 mb-2">Setup Required</h3>
                <p className="text-gray-300 mb-4">
                  The careers system needs to be initialized. Please follow these steps:
                </p>
                <ol className="text-left text-sm text-gray-400 space-y-2 mb-6 inline-block">
                  <li>1. Go to your Supabase project dashboard</li>
                  <li>2. Click on "SQL Editor" in the left sidebar</li>
                  <li>3. Click "New Query" and copy the SQL from CAREERS_SETUP.md</li>
                  <li>4. Click "Run" to create the tables</li>
                  <li>5. Refresh this page</li>
                </ol>
                <Button 
                  onClick={() => checkInitialization()}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  Retry
                </Button>
              </div>
            </Card>
          ) : jobPostings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No job postings available at the moment.</p>
              <p className="text-gray-500 text-sm mt-2">Please check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              {jobPostings.map((job) => (
                <Card key={job.id} className="bg-gray-900/50 border-gray-800 hover:border-primary/50 transition-all duration-300 overflow-hidden group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors mb-2">
                          {job.title}
                        </h3>
                        <p className="text-sm text-primary font-semibold">{job.department}</p>
                      </div>
                      <Briefcase className="w-5 h-5 text-primary" />
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      {job.experience_required && (
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {job.experience_required}
                        </div>
                      )}
                    </div>

                    <Dialog open={dialogOpen && selectedJob?.id === job.id} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full bg-gradient-primary hover:opacity-90"
                          onClick={() => handleApplyClick(job)}
                        >
                          Apply Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-gray-950 border-gray-800 max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-white">Apply for {selectedJob?.title}</DialogTitle>
                          <DialogDescription className="text-gray-400">
                            Fill in your details to apply for this position
                          </DialogDescription>
                        </DialogHeader>
                        {selectedJob && (
                          <CareersApplicationForm
                            jobId={selectedJob.id}
                            jobTitle={selectedJob.title}
                            onSubmitSuccess={() => {
                              setDialogOpen(false);
                              setSelectedJob(null);
                            }}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
