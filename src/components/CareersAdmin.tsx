import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, X, Loader2, Phone, Calendar } from 'lucide-react';
import { API_URL } from '@/lib/api';

interface JobPosting {
  id: number;
  title: string;
  department: string;
  description: string;
  location: string;
  experience_required: string;
  status: string;
  created_at: string;
}

interface CareerApplication {
  id: number;
  job_id: number;
  name: string;
  mobile_number: string;
  experience_years: number;
  cover_letter: string;
  status: string;
  applied_at: string;
  job_postings?: {
    title: string;
    department: string;
  };
}

export function CareersAdmin() {
  const { toast } = useToast();
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [newJobOpen, setNewJobOpen] = useState(false);
  const [newJobData, setNewJobData] = useState({
    title: '',
    department: '',
    description: '',
    location: '',
    experience_required: '',
  });

  useEffect(() => {
    fetchJobPostings();
    fetchApplications();

    // Retry fetching applications every 15 seconds in case they fail initially
    const retryInterval = setInterval(() => {
      fetchApplications();
    }, 15000);

    return () => clearInterval(retryInterval);
  }, []);

  const fetchJobPostings = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);
      if (!response.ok) {
        console.error('HTTP Error:', response.status);
        throw new Error(`HTTP ${response.status}: Failed to fetch jobs`);
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
      console.error('Error fetching jobs:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load job postings. Please ensure career tables are set up in Supabase.',
        variant: 'destructive',
      });
      setJobPostings([]);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/admin/applications`);
      if (!response.ok) {
        console.error('HTTP Error:', response.status);
        throw new Error(`HTTP ${response.status}: Failed to fetch applications`);
      }
      const contentType = response.headers.get('content-type');
      let data = [];
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        console.warn('Response is not JSON');
        data = [];
      }
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load applications. Please ensure career tables are set up in Supabase.',
        variant: 'destructive',
      });
      setApplications([]);
    }
  };

  const handleCreateJob = async () => {
    if (
      !newJobData.title ||
      !newJobData.department ||
      !newJobData.description ||
      !newJobData.location
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/admin/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to create job');
      }

      toast({
        title: 'Success',
        description: 'Job posting created successfully',
      });

      setNewJobData({
        title: '',
        department: '',
        description: '',
        location: '',
        experience_required: '',
      });
      setNewJobOpen(false);
      fetchJobPostings();
    } catch (error) {
      console.error('Error creating job:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create job posting. Make sure the careers tables are created in Supabase.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApplicationStatus = async (appId: number, newStatus: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update status');

      toast({
        title: 'Success',
        description: 'Application status updated',
      });

      fetchApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      toast({
        title: 'Error',
        description: 'Failed to update application status',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;

    try {
      const response = await fetch(`${API_URL}/admin/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');

      toast({
        title: 'Success',
        description: 'Job posting deleted',
      });

      fetchJobPostings();
      fetchApplications();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete job posting',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Job Postings Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-white">Job Postings</h3>
          <Dialog open={newJobOpen} onOpenChange={setNewJobOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Post New Job
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-950 border-gray-800 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Job Posting</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Add a new job position to attract talented candidates
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title *
                  </label>
                  <Input
                    value={newJobData.title}
                    onChange={(e) =>
                      setNewJobData({ ...newJobData, title: e.target.value })
                    }
                    placeholder="e.g., Motorcycle Mechanic"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Department *
                  </label>
                  <Input
                    value={newJobData.department}
                    onChange={(e) =>
                      setNewJobData({ ...newJobData, department: e.target.value })
                    }
                    placeholder="e.g., Service, Sales, Management"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location *
                  </label>
                  <Input
                    value={newJobData.location}
                    onChange={(e) =>
                      setNewJobData({ ...newJobData, location: e.target.value })
                    }
                    placeholder="e.g., Coimbatore"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Required Experience
                  </label>
                  <Input
                    value={newJobData.experience_required}
                    onChange={(e) =>
                      setNewJobData({
                        ...newJobData,
                        experience_required: e.target.value,
                      })
                    }
                    placeholder="e.g., 2-3 years"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={newJobData.description}
                    onChange={(e) =>
                      setNewJobData({ ...newJobData, description: e.target.value })
                    }
                    placeholder="Job description, responsibilities, requirements..."
                    className="bg-gray-800 border-gray-700 text-white resize-none"
                    rows={6}
                  />
                </div>

                <Button
                  onClick={handleCreateJob}
                  disabled={loading}
                  className="w-full bg-gradient-primary hover:opacity-90"
                >
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {loading ? 'Creating...' : 'Create Job Posting'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {jobPostings.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
            <p className="text-gray-400">No job postings yet. Create one to start recruiting!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobPostings.map((job) => (
              <Card key={job.id} className="bg-gray-900/50 border-gray-800 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{job.title}</h4>
                    <p className="text-sm text-primary">{job.department}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-400 mb-2">{job.location}</p>
                {job.experience_required && (
                  <p className="text-xs text-gray-500">{job.experience_required}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Status: <span className="text-primary">{job.status}</span>
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Applications Section */}
      <div>
        <h3 className="text-2xl font-bold text-white mb-6">Career Applications</h3>
        {applications.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-800 p-8 text-center">
            <p className="text-gray-400">No applications yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Card
                key={app.id}
                className="bg-gray-900/50 border-gray-800 p-4 hover:border-primary/50 transition-all"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Candidate</p>
                    <p className="text-white font-semibold">{app.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Position</p>
                    <p className="text-white font-semibold">
                      {app.job_postings?.title || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Mobile
                    </p>
                    <p className="text-white font-mono text-sm">{app.mobile_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Experience</p>
                    <p className="text-white font-semibold">{app.experience_years} years</p>
                  </div>
                </div>

                {app.cover_letter && (
                  <div className="mb-4 p-3 bg-gray-800/50 rounded border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Cover Letter</p>
                    <p className="text-sm text-gray-300">{app.cover_letter}</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(app.applied_at).toLocaleDateString()}
                  </div>

                  <Select
                    value={app.status}
                    onValueChange={(value) =>
                      handleUpdateApplicationStatus(app.id, value)
                    }
                  >
                    <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="reviewed">Reviewed</SelectItem>
                      <SelectItem value="shortlisted">Shortlisted</SelectItem>
                      <SelectItem value="selected">Selected</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
