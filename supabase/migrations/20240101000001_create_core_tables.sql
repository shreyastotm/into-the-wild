-- supabase/migrations/20240101000001_create_core_tables.sql

-- Create the public.users table to store profile information linked to auth.users
CREATE TABLE IF NOT EXISTS public.users (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    phone_number TEXT UNIQUE,
    user_type TEXT DEFAULT 'participant' NOT NULL CHECK (user_type IN ('participant', 'admin', 'guide')), -- Added CHECK constraint
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow users to update their own profile (name, phone)
CREATE POLICY "Users can update their own profile"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow admins to manage all user profiles
CREATE POLICY "Admins can manage user profiles"
ON public.users FOR ALL -- SELECT, INSERT, UPDATE, DELETE
TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'));


-- Create the trek_events table
CREATE TABLE IF NOT EXISTS public.trek_events (
    trek_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    difficulty VARCHAR(50),
    max_participants INTEGER,
    base_price DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'planned', -- e.g., planned, confirmed, ongoing, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT check_dates CHECK (end_datetime >= start_datetime),
    CONSTRAINT check_status CHECK (status IN ('planned', 'confirmed', 'ongoing', 'completed', 'cancelled'))
);
ALTER TABLE public.trek_events ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all trek events
CREATE POLICY "Trek events are viewable by authenticated users"
ON public.trek_events FOR SELECT
TO authenticated
USING (true);

-- Allow admins to manage trek events
CREATE POLICY "Admins can manage trek events"
ON public.trek_events FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin'));


-- Function to update the updated_at timestamp (might be duplicated, but safe)
CREATE OR REPLACE FUNCTION public.update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER set_updated_at_on_users
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column();

-- Trigger for trek_events table
CREATE TRIGGER set_updated_at_on_trek_events
BEFORE UPDATE ON public.trek_events
FOR EACH ROW EXECUTE FUNCTION public.update_modified_column(); 