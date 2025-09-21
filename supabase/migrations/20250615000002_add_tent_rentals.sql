-- Migration: Add tent rental functionality for camping events
-- This allows users to request tent rentals and admins to manage tent inventory

BEGIN;

-- Create tent_types table to define available tent types
CREATE TABLE IF NOT EXISTS public.tent_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  description TEXT,
  rental_price_per_night DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tent_inventory table to track available tents per event
CREATE TABLE IF NOT EXISTS public.tent_inventory (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  tent_type_id INTEGER NOT NULL REFERENCES public.tent_types(id) ON DELETE CASCADE,
  total_available INTEGER NOT NULL DEFAULT 0 CHECK (total_available >= 0),
  reserved_count INTEGER NOT NULL DEFAULT 0 CHECK (reserved_count >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, tent_type_id)
);

-- Create tent_requests table to track user tent rental requests
CREATE TABLE IF NOT EXISTS public.tent_requests (
  id SERIAL PRIMARY KEY,
  event_id INTEGER NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tent_type_id INTEGER NOT NULL REFERENCES public.tent_types(id) ON DELETE CASCADE,
  quantity_requested INTEGER NOT NULL DEFAULT 1 CHECK (quantity_requested > 0),
  nights INTEGER NOT NULL DEFAULT 1 CHECK (nights > 0),
  total_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  request_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(event_id, user_id, tent_type_id)
);

-- Insert default tent types (2-person and 3-person)
INSERT INTO public.tent_types (name, capacity, description, rental_price_per_night) VALUES
('2-Person Tent', 2, 'Compact tent suitable for 2 people with basic weather protection', 500.00),
('3-Person Tent', 3, 'Spacious tent for 3 people with extra storage space', 750.00)
ON CONFLICT (name) DO NOTHING;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tent_inventory_event_id ON public.tent_inventory(event_id);
CREATE INDEX IF NOT EXISTS idx_tent_requests_event_user ON public.tent_requests(event_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tent_requests_status ON public.tent_requests(status);

-- Add comments
COMMENT ON TABLE public.tent_types IS 'Defines available tent types for rental';
COMMENT ON TABLE public.tent_inventory IS 'Tracks tent availability per event';
COMMENT ON TABLE public.tent_requests IS 'User requests for tent rentals';

-- Add RLS policies
ALTER TABLE public.tent_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tent_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tent_requests ENABLE ROW LEVEL SECURITY;

-- Tent types - readable by all authenticated users
CREATE POLICY "Anyone can view tent types" ON public.tent_types
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tent inventory - readable by all authenticated users
CREATE POLICY "Anyone can view tent inventory" ON public.tent_inventory
  FOR SELECT USING (auth.role() = 'authenticated');

-- Tent requests - users can manage their own requests
CREATE POLICY "Users can view their own tent requests" ON public.tent_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tent requests" ON public.tent_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pending tent requests" ON public.tent_requests
  FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admin policies for tent management
CREATE POLICY "Admins can manage tent types" ON public.tent_types
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage tent inventory" ON public.tent_inventory
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Admins can manage all tent requests" ON public.tent_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE user_id = auth.uid() AND user_type = 'admin'
    )
  );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tent_types_updated_at BEFORE UPDATE ON public.tent_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tent_inventory_updated_at BEFORE UPDATE ON public.tent_inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tent_requests_updated_at BEFORE UPDATE ON public.tent_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
