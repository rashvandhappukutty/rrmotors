import { supabase } from '../config/supabase.js';

async function initializeCareersTables() {
  try {
    console.log('Initializing careers tables...');

    // Create job_postings table
    const { error: jobPostingsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS job_postings (
          id SERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          department VARCHAR(100) NOT NULL,
          description TEXT NOT NULL,
          location VARCHAR(100) NOT NULL,
          experience_required VARCHAR(100),
          status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (jobPostingsError && !jobPostingsError.message?.includes('already exists')) {
      console.log('Job postings table might already exist or using native SQL approach');
    }

    // Create career_applications table
    const { error: applicationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS career_applications (
          id SERIAL PRIMARY KEY,
          job_id INTEGER NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          mobile_number VARCHAR(20) NOT NULL,
          experience_years INTEGER NOT NULL,
          cover_letter TEXT,
          status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'shortlisted', 'rejected', 'selected')),
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (applicationsError && !applicationsError.message?.includes('already exists')) {
      console.log('Career applications table might already exist or using native SQL approach');
    }

    console.log('✅ Careers tables initialization completed');
    return true;
  } catch (error) {
    console.error('Error initializing careers tables:', error);
    return false;
  }
}

export default initializeCareersTables;
