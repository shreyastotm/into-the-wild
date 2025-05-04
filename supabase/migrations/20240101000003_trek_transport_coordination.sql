-- Create trek_drivers table
CREATE TABLE IF NOT EXISTS public.trek_drivers (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50),
    vehicle_name VARCHAR(100),
    registration_number VARCHAR(50),
    seats_available INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trek_id, user_id)
);

-- Create trek_pickup_locations table
CREATE TABLE IF NOT EXISTS public.trek_pickup_locations (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 6),
    longitude DECIMAL(10, 6),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add pickup_location_id to trek_registrations
ALTER TABLE public.trek_registrations 
ADD COLUMN IF NOT EXISTS pickup_location_id INTEGER REFERENCES public.trek_pickup_locations(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_driver BOOLEAN DEFAULT FALSE;

-- Create trek_driver_assignments table
CREATE TABLE IF NOT EXISTS public.trek_driver_assignments (
    id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    driver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pickup_status VARCHAR(20) DEFAULT 'pending',
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(trek_id, driver_id, participant_id),
    CONSTRAINT valid_pickup_status CHECK (pickup_status IN ('pending', 'confirmed', 'picked_up', 'cancelled'))
);

-- Create RLS policies
ALTER TABLE public.trek_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_driver_assignments ENABLE ROW LEVEL SECURITY;

-- RLS policies for trek_drivers
CREATE POLICY "Trek drivers are viewable by all authenticated users"
ON public.trek_drivers
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Trek drivers can be inserted by admins"
ON public.trek_drivers
FOR INSERT
TO authenticated
WITH CHECK (EXISTS (
    SELECT 1 FROM public.users
    WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
));

CREATE POLICY "Trek drivers can be updated by admins or the driver themselves"
ON public.trek_drivers
FOR UPDATE
TO authenticated
USING (
    auth.uid() = user_id OR
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- RLS policies for trek_pickup_locations
CREATE POLICY "Trek pickup locations are viewable by all authenticated users"
ON public.trek_pickup_locations
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Trek pickup locations can be managed by admins"
ON public.trek_pickup_locations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- RLS policies for trek_driver_assignments
CREATE POLICY "Trek driver assignments are viewable by all authenticated users"
ON public.trek_driver_assignments
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Trek driver assignments can be managed by admins"
ON public.trek_driver_assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Trek driver assignments status can be updated by the driver"
ON public.trek_driver_assignments
FOR UPDATE
TO authenticated
USING (auth.uid() = driver_id); -- <<< ADD SEMICOLON HERE

-- WITH CHECK ( -- <<< Commented out start
--     auth.uid() = driver_id AND
--     (
--         NEW.pickup_status = OLD.pickup_status OR
--         NEW.pickup_status IN ('pending', 'confirmed', 'picked_up', 'cancelled')
--     )
-- ); -- <<< Commented out end

-- Create function to update timestamp on update
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at on tables
CREATE TRIGGER set_updated_at_on_trek_drivers
BEFORE UPDATE ON public.trek_drivers
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_updated_at_on_trek_pickup_locations
BEFORE UPDATE ON public.trek_pickup_locations
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER set_updated_at_on_trek_driver_assignments
BEFORE UPDATE ON public.trek_driver_assignments
FOR EACH ROW EXECUTE FUNCTION update_modified_column(); 