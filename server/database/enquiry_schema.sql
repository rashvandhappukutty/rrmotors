-- ============================================
-- ENQUIRY TABLE - Customer bike enquiries
-- ============================================
CREATE TABLE enquiries (
  id SERIAL PRIMARY KEY,
  
  -- Customer Information
  customer_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  -- Bike Interest
  bike_id INTEGER REFERENCES bikes(id) ON DELETE SET NULL,
  second_hand_bike_id INTEGER REFERENCES second_hand_bikes(id) ON DELETE SET NULL,
  bike_type VARCHAR(20) CHECK (bike_type IN ('new', 'second_hand')),
  
  -- Enquiry Details
  enquiry_type VARCHAR(50) NOT NULL CHECK (enquiry_type IN ('Purchase', 'Test Drive', 'Price Inquiry', 'Finance', 'Exchange', 'Service', 'Career', 'General')),
  subject VARCHAR(255),
  message TEXT,
  budget_range VARCHAR(50),
  preferred_contact VARCHAR(20) CHECK (preferred_contact IN ('Email', 'Phone', 'WhatsApp')),
  
  -- Timeline
  purchase_timeline VARCHAR(30) CHECK (purchase_timeline IN ('Immediate', 'Within 1 month', '1-3 months', '3-6 months', 'Just browsing')),
  
  -- Status and Follow-up
  status VARCHAR(20) DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Contacted', 'Converted', 'Closed')),
  follow_up_date DATE,
  assigned_to VARCHAR(100),
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_enquiries_created_at ON enquiries(created_at);
CREATE INDEX idx_enquiries_bike_id ON enquiries(bike_id);
CREATE INDEX idx_enquiries_second_hand_bike_id ON enquiries(second_hand_bike_id);
CREATE INDEX idx_enquiries_email ON enquiries(email);

-- Add constraint to ensure only one bike type is selected
ALTER TABLE enquiries ADD CONSTRAINT check_bike_type 
  CHECK ((bike_id IS NOT NULL AND second_hand_bike_id IS NULL AND bike_type = 'new') OR 
         (bike_id IS NULL AND second_hand_bike_id IS NOT NULL AND bike_type = 'second_hand') OR 
         (bike_id IS NULL AND second_hand_bike_id IS NULL));