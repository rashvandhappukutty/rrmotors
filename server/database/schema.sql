-- ============================================
-- RR Motors Bike Showroom Database Schema
-- Database: PostgreSQL (Supabase)
-- Simplified schema with 3 main tables:
-- 1. brands - Master brand list
-- 2. bikes - New bikes inventory
-- 3. second_hand_bikes - Pre-owned/used bikes
-- ============================================

-- ============================================
-- BRANDS TABLE - Master list of brands
-- ============================================
CREATE TABLE brands (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  logo_url TEXT,
  country VARCHAR(100),
  founded_year INTEGER,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- BIKES TABLE - New bikes inventory
-- ============================================
CREATE TABLE bikes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  price VARCHAR(50) NOT NULL,
  original_price VARCHAR(50),
  category VARCHAR(50) NOT NULL CHECK (category IN ('Sports', 'Scooter', 'Commuter', 'Cruiser', 'Adventure', 'Naked')),
  specs VARCHAR(255) NOT NULL,
  engine_cc INTEGER,
  horsepower VARCHAR(50),
  torque VARCHAR(50),
  transmission VARCHAR(50),
  
  -- Image and media
  image_url TEXT,
  additional_images TEXT[],
  
  -- Detailed information
  description TEXT,
  features TEXT[],
  warranty VARCHAR(100),
  color VARCHAR(100),
  
  -- Availability and status
  availability BOOLEAN DEFAULT TRUE,
  stock_quantity INTEGER DEFAULT 0,
  year_model INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(name, brand_id)
);

-- ============================================
-- SECOND_HAND_BIKES TABLE - Pre-owned/used bikes
-- ============================================
CREATE TABLE second_hand_bikes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand_id INTEGER NOT NULL REFERENCES brands(id) ON DELETE RESTRICT,
  price VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Sports', 'Scooter', 'Commuter', 'Cruiser', 'Adventure', 'Naked')),
  specs VARCHAR(255) NOT NULL,
  engine_cc INTEGER,
  horsepower VARCHAR(50),
  
  -- Pre-owned specific details
  condition VARCHAR(50) NOT NULL CHECK (condition IN ('Excellent', 'Very Good', 'Good', 'Fair')),
  mileage VARCHAR(50),
  year_manufacture INTEGER,
  owner_count INTEGER,
  registration_number VARCHAR(50) NOT NULL,
  
  -- Image and media
  image_url TEXT,
  additional_images TEXT[],
  
  -- Detailed information
  description TEXT,
  features TEXT[],
  color VARCHAR(100),
  
  -- Availability and status
  availability BOOLEAN DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CREATE INDEXES for faster queries
-- ============================================
CREATE INDEX idx_bikes_brand_id ON bikes(brand_id);
CREATE INDEX idx_bikes_category ON bikes(category);
CREATE INDEX idx_bikes_name ON bikes(name);
CREATE INDEX idx_bikes_availability ON bikes(availability);

CREATE INDEX idx_second_hand_brand_id ON second_hand_bikes(brand_id);
CREATE INDEX idx_second_hand_category ON second_hand_bikes(category);
CREATE INDEX idx_second_hand_name ON second_hand_bikes(name);
CREATE INDEX idx_second_hand_availability ON second_hand_bikes(availability);

