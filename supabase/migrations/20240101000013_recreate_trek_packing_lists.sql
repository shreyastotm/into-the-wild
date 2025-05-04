-- Drop existing table and constraints if they exist
-- Note: CASCADE might drop dependent objects; review if needed.
DROP TABLE IF EXISTS public.trek_packing_lists CASCADE;

-- Recreate trek_packing_lists as a proper join table
CREATE TABLE public.trek_packing_lists (
    trek_id INTEGER NOT NULL 
        REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    item_id INTEGER NOT NULL 
        REFERENCES public.trek_packing_items(item_id) ON DELETE CASCADE,
    mandatory BOOLEAN DEFAULT false,
    item_order INTEGER DEFAULT 0, -- Optional: for ordering within a trek's list
    
    -- Define the composite primary key
    PRIMARY KEY (trek_id, item_id) 
);

-- Add comments for clarity
COMMENT ON TABLE public.trek_packing_lists IS 'Join table linking treks to specific items from the master packing list.';
COMMENT ON COLUMN public.trek_packing_lists.trek_id IS 'Foreign key referencing the trek event.';
COMMENT ON COLUMN public.trek_packing_lists.item_id IS 'Foreign key referencing the master packing item.';
COMMENT ON COLUMN public.trek_packing_lists.mandatory IS 'Indicates if the item is mandatory for this specific trek.';
COMMENT ON COLUMN public.trek_packing_lists.item_order IS 'Optional ordering for items within a specific trek''s list.';

-- Enable Row Level Security
ALTER TABLE public.trek_packing_lists ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view lists for treks they are registered for
CREATE POLICY "Users can view packing lists for their registered treks"
ON public.trek_packing_lists
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.trek_registrations reg
        WHERE reg.trek_id = trek_packing_lists.trek_id
          AND reg.user_id = auth.uid()
          -- AND reg.payment_status <> 'Cancelled' -- Removed dependency
    )
    OR EXISTS ( -- Allow admins to view all
        SELECT 1 FROM public.users u WHERE u.user_id = auth.uid() AND u.user_type = 'admin'
    )
);

-- Allow admins to manage all packing list entries
CREATE POLICY "Admins can manage packing lists"
ON public.trek_packing_lists
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- Optionally, allow authenticated users read-only access to all lists? 
-- (Uncomment if needed, review security implications)
-- CREATE POLICY "Authenticated users can view all packing lists"
-- ON public.trek_packing_lists
-- FOR SELECT
-- TO authenticated
-- USING (true); 