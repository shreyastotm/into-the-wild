-- This migration fixes the foreign key relationships in the transport coordination tables

-- Ensure trek_registrations has a proper user_id foreign key 
ALTER TABLE IF EXISTS public.trek_registrations 
DROP CONSTRAINT IF EXISTS trek_registrations_user_id_fkey,
ADD CONSTRAINT trek_registrations_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop dependent policies and tables in reverse order of creation
DROP POLICY IF EXISTS "Admins can manage driver assignments" ON public.trek_driver_assignments;
DROP POLICY IF EXISTS "Users can view their own assignments" ON public.trek_driver_assignments;
DROP TABLE IF EXISTS public.trek_driver_assignments CASCADE;

DROP POLICY IF EXISTS "Admins can manage pickup locations" ON public.trek_pickup_locations;
DROP POLICY IF EXISTS "Anyone can view pickup locations for treks they're registered for" ON public.trek_pickup_locations;
DROP TABLE IF EXISTS public.trek_pickup_locations CASCADE;

DROP POLICY IF EXISTS "Admins can delete drivers" ON public.trek_drivers;
DROP POLICY IF EXISTS "Admins can update drivers" ON public.trek_drivers;
DROP POLICY IF EXISTS "Admins can insert drivers" ON public.trek_drivers;
DROP POLICY IF EXISTS "Admin can view all drivers" ON public.trek_drivers;
DROP TABLE IF EXISTS public.trek_drivers CASCADE; -- Drop the drivers table completely first

-- Re-create trek_drivers table ensuring driver_id is present
CREATE TABLE public.trek_drivers (
    driver_id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    vehicle_info TEXT NOT NULL,
    seating_capacity INTEGER NOT NULL DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Re-create trek_pickup_locations table
CREATE TABLE public.trek_pickup_locations (
    location_id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    coordinates VARCHAR(255),
    time VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Re-create trek_driver_assignments table (now referencing the newly created trek_drivers)
CREATE TABLE public.trek_driver_assignments (
    assignment_id SERIAL PRIMARY KEY,
    trek_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    driver_id INTEGER NOT NULL REFERENCES public.trek_drivers(driver_id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pickup_location_id INTEGER NOT NULL REFERENCES public.trek_pickup_locations(location_id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_assignment_status CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- Set up RLS policies AFTER tables are created
ALTER TABLE public.trek_drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_pickup_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trek_driver_assignments ENABLE ROW LEVEL SECURITY;

-- Re-create view policies for drivers
CREATE POLICY "Admin can view all drivers"
ON public.trek_drivers
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
    OR EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_drivers.trek_id
        AND trek_registrations.user_id = auth.uid()
        AND trek_registrations.payment_status != 'Cancelled'
    )
);

-- Re-create policies for pickup locations
CREATE POLICY "Anyone can view pickup locations for treks they're registered for"
ON public.trek_pickup_locations
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.trek_registrations
        WHERE trek_registrations.trek_id = trek_pickup_locations.trek_id
        AND trek_registrations.user_id = auth.uid()
        AND trek_registrations.payment_status != 'Cancelled'
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- Re-create policies for driver assignments
CREATE POLICY "Users can view their own assignments"
ON public.trek_driver_assignments
FOR SELECT
TO authenticated
USING (
    participant_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM public.trek_drivers
        WHERE trek_drivers.driver_id = trek_driver_assignments.driver_id -- Reference should now be valid
        AND trek_drivers.user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- Re-create Admin CRUD policies
CREATE POLICY "Admins can insert drivers"
ON public.trek_drivers
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Admins can update drivers"
ON public.trek_drivers
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Admins can delete drivers"
ON public.trek_drivers
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

-- Re-create similar policies for pickup locations and assignments
CREATE POLICY "Admins can manage pickup locations"
ON public.trek_pickup_locations
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
);

CREATE POLICY "Admins can manage driver assignments"
ON public.trek_driver_assignments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.user_id = auth.uid() AND users.user_type = 'admin'
    )
); 