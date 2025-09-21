-- Verify and ensure trek_costs table exists
DO $$
BEGIN
    -- Check if the table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trek_costs') THEN
        -- Create the table if it doesn't exist
        CREATE TABLE public.trek_costs (
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

        -- Create indexes
        CREATE INDEX idx_trek_costs_trek_id ON public.trek_costs(trek_id);
        CREATE INDEX idx_trek_costs_cost_type ON public.trek_costs(cost_type);

        -- Enable RLS
        ALTER TABLE public.trek_costs ENABLE ROW LEVEL SECURITY;

        -- Create policies
        CREATE POLICY "Admin users can manage all trek costs" ON public.trek_costs
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.users 
                    WHERE user_id = auth.uid() 
                    AND user_type = 'admin'
                )
            );

        CREATE POLICY "Trek creators can manage their trek costs" ON public.trek_costs
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.trek_events 
                    WHERE trek_events.trek_id = trek_costs.trek_id 
                    AND trek_events.created_by = auth.uid()
                )
            );

        CREATE POLICY "Registered users can view trek costs" ON public.trek_costs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.trek_registrations 
                    WHERE trek_registrations.trek_id = trek_costs.trek_id 
                    AND trek_registrations.user_id = auth.uid()
                    AND trek_registrations.payment_status != 'Cancelled'
                )
            );

        CREATE POLICY "Users can view costs for open treks" ON public.trek_costs
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.trek_events 
                    WHERE trek_events.trek_id = trek_costs.trek_id 
                    AND trek_events.status IN ('upcoming', 'open_for_registration')
                )
                AND auth.uid() IS NOT NULL
            );

        RAISE NOTICE 'trek_costs table created successfully';
    ELSE
        RAISE NOTICE 'trek_costs table already exists';
    END IF;
END
$$; 