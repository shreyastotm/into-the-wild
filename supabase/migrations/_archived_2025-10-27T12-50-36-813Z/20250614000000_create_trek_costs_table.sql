-- Create trek_costs table
CREATE TABLE IF NOT EXISTS public.trek_costs (
    id BIGSERIAL PRIMARY KEY,
    trek_id BIGINT NOT NULL REFERENCES public.trek_events(trek_id) ON DELETE CASCADE,
    cost_type TEXT NOT NULL CHECK (cost_type IN ('ACCOMMODATION', 'TICKETS', 'LOCAL_VEHICLE', 'GUIDE', 'OTHER')),
    description TEXT,
    amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    url TEXT,
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for efficient lookups by trek_id
CREATE INDEX IF NOT EXISTS idx_trek_costs_trek_id ON public.trek_costs(trek_id);

-- Create index for cost type filtering
CREATE INDEX IF NOT EXISTS idx_trek_costs_cost_type ON public.trek_costs(cost_type);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trek_costs_updated_at 
    BEFORE UPDATE ON public.trek_costs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.trek_costs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Admin users can manage all trek costs
CREATE POLICY "Admin users can manage all trek costs" ON public.trek_costs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Trek creators can manage costs for their treks
CREATE POLICY "Trek creators can manage their trek costs" ON public.trek_costs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.trek_events 
            WHERE trek_events.trek_id = trek_costs.trek_id 
            AND trek_events.created_by = auth.uid()
        )
    );

-- Registered users can view costs for treks they're registered for
CREATE POLICY "Registered users can view trek costs" ON public.trek_costs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trek_registrations 
            WHERE trek_registrations.trek_id = trek_costs.trek_id 
            AND trek_registrations.user_id = auth.uid()
            AND trek_registrations.payment_status != 'Cancelled'
        )
    );

-- All authenticated users can view costs for open treks
CREATE POLICY "Users can view costs for open treks" ON public.trek_costs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.trek_events 
            WHERE trek_events.trek_id = trek_costs.trek_id 
            AND trek_events.status IN ('upcoming', 'open_for_registration')
        )
        AND auth.uid() IS NOT NULL
    ); 