import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// Initialize careers tables (run once on startup)
async function initializeCareersTables() {
  try {
    console.log('Checking if career tables exist...');
    // Check if table exists by trying to query it
    const { data: existingTables, error: checkError } = await supabase
      .from('job_postings')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      // Table doesn't exist, we'll let the user know they need to create it
      console.log('Job postings table not found. User will need to initialize it.');
    } else {
      console.log('✅ Career tables exist and are accessible');
    }
  } catch (error) {
    console.log('Career tables check completed:', error.message);
  }
}

// Initialize on module load
initializeCareersTables();

// API endpoint to initialize/check tables
router.get('/init', async (req, res) => {
  try {
    // Test if we can access the job_postings table
    const { data, error } = await supabase
      .from('job_postings')
      .select('id')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      return res.status(503).json({
        message: 'Careers system not initialized',
        initialized: false,
        setupUrl: 'https://supabase.com/docs/guides/database/tables',
        instructions: 'Please run the SQL setup script in your Supabase dashboard'
      });
    }

    res.json({
      message: 'Careers system is ready',
      initialized: true
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error checking careers system',
      error: error.message
    });
  }
});

// Get all active job postings
router.get('/jobs', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching job postings:', error);
    res.status(500).json({
      message: 'Error fetching job postings',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get single job posting
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('job_postings')
      .select('*')
      .eq('id', parseInt(id))
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Job posting not found' });
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching job posting:', error);
    res.status(500).json({
      message: 'Error fetching job posting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Submit career application
router.post('/careers/applications', async (req, res) => {
  try {
    const { job_id, name, mobile_number, experience_years, cover_letter } = req.body;

    // Validation
    if (!job_id || !name || !mobile_number || experience_years === undefined) {
      return res.status(400).json({
        message: 'Missing required fields: job_id, name, mobile_number, experience_years',
      });
    }

    // Insert application
    const { data, error } = await supabase
      .from('career_applications')
      .insert([
        {
          job_id,
          name,
          mobile_number,
          experience_years,
          cover_letter: cover_letter || null,
          status: 'new',
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      data: data[0],
    });
  } catch (error) {
    console.error('Error submitting career application:', error);
    res.status(500).json({
      message: 'Error submitting application',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get all career applications (Admin only)
router.get('/admin/applications', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('career_applications')
      .select(
        `
        id,
        job_id,
        name,
        mobile_number,
        experience_years,
        cover_letter,
        status,
        applied_at,
        job_postings (
          title,
          department
        )
      `
      )
      .order('applied_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      // If there's an error with the join, try without the join
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('career_applications')
        .select('*')
        .order('applied_at', { ascending: false });
      
      if (fallbackError) throw fallbackError;
      return res.json(fallbackData || []);
    }

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      message: 'Error fetching applications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get applications for a specific job (Admin only)
router.get('/admin/applications/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const { data, error } = await supabase
      .from('career_applications')
      .select('*')
      .eq('job_id', parseInt(jobId))
      .order('applied_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      message: 'Error fetching job applications',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update application status (Admin only)
router.put('/admin/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }

    const { data, error } = await supabase
      .from('career_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', parseInt(id))
      .select();

    if (error) throw error;

    res.json({
      message: 'Application status updated',
      data: data[0],
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      message: 'Error updating application',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Create job posting (Admin only)
router.post('/admin/jobs', async (req, res) => {
  try {
    const { title, department, description, location, experience_required } = req.body;

    console.log('Creating job posting:', { title, department, description, location, experience_required });

    if (!title || !department || !description || !location) {
      return res.status(400).json({
        message: 'Missing required fields: title, department, description, location',
      });
    }

    const { data, error } = await supabase
      .from('job_postings')
      .insert([
        {
          title,
          department,
          description,
          location,
          experience_required: experience_required || null,
          status: 'active',
        },
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Job posting created successfully:', data);

    res.status(201).json({
      message: 'Job posting created',
      data: data[0],
    });
  } catch (error) {
    console.error('Error creating job posting:', error);
    res.status(500).json({
      message: 'Error creating job posting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Update job posting (Admin only)
router.put('/admin/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, department, description, location, experience_required, status } = req.body;

    const { data, error } = await supabase
      .from('job_postings')
      .update({
        title,
        department,
        description,
        location,
        experience_required: experience_required || null,
        status: status || 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', parseInt(id))
      .select();

    if (error) throw error;

    res.json({
      message: 'Job posting updated',
      data: data[0],
    });
  } catch (error) {
    console.error('Error updating job posting:', error);
    res.status(500).json({
      message: 'Error updating job posting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Delete job posting (Admin only)
router.delete('/admin/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('job_postings')
      .delete()
      .eq('id', parseInt(id));

    if (error) throw error;

    res.json({ message: 'Job posting deleted' });
  } catch (error) {
    console.error('Error deleting job posting:', error);
    res.status(500).json({
      message: 'Error deleting job posting',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
