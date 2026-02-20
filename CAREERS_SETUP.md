# Careers Feature Setup Instructions

## Step 1: Create Tables in Supabase

You need to run the SQL migrations in your Supabase database. Follow these steps:

1. Go to your Supabase project dashboard
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the following SQL code:

```sql
-- ============================================
-- CAREERS TABLES for Job Postings and Applications
-- ============================================

-- Job Postings Table
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

-- Job Applications Table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(status);
CREATE INDEX IF NOT EXISTS idx_career_applications_job_id ON career_applications(job_id);
CREATE INDEX IF NOT EXISTS idx_career_applications_status ON career_applications(status);

-- Enable RLS (Row Level Security)
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for job postings, write for applications)
CREATE POLICY "Allow public read access to active job postings" 
ON job_postings FOR SELECT 
USING (status = 'active');

CREATE POLICY "Allow public insert to career applications" 
ON career_applications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read access to own applications" 
ON career_applications FOR SELECT 
USING (true);
```

5. Click "Run" to execute the SQL
6. You should see a success message

## Step 2: Verify Tables Were Created

1. Go to the "Table Editor" in Supabase
2. You should see:
   - `job_postings` table
   - `career_applications` table

## Step 3: Verify RLS Policies

**IMPORTANT**: The RLS policies are critical for the feature to work properly. If you see "Failed to load applications" error, check that the policies are set up correctly.

1. In Supabase, go to **Authentication** → **Row Level Security** (or **SQL** section)
2. Run this SQL to verify/update policies:

```sql
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to active job postings" ON job_postings;
DROP POLICY IF EXISTS "Allow public insert to career applications" ON career_applications;
DROP POLICY IF EXISTS "Allow public read access to own applications" ON career_applications;
DROP POLICY IF EXISTS "Allow admin read access to all applications" ON career_applications;

-- Recreate policies
CREATE POLICY "Allow public read access to active job postings" 
ON job_postings FOR SELECT 
USING (status = 'active');

CREATE POLICY "Allow public insert to career applications" 
ON career_applications FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public read all applications" 
ON career_applications FOR SELECT 
USING (true);

CREATE POLICY "Allow insert to career_applications" 
ON career_applications FOR INSERT 
WITH CHECK (true);
```

3. Click "Run"

## Step 4: Test the Feature

1. Restart your development server (if it's running)
2. Go to the Careers page at `/careers`
3. Go to Admin panel at `/admin` (login required)
4. Admin should now be able to create job postings from the Admin panel
5. Users can apply for jobs

## Troubleshooting

### Issue: "Setup Required" message on Careers page

**Solution**: The job_postings table hasn't been created yet. Follow Step 1 above.

### Issue: "Failed to load applications" error in Admin panel

**Solution**: One of these issues:
1. Career tables not created - run Step 1
2. RLS policies not set up correctly - run Step 3
3. Supabase connection issue - check your `.env` file has correct `SUPABASE_URL` and `SUPABASE_ANON_KEY`

To debug:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try to load the admin panel
4. Check if `/api/admin/applications` request returns 200 or an error
5. Look at the response to see the exact error message
6. Check your backend terminal for error logs

### Issue: Can't create job postings

**Solution**: Check that:
1. Tables are created (verify in Supabase Table Editor)
2. RLS policies allow INSERT on job_postings for your user (should be enabled by default)
3. Backend server is running and connected to Supabase

### Issue: Applications don't show up after submitting

**Solution**: 
1. Check that the application was inserted (should see success toast)
2. Go to Admin panel and refresh
3. If still not showing, check Supabase → Table Editor → career_applications to see if data exists
4. If data exists but not showing in admin panel, it's likely an RLS policy issue

## API Endpoints Available

Once tables are created:

- `GET /api/init` - Check if careers system is initialized
- `GET /api/jobs` - Get all active job postings
- `POST /api/careers/applications` - Submit job application
- `GET /api/admin/applications` - Get all applications (requires proper RLS)
- `POST /api/admin/jobs` - Create a new job posting
- `PUT /api/admin/jobs/:id` - Update job posting
- `DELETE /api/admin/jobs/:id` - Delete job posting
- `PUT /api/admin/applications/:id` - Update application status
- `GET /api/admin/applications` - Get all applications
