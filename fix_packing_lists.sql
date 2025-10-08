-- Fix packing lists issues
-- 1. Insert master packing items if they don't exist
-- 2. Fix mandatory field in assignments

-- First, check if master_packing_items table exists and has data
-- If not, insert the master items
INSERT INTO public.master_packing_items (name, category) VALUES
-- Clothing
('Trekking Shoes', 'Clothing'),
('Quick-dry T-shirts', 'Clothing'),
('Trekking Pants', 'Clothing'),
('Rain Jacket', 'Clothing'),
('Warm Jacket/Fleece', 'Clothing'),
('Hat/Cap', 'Clothing'),
('Sunglasses', 'Clothing'),
('Extra Socks', 'Clothing'),
('Extra Underwear', 'Clothing'),
('Gaiters', 'Clothing'),

-- Gear & Equipment
('Backpack', 'Gear & Equipment'),
('Sleeping Bag', 'Gear & Equipment'),
('Trekking Poles', 'Gear & Equipment'),
('Headlamp', 'Gear & Equipment'),
('Water Bottles', 'Gear & Equipment'),
('Water Purification Tablets', 'Gear & Equipment'),
('Multi-tool/Knife', 'Gear & Equipment'),
('Rope (if needed)', 'Gear & Equipment'),
('Carabiners', 'Gear & Equipment'),
('Emergency Whistle', 'Gear & Equipment'),

-- Personal Care
('Sunscreen', 'Personal Care'),
('Insect Repellent', 'Personal Care'),
('Personal Toiletries', 'Personal Care'),
('Toilet Paper', 'Personal Care'),
('Hand Sanitizer', 'Personal Care'),
('Toothbrush & Toothpaste', 'Personal Care'),
('Personal Medication', 'Personal Care'),
('Lip Balm', 'Personal Care'),

-- Food & Nutrition
('Energy Bars', 'Food & Nutrition'),
('Dry Fruits & Nuts', 'Food & Nutrition'),
('Electrolyte Supplements', 'Food & Nutrition'),
('Instant Noodles', 'Food & Nutrition'),
('Glucose/Energy Drinks', 'Food & Nutrition'),

-- Safety & Navigation
('First Aid Kit', 'Safety & Navigation'),
('Maps & Compass', 'Safety & Navigation'),
('GPS Device', 'Safety & Navigation'),
('Emergency Contact List', 'Safety & Navigation'),
('Identity Documents', 'Safety & Navigation'),

-- Electronics
('Mobile Phone', 'Electronics'),
('Power Bank', 'Electronics'),
('Charging Cables', 'Electronics'),
('Camera', 'Electronics'),
('Emergency Radio', 'Electronics'),

-- Camping (if overnight)
('Tent', 'Camping'),
('Sleeping Mat', 'Camping'),
('Camping Stove', 'Camping'),
('Cooking Utensils', 'Camping'),
('Plates & Bowls', 'Camping'),
('Garbage Bags', 'Camping'),

-- Miscellaneous
('Plastic Bags', 'Miscellaneous'),
('Duct Tape', 'Miscellaneous'),
('Notebook & Pen', 'Miscellaneous'),
('Extra Batteries', 'Miscellaneous'),
('Matches/Lighter', 'Miscellaneous')

ON CONFLICT (name) DO NOTHING;

-- Fix mandatory field - set some items as mandatory for existing assignments
-- Make essential items mandatory
UPDATE public.trek_packing_list_assignments 
SET mandatory = true 
WHERE master_item_id IN (
  SELECT id FROM public.master_packing_items 
  WHERE name IN (
    'Trekking Shoes',
    'Backpack', 
    'First Aid Kit',
    'Water Bottles',
    'Headlamp',
    'Mobile Phone'
  )
);

-- Set remaining items as non-mandatory
UPDATE public.trek_packing_list_assignments 
SET mandatory = false 
WHERE mandatory IS NULL;

-- Verify the fix
SELECT 
  COUNT(*) as total_assignments,
  COUNT(CASE WHEN mandatory = true THEN 1 END) as mandatory_items,
  COUNT(CASE WHEN mandatory = false THEN 1 END) as optional_items
FROM public.trek_packing_list_assignments;
