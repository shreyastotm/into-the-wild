-- supabase/seed.sql

-- Seed Trek Expense Categories (from your squashed schema)
INSERT INTO public.trek_expense_categories (name, description, icon)
VALUES
    ('Food', 'Meals, snacks, groceries, etc.', 'utensils'),
    ('Transport', 'Fuel, tolls, parking, etc.', 'car'),
    ('Accommodation', 'Hotel, camping, homestay charges', 'home'),
    ('Activities', 'Tickets, rentals, guides, etc.', 'map'),
    ('Equipment', 'Gear rentals, purchases, etc.', 'tool'),
    ('Tickets', 'Entry tickets, permits, etc.', 'ticket'), 
    ('Stay', 'Fixed accommodation cost added by admin', 'bed'),
    ('Misc', 'Other uncategorized expenses', 'package')
ON CONFLICT (name) DO NOTHING;

-- Seed Master Packing Items (example)
INSERT INTO public.master_packing_items (name, category) VALUES
('Hiking Boots', 'Footwear'),
('Backpack (50L)', 'Gear'),
('Tent', 'Shelter'),
('Sleeping Bag', 'Shelter'),
('Water Bottle', 'Essentials'),
('Headlamp', 'Essentials'),
('First Aid Kit', 'Safety')
ON CONFLICT (name) DO NOTHING;

-- Example of seeding a user registration for testing participant counts
-- This requires knowing a trek_id that will be created by the above INSERTs.
-- And a user_id from your auth.users table (you might need to create a test user manually first via UI/auth functions)
-- For example, if Kudremukh Trek Seeded gets trek_id=1 (if table is empty before seed) and you have a test user UUID:
-- INSERT INTO public.trek_registrations (user_id, trek_id, payment_status)
-- VALUES ('your-test-user-uuid', (SELECT trek_id FROM public.trek_events WHERE name = 'Kudremukh Trek Seeded'), 'Paid'); 