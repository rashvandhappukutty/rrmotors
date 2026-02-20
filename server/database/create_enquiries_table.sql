-- ✅ SIMPLE ENQUIRIES TABLE CREATION
-- Copy this SQL and paste it in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.enquiries (
  id BIGSERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20) NOT NULL,
  bike_id INTEGER DEFAULT NULL,
  second_hand_bike_id INTEGER DEFAULT NULL,
  bike_type VARCHAR(20) DEFAULT 'new',
  enquiry_type VARCHAR(50) NOT NULL DEFAULT 'Service',
  subject VARCHAR(255),
  message TEXT,
  budget_range VARCHAR(50),
  preferred_contact VARCHAR(20),
  purchase_timeline VARCHAR(30),
  status VARCHAR(20) DEFAULT 'New',
  follow_up_date DATE,
  assigned_to VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON public.enquiries(created_at);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(email);

-- Enable security
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Allow all users to access
CREATE POLICY "Allow all" ON public.enquiries FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;
