-- Drop existing restrictive policies and create more permissive ones for trek_costs

-- Drop existing policies
DROP POLICY IF EXISTS "Admin users can manage all trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Trek creators can manage their trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Registered users can view trek costs" ON public.trek_costs;
DROP POLICY IF EXISTS "Users can view costs for open treks" ON public.trek_costs;

-- Create new, more permissive policies

-- Admin users can do everything
CREATE POLICY "Admin full access to trek costs" ON public.trek_costs
    FOR ALL 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND user_type = 'admin'
        )
    );

-- Trek creators can manage costs for their treks (more flexible check)
CREATE POLICY "Trek creators can manage trek costs" ON public.trek_costs
    FOR ALL 
    TO authenticated
    USING (
        -- Allow if user is admin OR if they created the trek
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND user_type = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.trek_events 
            WHERE trek_events.trek_id = trek_costs.trek_id 
            AND trek_events.created_by = auth.uid()
        )
    );

-- All authenticated users can view costs (for transparency)
CREATE POLICY "Authenticated users can view trek costs" ON public.trek_costs
    FOR SELECT 
    TO authenticated
    USING (true);

-- Additional policy: Allow inserting costs for new treks (during creation)
CREATE POLICY "Allow cost insertion for authenticated users" ON public.trek_costs
    FOR INSERT 
    TO authenticated
    WITH CHECK (
        -- Allow if user is admin OR if they are creating costs for a trek they created
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND user_type = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.trek_events 
            WHERE trek_events.trek_id = trek_costs.trek_id 
            AND trek_events.created_by = auth.uid()
        )
    );

-- Allow deletion for trek creators and admins
CREATE POLICY "Allow cost deletion for creators and admins" ON public.trek_costs
    FOR DELETE 
    TO authenticated
    USING (
        -- Allow if user is admin OR if they created the trek
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE user_id = auth.uid() 
            AND user_type = 'admin'
        )
        OR
        EXISTS (
            SELECT 1 FROM public.trek_events 
            WHERE trek_events.trek_id = trek_costs.trek_id 
            AND trek_events.created_by = auth.uid()
        )
    ); 