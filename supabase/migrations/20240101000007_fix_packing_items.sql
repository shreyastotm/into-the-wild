-- Create trek_packing_items table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.trek_packing_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default packing items
INSERT INTO public.trek_packing_items (name, category) VALUES
('Water Bottle', 'Essential'),
('Hiking Boots', 'Footwear'),
('Rain Jacket', 'Clothing'),
('Backpack', 'Essential'),
('Snacks', 'Food'),
('First Aid Kit', 'Safety'),
('Sunscreen', 'Health'),
('Hat', 'Clothing'),
('Insect Repellent', 'Health'),
('Map/Compass', 'Navigation')
ON CONFLICT (item_id) DO NOTHING; -- Use item_id for conflict target if it's guaranteed unique by sequence

-- Set up RLS policies
ALTER TABLE public.trek_packing_items ENABLE ROW LEVEL SECURITY;

-- Packing items access
CREATE POLICY "Anyone can view packing items"
ON public.trek_packing_items
FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage packing items
CREATE POLICY "Admins can manage packing items"
ON public.trek_packing_items
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')); 