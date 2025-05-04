-- Create trek_packing_items table
CREATE TABLE IF NOT EXISTS public.trek_packing_items (
    item_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    description TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trek_packing_lists table for associating items with treks
CREATE TABLE IF NOT EXISTS public.trek_packing_lists (
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL REFERENCES public.trek_packing_items(item_id) ON DELETE CASCADE,
    mandatory BOOLEAN DEFAULT false,
    PRIMARY KEY (trek_id, item_id)
);

-- Enable RLS on tables
ALTER TABLE public.trek_packing_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_packing_lists ENABLE ROW LEVEL SECURITY;

-- Set up policies for trek_packing_items
CREATE POLICY "Admin users can manage packing items"
ON public.trek_packing_items
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "All users can view packing items"
ON public.trek_packing_items
FOR SELECT
TO authenticated
USING (true);

-- Set up policies for trek_packing_lists
CREATE POLICY "Admins can manage packing lists"
ON public.trek_packing_lists
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Users can view packing lists for treks they're registered for"
ON public.trek_packing_lists
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_packing_lists.trek_id
        AND trek_registrations.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'
    )
);

CREATE POLICY "Admins can manage trek packing lists"
ON public.trek_packing_lists
FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'));

-- Remove redundant insert handled by migration 0007
/*
-- Add some default packing items
INSERT INTO public.trek_packing_items (name, category, is_default) VALUES
('Water Bottle', 'Essential', TRUE),
-- ... other items ...
ON CONFLICT (name) DO NOTHING;
*/ 