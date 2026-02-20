-- ============================================
-- RR Motors Bike Showroom - Sample Data Population
-- Run this in Supabase SQL Editor to populate sample data
-- ============================================

-- Clear existing data (careful with this!)
-- DELETE FROM second_hand_bikes;
-- DELETE FROM bikes;
-- DELETE FROM brands;

-- ============================================
-- INSERT SAMPLE BRANDS
-- ============================================
INSERT INTO brands (name, description, country, founded_year, active)
VALUES
  ('Velocity', 'High-performance sports bikes', 'Japan', 2010, TRUE),
  ('Thunder', 'Classic and modern cruisers', 'USA', 2005, TRUE),
  ('Urban', 'City commuter scooters', 'India', 2015, TRUE),
  ('Trail Master', 'Adventure and off-road bikes', 'Germany', 2008, TRUE),
  ('Street Fighter', 'Aggressive naked bikes', 'Italy', 2012, TRUE)
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE NEW BIKES
-- ============================================
INSERT INTO bikes (name, brand_id, price, category, specs, engine_cc, horsepower, description, features, availability, stock_quantity, year_model)
SELECT 'Velocity R1000', id, '₹12,50,000', 'Sports', '1000cc | 180 HP', 1000, '180', 
  'High-performance sports bike with cutting-edge technology. Perfect for speed enthusiasts.',
  ARRAY['ABS System', 'Traction Control', 'Cruise Control', 'LED Lighting', 'Digital Dash', 'Keyless Start'],
  TRUE, 5, 2024
FROM brands WHERE name = 'Velocity'
ON CONFLICT DO NOTHING;

INSERT INTO bikes (name, brand_id, price, category, specs, engine_cc, horsepower, description, features, availability, stock_quantity, year_model)
SELECT 'Thunder Cruiser 650', id, '₹8,75,000', 'Cruiser', '650cc | 75 HP', 650, '75',
  'Classic cruiser design with modern comfort. Ideal for long rides.',
  ARRAY['Classic Styling', 'Comfortable Seating', 'Premium Comfort', 'Retro Look'],
  TRUE, 3, 2024
FROM brands WHERE name = 'Thunder'
ON CONFLICT DO NOTHING;

INSERT INTO bikes (name, brand_id, price, category, specs, engine_cc, horsepower, description, features, availability, stock_quantity, year_model)
SELECT 'Urban Glide 125', id, '₹95,000', 'Scooter', '125cc | 9 HP', 125, '9',
  'Automatic city commuter scooter. Perfect for daily urban commuting.',
  ARRAY['Automatic Transmission', 'Storage Space', 'Fuel Efficient', 'Easy Parking'],
  TRUE, 10, 2024
FROM brands WHERE name = 'Urban'
ON CONFLICT DO NOTHING;

INSERT INTO bikes (name, brand_id, price, category, specs, engine_cc, horsepower, description, features, availability, stock_quantity, year_model)
SELECT 'Trail Master Adventure 500', id, '₹7,25,000', 'Adventure', '500cc | 60 HP', 500, '60',
  'Adventure bike for off-road and highway exploration.',
  ARRAY['Off-road Capability', 'Long Travel Suspension', 'Versatile Design'],
  TRUE, 4, 2024
FROM brands WHERE name = 'Trail Master'
ON CONFLICT DO NOTHING;

INSERT INTO bikes (name, brand_id, price, category, specs, engine_cc, horsepower, description, features, availability, stock_quantity, year_model)
SELECT 'Street Fighter Z 800', id, '₹9,25,000', 'Naked', '800cc | 110 HP', 800, '110',
  'Aggressive naked bike with raw performance.',
  ARRAY['Aggressive Styling', 'High Performance', 'Lightweight Frame', 'Quick Handling'],
  TRUE, 2, 2024
FROM brands WHERE name = 'Street Fighter'
ON CONFLICT DO NOTHING;

-- ============================================
-- INSERT SAMPLE SECOND-HAND BIKES
-- ============================================
INSERT INTO second_hand_bikes (name, brand_id, price, category, specs, engine_cc, horsepower, condition, mileage, year_manufacture, owner_count, description, features, availability)
SELECT 'Thunder Cruiser 650 - Used', id, '₹6,50,000', 'Cruiser', '650cc | 75 HP', 650, '75',
  'Excellent', '5000 km', 2023, 1,
  'Well-maintained second-hand cruiser with minimal usage.',
  ARRAY['Classic Styling', 'Comfortable Seating', 'Well Maintained'],
  TRUE
FROM brands WHERE name = 'Thunder'
ON CONFLICT DO NOTHING;

INSERT INTO second_hand_bikes (name, brand_id, price, category, specs, engine_cc, horsepower, condition, mileage, year_manufacture, owner_count, description, features, availability)
SELECT 'Urban Glide 125 - Used', id, '₹65,000', 'Scooter', '125cc | 9 HP', 125, '9',
  'Very Good', '15000 km', 2022, 2,
  'Reliable commuter scooter, perfect for daily use.',
  ARRAY['Automatic Transmission', 'Storage Space', 'Fuel Efficient'],
  TRUE
FROM brands WHERE name = 'Urban'
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY DATA
-- ============================================
-- Run these queries to verify data was inserted:
-- SELECT COUNT(*) as brand_count FROM brands;
-- SELECT COUNT(*) as bike_count FROM bikes;
-- SELECT COUNT(*) as second_hand_count FROM second_hand_bikes;

-- SELECT b.name, br.name as brand, b.price, b.category FROM bikes b JOIN brands br ON b.brand_id = br.id;
